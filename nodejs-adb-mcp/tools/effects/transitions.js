// Transition effects

export const appendVideoTransition = {
  definition: {
    name: 'append_video_transition',
    description: 'Append a video transition to a clip',
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
        transition_name: {
          type: 'string',
          description: 'Name of the transition (e.g., "Cross Dissolve", "Dip to Black")'
        },
        duration: {
          type: 'number',
          default: 1.0,
          description: 'Duration of the transition in seconds'
        },
        clip_alignment: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          default: 0.5,
          description: 'Alignment (0=start, 0.5=center, 1=end)'
        }
      },
      required: ['sequence_id', 'video_track_index', 'track_item_index', 'transition_name']
    }
  },
  handler: async (args) => ({
    action: 'appendVideoTransition',
    options: {
      sequenceId: args.sequence_id,
      videoTrackIndex: args.video_track_index,
      trackItemIndex: args.track_item_index,
      transitionName: args.transition_name,
      duration: args.duration || 1.0,
      clipAlignment: args.clip_alignment || 0.5
    }
  })
};