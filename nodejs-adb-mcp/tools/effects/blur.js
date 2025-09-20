// Blur effects

export const addGaussianBlurEffect = {
  definition: {
    name: 'add_gaussian_blur_effect',
    description: 'Add Gaussian blur effect to a clip',
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
        blurriness: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Blur amount (0-100)'
        },
        blur_dimensions: {
          type: 'string',
          enum: ['HORIZONTAL', 'VERTICAL', 'HORIZONTAL_VERTICAL'],
          default: 'HORIZONTAL_VERTICAL',
          description: 'Blur dimensions'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index', 'blurriness']
    }
  },
  handler: async (args) => ({
    action: 'addGaussianBlurEffect',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      blurriness: args.blurriness,
      blurDimensions: args.blur_dimensions || 'HORIZONTAL_VERTICAL'
    }
  })
};

export const addMotionBlurEffect = {
  definition: {
    name: 'add_motion_blur_effect',
    description: 'Add motion blur effect to a clip',
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
        direction: {
          type: 'number',
          minimum: 0,
          maximum: 360,
          description: 'Blur direction in degrees'
        },
        length: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Blur length'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index', 'direction', 'length']
    }
  },
  handler: async (args) => ({
    action: 'addMotionBlurEffect',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      direction: args.direction,
      length: args.length
    }
  })
};