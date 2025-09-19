
const fs = require("uxp").storage.localFileSystem;
const app = require("premierepro");
const constants = require("premierepro").Constants;

const {BLEND_MODES, TRACK_TYPE } = require("./consts.js")

const {
    _getSequenceFromId,
    _setActiveSequence,
    setParam,
    getParam,
    addEffect,
    findProjectItem,
    execute,
    getTrack,
    getTrackItems
} = require("./utils.js")

const saveProject = async (command) => {
    let project = await app.Project.getActiveProject()

    project.save()
}

const saveProjectAs = async (command) => {
    let project = await app.Project.getActiveProject()

    const options = command.options;
    const filePath = options.filePath;

    project.saveAs(filePath)
}

const openProject = async (command) => {

    const options = command.options;
    const filePath = options.filePath;

    await app.Project.open(filePath);    
}


const importMedia = async (command) => {

    let options = command.options
    let paths = command.options.filePaths

    let project = await app.Project.getActiveProject()

    let root = await project.getRootItem()
    let originalItems = await root.getItems()

    //import everything into root
    let rootFolderItems = await project.getRootItem()


    let success = await project.importFiles(paths, true, rootFolderItems)
    //TODO: what is not success?

    let updatedItems = await root.getItems()
    
    const addedItems = updatedItems.filter(
        updatedItem => !originalItems.some(originalItem => originalItem.name === updatedItem.name)
      );
      
    let addedProjectItems = [];
    for (const p of addedItems) { 
        addedProjectItems.push({ name: p.name });
    }
    
    return { addedProjectItems };
}


//note: right now, we just always add to the active sequence. Need to add support
//for specifying sequence
const addMediaToSequence = async (command) => {

    let options = command.options
    let itemName = options.itemName
    let id = options.sequenceId

    let project = await app.Project.getActiveProject()
    let sequence = await _getSequenceFromId(id)

    let insertItem = await findProjectItem(itemName, project)

    let editor = await app.SequenceEditor.getEditor(sequence)
  
    const insertionTime = await app.TickTime.createWithTicks(options.insertionTimeTicks.toString());
    const videoTrackIndex = options.videoTrackIndex
    const audioTrackIndex = options.audioTrackIndex
  
    //not sure what this does
    const limitShift = false

    //let f = ((options.overwrite) ? editor.createOverwriteItemAction : editor.createInsertProjectItemAction).bind(editor)
    //let action = f(insertItem, insertionTime, videoTrackIndex, audioTrackIndex, limitShift)
    execute(() => {
        let action = editor.createOverwriteItemAction(insertItem, insertionTime, videoTrackIndex, audioTrackIndex)
        return [action]
    }, project)  
}


const setAudioTrackMute = async (command) => {

    let options = command.options
    let id = options.sequenceId

    let sequence = await _getSequenceFromId(id)

    let track = await sequence.getTrack(options.audioTrackIndex, TRACK_TYPE.AUDIO)
    track.setMute(options.mute)
}



const setVideoClipProperties = async (command) => {

    const options = command.options
    let id = options.sequenceId

    let project = await app.Project.getActiveProject()
    let sequence = await _getSequenceFromId(id)

    if(!sequence) {
        throw new Error(`setVideoClipProperties : Requires an active sequence.`)
    }

    let trackItem = await getTrack(sequence, options.videoTrackIndex, options.trackItemIndex, TRACK_TYPE.VIDEO)

    let opacityParam = await getParam(trackItem, "AE.ADBE Opacity", "Opacity")
    let opacityKeyframe = await opacityParam.createKeyframe(options.opacity)

    let blendModeParam = await getParam(trackItem, "AE.ADBE Opacity", "Blend Mode")

    let mode = BLEND_MODES[options.blendMode.toUpperCase()]
    let blendModeKeyframe = await blendModeParam.createKeyframe(mode)

    execute(() => {
        let opacityAction = opacityParam.createSetValueAction(opacityKeyframe);
        let blendModeAction = blendModeParam.createSetValueAction(blendModeKeyframe);
        return [opacityAction, blendModeAction]
    }, project)

    // /AE.ADBE Opacity
    //Opacity
    //Blend Mode

}

