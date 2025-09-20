// Sequence clip operations

export const addMediaToSequence = {
  definition: {
    name: 'add_media_to_sequence',
    description: 'Add media to a sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        item_name: {
          type: 'string',
          description: 'Name of the media item to add'
        },
        video_track_index: {
          type: 'number',
          description: 'Video track index (0-based)'
        },
        audio_track_index: {
          type: 'number',
          description: 'Audio track index (0-based)'
        },
        insertion_time_ticks: {
          type: 'number',
          description: 'Insertion time in ticks',
          default: 0
        },
        overwrite: {
          type: 'boolean',
          description: 'Whether to overwrite existing content',
          default: true
        }
      },
      required: ['sequence_id', 'item_name', 'video_track_index', 'audio_track_index']
    }
  },
  handler: async (args) => ({
    action: 'addMediaToSequence',
    options: {
      sequenceId: args.sequence_id,
      itemName: args.item_name,
      videoTrackIndex: args.video_track_index,
      audioTrackIndex: args.audio_track_index,
      insertionTimeTicks: args.insertion_time_ticks || 0,
      overwrite: args.overwrite !== false
    }
  })
};

export const removeItemFromSequence = {
  definition: {
    name: 'remove_item_from_sequence',
    description: 'Remove an item from a sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        track_index: {
          type: 'number',
          description: 'Track index (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Item index on the track (0-based)'
        },
        track_type: {
          type: 'string',
          description: 'Type of track (video or audio)',
          enum: ['video', 'audio']
        },
        ripple_delete: {
          type: 'boolean',
          description: 'Whether to ripple delete (close gaps)',
          default: true
        }
      },
      required: ['sequence_id', 'track_index', 'track_item_index', 'track_type']
    }
  },
  handler: async (args) => ({
    action: 'removeItemFromSequence',
    options: {
      sequenceId: args.sequence_id,
      trackIndex: args.track_index,
      trackItemIndex: args.track_item_index,
      trackType: args.track_type,
      rippleDelete: args.ripple_delete !== false
    }
  })
};

export const closeGapsOnSequence = {
  definition: {
    name: 'close_gaps_on_sequence',
    description: 'Close gaps on a sequence track',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        track_index: {
          type: 'number',
          description: 'Track index (0-based)'
        },
        track_type: {
          type: 'string',
          description: 'Type of track (video or audio)',
          enum: ['video', 'audio']
        }
      },
      required: ['sequence_id', 'track_index', 'track_type']
    }
  },
  handler: async (args) => ({
    action: 'closeGapsOnSequence',
    options: {
      sequenceId: args.sequence_id,
      trackIndex: args.track_index,
      trackType: args.track_type
    }
  })
};

export const setClipDisabled = {
  definition: {
    name: 'set_clip_disabled',
    description: 'Enable or disable a clip in the sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        track_index: {
          type: 'number',
          description: 'Track index (0-based)'
        },
        track_item_index: {
          type: 'number',
          description: 'Item index on the track (0-based)'
        },
        track_type: {
          type: 'string',
          description: 'Type of track (video or audio)',
          enum: ['video', 'audio']
        },
        disabled: {
          type: 'boolean',
          description: 'Whether to disable the clip'
        }
      },
      required: ['sequence_id', 'track_index', 'track_item_index', 'track_type', 'disabled']
    }
  },
  handler: async (args) => ({
    action: 'setClipDisabled',
    options: {
      sequenceId: args.sequence_id,
      trackIndex: args.track_index,
      trackItemIndex: args.track_item_index,
      trackType: args.track_type,
      disabled: args.disabled
    }
  })
};

export const setAudioTrackMute = {
  definition: {
    name: 'set_audio_track_mute',
    description: 'Mute or unmute an audio track',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        audio_track_index: {
          type: 'number',
          description: 'Audio track index (0-based)'
        },
        mute: {
          type: 'boolean',
          description: 'Whether to mute the track'
        }
      },
      required: ['sequence_id', 'audio_track_index', 'mute']
    }
  },
  handler: async (args) => ({
    action: 'setAudioTrackMute',
    options: {
      sequenceId: args.sequence_id,
      audioTrackIndex: args.audio_track_index,
      mute: args.mute
    }
  })
};