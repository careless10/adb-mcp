/* MIT License
 *
 * Copyright (c) 2025 Mike Chambers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const app = require("premierepro");
const core = require("./core");

const getProjectInfo = async () => {
    console.log("getProjectInfo called");
    console.log("app object:", app);
    console.log("app.Project:", app.Project);

    let project = null;
    try {
        project = await app.Project.getActiveProject();
        console.log("getActiveProject result:", project);
    } catch (e) {
        console.log("Error calling getActiveProject:", e);
        throw new Error(`Failed to get active project: ${e.message}`);
    }

    if (!project) {
        console.log("Project is null - checking app.project alternative");
        // Try alternative way to get project
        if (app.project) {
            project = app.project;
            console.log("Using app.project:", project);
        } else {
            throw new Error("No project is currently open in Premiere Pro. Please open a project first.");
        }
    }

    console.log("Project object:", project);
    console.log("Project name:", project?.name);

    const name = project.name;
    const path = project.path;
    const id = project.guid ? project.guid.toString() : null;

    const items = await getProjectContentInfo()

    return {
        name,
        path,
        id,
        items
    }

}
/*
const getProjectContentInfo2 = async () => {
    let project = await app.Project.getActiveProject()

    let root = await project.getRootItem()
    let items = await root.getItems()
    
    let out = []
    for(const item of items) {
        console.log(item)

        const b = app.FolderItem.cast(item)
        
        const isBin = b != undefined

        //todo: it would be good to get more data / info here
        out.push({name:item.name})
    }

    return out
}
    */

const getProjectContentInfo = async () => {
    let project = await app.Project.getActiveProject()

    if (!project) {
        return [];  // Return empty array if no project is open
    }

    let root = await project.getRootItem()
    
    const processItems = async (parentItem) => {
        let items = await parentItem.getItems()
        let out = []
        
        for(const item of items) {
            console.log(item)
            
            const folderItem = app.FolderItem.cast(item)
            const isBin = folderItem != undefined
            
            let itemData = {
                name: item.name,
                type: isBin ? 'bin' : 'projectItem'
            }
            
            // If it's a bin/folder, recursively get its contents
            if (isBin) {
                itemData.items = await processItems(folderItem)
            }
            
            out.push(itemData)
        }
        
        return out
    }
    
    return await processItems(root)
}

const parseAndRouteCommand = async (command) => {
    let action = command.action;

    let f = commandHandlers[action];

    if (typeof f !== "function") {
        throw new Error(`Unknown Command: ${action}`);
    }

    console.log(f.name)
    return f(command);
};



const checkRequiresActiveProject = async (command) => {
    if (!requiresActiveProject(command)) {
        return;
    }

    let project = await app.Project.getActiveProject()
    if (!project) {
        throw new Error(
            `${command.action} : Requires an open Premiere Project`
        );
    }
};

const requiresActiveProject = (command) => {
    return !["createProject", "openProject"].includes(command.action);
};

const commandHandlers = {
    ...core.commandHandlers,
    getProjectInfo  // Override core's empty getProjectInfo with the correct one
};

module.exports = {
    getProjectInfo,
    checkRequiresActiveProject,
    parseAndRouteCommand
};
