// Color effects

export const addBlackAndWhiteEffect = {
  definition: {
    name: 'add_black_and_white_effect',
    description: 'Add black and white effect to a clip',
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
    action: 'appendVideoFilter',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      filterName: 'Black & White'
    }
  })
};

export const addTintEffect = {
  definition: {
    name: 'add_tint_effect',
    description: 'Add tint effect to a clip',
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
        black_map: {
          type: 'object',
          properties: {
            red: { type: 'number', minimum: 0, maximum: 255 },
            green: { type: 'number', minimum: 0, maximum: 255 },
            blue: { type: 'number', minimum: 0, maximum: 255 }
          },
          default: { red: 0, green: 0, blue: 0 },
          description: 'RGB values for black mapping'
        },
        white_map: {
          type: 'object',
          properties: {
            red: { type: 'number', minimum: 0, maximum: 255 },
            green: { type: 'number', minimum: 0, maximum: 255 },
            blue: { type: 'number', minimum: 0, maximum: 255 }
          },
          default: { red: 255, green: 255, blue: 255 },
          description: 'RGB values for white mapping'
        },
        amount: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          default: 100,
          description: 'Effect amount (0-100)'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index']
    }
  },
  handler: async (args) => ({
    action: 'addTintEffect',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      blackMap: args.black_map || { red: 0, green: 0, blue: 0 },
      whiteMap: args.white_map || { red: 255, green: 255, blue: 255 },
      amount: args.amount || 100
    }
  })
};