const appendVideoFilter = async (command) => {

    let options = command.options
    let id = options.sequenceId

    let sequence = await _getSequenceFromId(id)

    if(!sequence) {
        throw new Error(`appendVideoFilter : Requires an active sequence.`)
    }

    let trackItem = await getTrackTrack(sequence, options.videoTrackIndex, options.trackItemIndex, TRACK_TYPE.VIDEO)

    let effectName = options.effectName
    let properties = options.properties

    let d = await addEffect(trackItem, effectName)

    for(const p of properties) {
        console.log(p.value)
        await setParam(trackItem, effectName, p.name, p.value)
    }
}


const setActiveSequence = async (command) => {
    let options = command.options
    let id = options.sequenceId

    let sequence = await _getSequenceFromId(id)

    await _setActiveSequence(sequence)
}

const createProject = async (command) => {

    let options = command.options
    let path = options.path
    let name = options.name

    if (!path.endsWith('/')) {
        path = path + '/';
    }

    //todo: this will open a dialog if directory doesnt exist
    let project = await app.Project.createProject(`${path}${name}.prproj`) 


    if(!project) {
        throw new Error("createProject : Could not create project. Check that the directory path exists and try again.")
    }

    //create a default sequence and set it as active
    //let sequence = await project.createSequence("default")
    //await project.setActiveSequence(sequence)
}


const _exportFrame = async (sequence, filePath, seconds) => {

    const fileType = filePath.split('.').pop()

    let size = await sequence.getFrameSize()

    let p = window.path.parse(filePath)
    let t = app.TickTime.createWithSeconds(seconds)

    let out = await app.Exporter.exportSequenceFrame(sequence, t, p.base, p.dir, size.width, size.height)

    let ps = `${p.dir}${window.path.sep}${p.base}`
    let outPath = `${ps}.${fileType}`

    if(!out) {
        throw new Error(`exportFrame : Could not save frame to [${outPath}]`);
    }

    return outPath
}

const exportFrame = async (command) => {
    const options = command.options;
    let id = options.sequenceId;
    let filePath = options.filePath;
    let seconds = options.seconds;

    let sequence = await _getSequenceFromId(id);

    const outPath = await _exportFrame(sequence, filePath, seconds);

    return {"filePath": outPath}
}

const setClipDisabled = async (command) => {

    const options = command.options;
    const id = options.sequenceId;
    const trackIndex = options.trackIndex;
    const trackItemIndex = options.trackItemIndex;
    const trackType = options.trackType;

    let project = await app.Project.getActiveProject()
    let sequence = await _getSequenceFromId(id)

    if(!sequence) {
        throw new Error(`setClipDisabled : Requires an active sequence.`)
    }

    let trackItem = await getTrack(sequence, trackIndex, trackItemIndex, trackType)

    execute(() => {
        let action = trackItem.createSetDisabledAction(options.disabled)
        return [action]
    }, project)

}


const appendVideoTransition = async (command) => {

    let options = command.options
    let id = options.sequenceId

    let project = await app.Project.getActiveProject()
    let sequence = await _getSequenceFromId(id)

    if(!sequence) {
        throw new Error(`appendVideoTransition : Requires an active sequence.`)
    }

    let trackItem = await getTrack(sequence, options.videoTrackIndex, options.trackItemIndex,TRACK_TYPE.VIDEO)

    let transition = await app.TransitionFactory.createVideoTransition(options.transitionName);

    let transitionOptions = new app.AddTransitionOptions()
    transitionOptions.setApplyToStart(false)

    const time = await app.TickTime.createWithSeconds(options.duration)
    transitionOptions.setDuration(time)
    transitionOptions.setTransitionAlignment(options.clipAlignment)

    execute(() => {
        let action = trackItem.createAddVideoTransitionAction(transition, transitionOptions)
        return [action]
    }, project)
}


const getProjectInfo = async (command) => {
    return {}
}

