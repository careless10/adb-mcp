// Project organization operations

export const moveProjectItemsToBin = {
  definition: {
    name: 'move_project_items_to_bin',
    description: 'Move project items to a specific bin',
    inputSchema: {
      type: 'object',
      properties: {
        item_names: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of items to move'
        },
        bin_name: {
          type: 'string',
          description: 'Name of the destination bin'
        }
      },
      required: ['item_names', 'bin_name']
    }
  },
  handler: async (args) => ({
    action: 'moveProjectItemsToBin',
    options: {
      itemNames: args.item_names,
      binName: args.bin_name
    }
  })
};