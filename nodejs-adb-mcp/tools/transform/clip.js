// Clip transformation and properties

export const setClipTransform = {
  definition: {
    name: 'set_clip_transform',
    description: 'Set transform properties for a clip (scale, rotation, position)',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        video_track_index: {
          type: 'number',
          description: 'Index of the video track (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Index of the clip on the track (0-based)'
        },
        scale: {
          type: 'number',
          description: 'Scale percentage (100 = normal size)'
        },
        rotation: {
          type: 'number',
          description: 'Rotation in degrees'
        },
        position: {
          type: 'array',
          items: { type: 'number' },
          description: 'Position [x, y] in pixels'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index']
    }
  },
  handler: async (args) => ({
    action: 'setClipTransform',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      scale: args.scale,
      rotation: args.rotation,
      position: args.position
    }
  })
};

export const setVideoClipProperties = {
  definition: {
    name: 'set_video_clip_properties',
    description: 'Set video clip properties like opacity and blend mode',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        video_track_index: {
          type: 'number',
          description: 'Video track index (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Item index on the track (0-based)'
        },
        opacity: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          default: 100,
          description: 'Opacity percentage (0-100)'
        },
        blend_mode: {
          type: 'string',
          enum: ['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY', 'SOFT_LIGHT', 'HARD_LIGHT', 'DARKEN', 'LIGHTEN', 'DIFFERENCE', 'HUE', 'SATURATION', 'COLOR', 'LUMINOSITY'],
          default: 'NORMAL',
          description: 'Blend mode'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index']
    }
  },
  handler: async (args) => ({
    action: 'setVideoClipProperties',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      opacity: args.opacity || 100,
      blendMode: args.blend_mode || 'NORMAL'
    }
  })
};

export const exploreClipProperties = {
  definition: {
    name: 'explore_clip_properties',
    description: 'Explore and list all properties of a clip',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        video_track_index: {
          type: 'number',
          description: 'Video track index (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Item index on the track (0-based)'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index']
    }
  },
  handler: async (args) => ({
    action: 'exploreClipProperties',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index
    }
  })
};

export const enablePositionKeyframing = {
  definition: {
    name: 'enable_position_keyframing',
    description: 'Enable or disable keyframing for the position property of a clip (stopwatch)',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        video_track_index: {
          type: 'number',
          description: 'Video track index (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Item index on the track (0-based)'
        },
        enable: {
          type: 'boolean',
          default: true,
          description: 'Whether to enable (true) or disable (false) keyframing'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index']
    }
  },
  handler: async (args) => ({
    action: 'enablePositionKeyframing',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      enable: args.enable !== undefined ? args.enable : true
    }
  })
};

export const enableScaleKeyframing = {
  definition: {
    name: 'enable_scale_keyframing',
    description: 'Enable or disable keyframing for the scale property of a clip (stopwatch)',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        video_track_index: {
          type: 'number',
          description: 'Video track index (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Item index on the track (0-based)'
        },
        enable: {
          type: 'boolean',
          default: true,
          description: 'Whether to enable (true) or disable (false) keyframing'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index']
    }
  },
  handler: async (args) => ({
    action: 'enableScaleKeyframing',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      enable: args.enable !== undefined ? args.enable : true
    }
  })
};