const exploreClipProperties = async (command) => {
    let options = command.options
    let id = options.sequenceId
    let sequence = await _getSequenceFromId(id)

    let trackItem = await getTrack(sequence, options.videoTrackIndex, options.trackItemIndex, TRACK_TYPE.VIDEO)

    console.log("=== Exploring clip properties ===")
    console.log("Clip name:", trackItem.name)

    let foundInfo = {
        clipName: trackItem.name,
        components: []
    }

    // Get all components (effects) on the clip using the correct API
    try {
        let componentChain = await trackItem.getComponentChain()
        let componentCount = componentChain.getComponentCount()

        console.log(`\nFound ${componentCount} components on clip:`)

        for (let i = 0; i < componentCount; i++) {
            const component = componentChain.getComponentAtIndex(i)
            const matchName = await component.getMatchName()
            console.log(`\n--- Component ${i}: ${matchName} ---`)

            let componentInfo = {
                index: i,
                matchName: matchName,
                parameters: []
            }

            // Get all parameters for this component
            try {
                let paramCount = component.getParamCount()
                console.log(`  Found ${paramCount} parameters:`)

                for (let j = 0; j < paramCount; j++) {
                    const param = component.getParam(j)
                    const paramName = await param.getDisplayName()

                    console.log(`    [${j}] ${paramName}`)

                    // Try to get the current value
                    try {
                        let value = await param.getValue()
                        console.log(`        Current value: ${value}`)
                        componentInfo.parameters.push({
                            index: j,
                            displayName: paramName,
                            value: value
                        })
                    } catch (e) {
                        console.log(`        Could not get value: ${e.message}`)
                    }
                }
            } catch (e) {
                console.log(`  Could not get parameters: ${e.message}`)
            }

            foundInfo.components.push(componentInfo)
        }
    } catch (e) {
        console.log("Could not get components:", e.message)
    }

    console.log("\n=== End exploration ===")
    return foundInfo
}



const createSequenceFromMedia = async (command) => {

    let options = command.options

    let itemNames = options.itemNames
    let sequenceName = options.sequenceName

    let project = await app.Project.getActiveProject()

    let found = false
    try {
        await findProjectItem(sequenceName, project)
        found  = true
    } catch {
        //do nothing
    }

    if(found) {
        throw Error(`createSequenceFromMedia : sequence name [${sequenceName}] is already in use`)
    }

    let items = []
    for (const name of itemNames) {

        //this is a little inefficient
        let insertItem = await findProjectItem(name, project)
        items.push(insertItem)
    }


    let root = await project.getRootItem()
    
    let sequence = await project.createSequenceFromMedia(sequenceName, items, root)

    await _setActiveSequence(sequence)
}

const setClipStartEndTimes = async (command) => {
    const options = command.options;

    const sequenceId = options.sequenceId;
    const trackIndex = options.trackIndex;
    const trackItemIndex = options.trackItemIndex;
    const startTimeTicks = options.startTimeTicks;
    const endTimeTicks = options.endTimeTicks;
    const trackType = options.trackType

    const sequence = await _getSequenceFromId(sequenceId)
    let trackItem = await getTrack(sequence, trackIndex, trackItemIndex, trackType)

    const startTick = await app.TickTime.createWithTicks(startTimeTicks.toString());
    const endTick = await app.TickTime.createWithTicks(endTimeTicks.toString());;

    let project = await app.Project.getActiveProject();

    execute(() => {

        let out = []

        out.push(trackItem.createSetStartAction(startTick));
        out.push(trackItem.createSetEndAction(endTick))

        return out
    }, project)
}

const closeGapsOnSequence = async(command) => {
    const options = command.options
    const sequenceId = options.sequenceId;
    const trackIndex = options.trackIndex;
    const trackType = options.trackType;

    let sequence = await _getSequenceFromId(sequenceId)

    let out = await _closeGapsOnSequence(sequence, trackIndex, trackType)
    
    return out
}

const _closeGapsOnSequence = async (sequence, trackIndex, trackType) => {
  
    let project = await app.Project.getActiveProject()

    let items = await getTrackItems(sequence, trackIndex, trackType)

    if(!items || items.length === 0) {
        return;
    }
    
    const f = async (item, targetPosition) => {
        let currentStart = await item.getStartTime()

        let a = await currentStart.ticksNumber
        let b = await targetPosition.ticksNumber
        let shiftAmount = (a - b)// How much to shift 
        
        shiftAmount *= -1;

        let shiftTick = app.TickTime.createWithTicks(shiftAmount.toString())

        return shiftTick
    }

    let targetPosition = app.TickTime.createWithTicks("0")


    for(let i = 0; i < items.length; i++) {
        let item = items[i];
        let shiftTick = await f(item, targetPosition)
        
        execute(() => {
            let out = []

                out.push(item.createMoveAction(shiftTick))

            return out
        }, project)
        
        targetPosition = await item.getEndTime()
    }
}

