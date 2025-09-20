// Media import operations

export const importMedia = {
  definition: {
    name: 'import_media',
    description: 'Import media files into the project',
    inputSchema: {
      type: 'object',
      properties: {
        file_paths: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of file paths to import'
        }
      },
      required: ['file_paths']
    }
  },
  handler: async (args) => ({
    action: 'importMedia',
    options: {
      filePaths: args.file_paths
    }
  })
};