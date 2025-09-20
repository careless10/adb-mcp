// Basic sequence operations

export const getActiveSequence = {
  definition: {
    name: 'get_active_sequence',
    description: 'Get the active sequence information',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  handler: async (args) => ({
    action: 'getActiveSequence'
  })
};

export const setActiveSequence = {
  definition: {
    name: 'set_active_sequence',
    description: 'Set a sequence as the active sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence to activate'
        }
      },
      required: ['sequence_id']
    }
  },
  handler: async (args) => ({
    action: 'setActiveSequence',
    options: {
      sequenceId: args.sequence_id
    }
  })
};

export const createSequenceFromMedia = {
  definition: {
    name: 'create_sequence_from_media',
    description: 'Create a new sequence from media items',
    inputSchema: {
      type: 'object',
      properties: {
        item_names: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of media items to include'
        },
        sequence_name: {
          type: 'string',
          description: 'Name for the new sequence',
          default: 'default'
        }
      },
      required: ['item_names']
    }
  },
  handler: async (args) => ({
    action: 'createSequenceFromMedia',
    options: {
      itemNames: args.item_names,
      sequenceName: args.sequence_name || 'default'
    }
  })
};

export const exportSequence = {
  definition: {
    name: 'export_sequence',
    description: 'Export a sequence',
    inputSchema: {
      type: 'object',
      properties: {
        sequence_id: {
          type: 'string',
          description: 'ID of the sequence to export'
        },
        output_path: {
          type: 'string',
          description: 'Output file path'
        },
        preset_path: {
          type: 'string',
          description: 'Path to export preset file'
        }
      },
      required: ['sequence_id', 'output_path', 'preset_path']
    }
  },
  handler: async (args) => ({
    action: 'exportSequence',
    options: {
      sequenceId: args.sequence_id,
      outputPath: args.output_path,
      presetPath: args.preset_path
    }
  })
};