//TODO: change API to take trackType?

//TODO: pass in scope here
const removeItemFromSequence = async (command) => {
    const options = command.options;

    const sequenceId = options.sequenceId;
    const trackIndex = options.trackIndex;
    const trackItemIndex = options.trackItemIndex;
    const rippleDelete = options.rippleDelete;
    const trackType = options.trackType

    let project = await app.Project.getActiveProject()
    let sequence = await _getSequenceFromId(sequenceId)

    if(!sequence) {
        throw Error(`addMarkerToSequence : sequence with id [${sequenceId}] not found.`)
    }

    let item = await getTrack(sequence, trackIndex, trackItemIndex, trackType);

    let editor = await app.SequenceEditor.getEditor(sequence)

    let trackItemSelection = await sequence.getSelection();
    let items = await trackItemSelection.getTrackItems()

    for (let t of items) {
        await trackItemSelection.removeItem(t)
    }

    trackItemSelection.addItem(item, true)

    execute(() => {
        const shiftOverlapping = false
        let action = editor.createRemoveItemsAction(trackItemSelection, rippleDelete, constants.MediaType.ANY, shiftOverlapping )
        return [action]
    }, project)
}

const addMarkerToSequence = async (command) => {
    const options = command.options;
    const sequenceId = options.sequenceId;
    const markerName = options.markerName;
    const startTimeTicks = options.startTimeTicks;
    const durationTicks = options.durationTicks;
    const comments = options.comments;

    const sequence = await _getSequenceFromId(sequenceId)

    if(!sequence) {
        throw Error(`addMarkerToSequence : sequence with id [${sequenceId}] not found.`)
    }

    let markers = await app.Markers.getMarkers(sequence);

    let project = await app.Project.getActiveProject()

    execute(() => {

        let start = app.TickTime.createWithTicks(startTimeTicks.toString())
        let duration = app.TickTime.createWithTicks(durationTicks.toString())

        let action = markers.createAddMarkerAction(markerName, "WebLink",  start, duration, comments)
        return [action]
    }, project)

}

const moveProjectItemsToBin = async (command) => {
    const options = command.options;
    const binName = options.binName;
    const projectItemNames = options.itemNames;

    const project = await app.Project.getActiveProject()
    
    const binFolderItem = await findProjectItem(binName, project)

    if(!binFolderItem) {
        throw Error(`moveProjectItemsToBin : Bin with name [${binName}] not found.`)
    }

    let folderItems = [];

    for(let name of projectItemNames) {
        let item = await findProjectItem(name, project)

        if(!item) {
            throw Error(`moveProjectItemsToBin : FolderItem with name [${name}] not found.`)
        }

        folderItems.push(item)
    }

    const rootFolderItem = await project.getRootItem()

    execute(() => {

        let actions = []

        for(let folderItem of folderItems) {
            let b = app.FolderItem.cast(binFolderItem)
            let action = rootFolderItem.createMoveItemAction(folderItem, b)
            actions.push(action)
        }

        return actions
    }, project)

}

const createBinInActiveProject = async (command) => {
    const options = command.options;
    const binName = options.binName;

    const project = await app.Project.getActiveProject()
    const folderItem = await project.getRootItem()

    execute(() => {
        let action = folderItem.createBinAction(binName, true)
        return [action]
    }, project)
}

const exportSequence = async (command) => {
    const options = command.options;
    const sequenceId = options.sequenceId;
    const outputPath = options.outputPath;
    const presetPath = options.presetPath;

    const manager = await app.EncoderManager.getManager();

    const sequence = await _getSequenceFromId(sequenceId);

    await manager.exportSequence(sequence, constants.ExportType.IMMEDIATELY, outputPath, presetPath);
}

