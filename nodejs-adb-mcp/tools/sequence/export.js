// Sequence export operations

export const exportFrame = {
  definition: {
    name: 'export_frame',
    description: 'Export a frame from sequence as image',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        file_path: {
          type: 'string',
          description: 'Output file path for the image'
        },
        seconds: {
          type: 'number',
          description: 'Time position in seconds'
        }
      },
      required: ['sequence_id', 'file_path', 'seconds']
    }
  },
  handler: async (args) => ({
    action: 'exportFrame',
    options: {
      sequenceId: args.sequence_id,
      filePath: args.file_path,
      seconds: args.seconds
    }
  })
};

export const getSequenceFrameImage = {
  definition: {
    name: 'get_sequence_frame_image',
    description: 'Get a frame from sequence as base64 image',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence'
        },
        seconds: {
          type: 'number',
          description: 'Time position in seconds'
        }
      },
      required: ['sequence_id', 'seconds']
    }
  },
  handler: async (args) => ({
    action: 'getSequenceFrameImage',
    options: {
      sequenceId: args.sequence_id,
      seconds: args.seconds
    }
  })
};