// Transform function for position, scale, rotation
const setClipTransform = async (command) => {
    let options = command.options
    let id = options.sequenceId
    let sequence = await _getSequenceFromId(id)
    let project = await app.Project.getActiveProject()

    let trackItem = await getTrack(sequence, options.videoTrackIndex, options.trackItemIndex, TRACK_TYPE.VIDEO)

    // First, let's explore what components are actually available
    console.log("Exploring available components on clip...")
    let componentChain = await trackItem.getComponentChain()
    let componentCount = componentChain.getComponentCount()

    for (let i = 0; i < componentCount; i++) {
        const component = componentChain.getComponentAtIndex(i)
        const matchName = await component.getMatchName()
        console.log(`Component ${i}: ${matchName}`)
    }

    // Based on patterns from opacity/blend mode that work:
    // Component is "AE.ADBE Opacity" with params "Opacity" and "Blend Mode"
    // Motion should be similar: "AE.ADBE Motion" or similar

    // Collect parameters that we'll set
    let paramsToSet = []

    // Try to find Motion parameters
    // Motion in Premiere is typically under "Motion" or fixed effects
    if (options.position !== undefined) {
        try {
            // Try the most likely component name first
            let positionParam = await getParam(trackItem, "AE.ADBE Motion", "Position")
            if (positionParam) {
                let positionKeyframe = await positionParam.createKeyframe(options.position)
                paramsToSet.push({ param: positionParam, keyframe: positionKeyframe })
                console.log("Found Position parameter")
            } else {
                console.log("Position parameter not found")
            }
        } catch (e) {
            console.log("Position error:", e.message)
        }
    }

    if (options.scale !== undefined) {
        try {
            let scaleParam = await getParam(trackItem, "AE.ADBE Motion", "Scale")
            if (scaleParam) {
                let scaleKeyframe = await scaleParam.createKeyframe(options.scale)
                paramsToSet.push({ param: scaleParam, keyframe: scaleKeyframe })
                console.log("Found Scale parameter")
            } else {
                console.log("Scale parameter not found")
            }
        } catch (e) {
            console.log("Scale error:", e.message)
        }
    }

    if (options.rotation !== undefined) {
        try {
            let rotationParam = await getParam(trackItem, "AE.ADBE Motion", "Rotation")
            if (rotationParam) {
                let rotationKeyframe = await rotationParam.createKeyframe(options.rotation)
                paramsToSet.push({ param: rotationParam, keyframe: rotationKeyframe })
                console.log("Found Rotation parameter")
            } else {
                console.log("Rotation parameter not found")
            }
        } catch (e) {
            console.log("Rotation error:", e.message)
        }
    }

    // Apply the changes using execute, following the exact pattern from setVideoClipProperties
    if (paramsToSet.length > 0) {
        execute(() => {
            let actions = []
            for (const { param, keyframe } of paramsToSet) {
                actions.push(param.createSetValueAction(keyframe))
            }
            return actions
        }, project)

        return {
            success: true,
            appliedTransforms: paramsToSet.length,
            message: `Applied ${paramsToSet.length} transform(s)`
        }
    } else {
        // If we couldn't find parameters, try to manually check each component
        console.log("Checking all components and their parameters...")

        for (let i = 0; i < componentCount; i++) {
            const component = componentChain.getComponentAtIndex(i)
            const matchName = await component.getMatchName()
            console.log(`\nComponent ${i}: ${matchName}`)

            try {
                let paramCount = component.getParamCount()
                for (let j = 0; j < paramCount; j++) {
                    const param = component.getParam(j)
                    const paramName = await param.getDisplayName()
                    console.log(`  Param ${j}: ${paramName}`)
                }
            } catch (e) {
                console.log(`  Could not get params: ${e.message}`)
            }
        }

        throw new Error("Motion parameters not found. Check console output in Premiere Pro for available components.")
    }
}

const commandHandlers = {
    exportSequence,
    moveProjectItemsToBin,
    createBinInActiveProject,
    addMarkerToSequence,
    closeGapsOnSequence,
    removeItemFromSequence,
    setClipStartEndTimes,
    openProject,
    saveProjectAs,
    saveProject,
    getProjectInfo,
    setActiveSequence,
    exportFrame,
    setVideoClipProperties,
    createSequenceFromMedia,
    setAudioTrackMute,
    setClipDisabled,
    appendVideoTransition,
    appendVideoFilter,
    addMediaToSequence,
    importMedia,
    createProject,
    exploreClipProperties,
    setClipTransform,
};

module.exports = {
    commandHandlers
}