// Project creation operations

export const createProject = {
  definition: {
    name: 'create_project',
    description: 'Create a new project',
    inputSchema: {
      type: 'object',
      properties: {
        directory_path: {
          type: 'string',
          description: 'Directory path for the new project'
        },
        project_name: {
          type: 'string',
          description: 'Name for the new project'
        }
      },
      required: ['directory_path', 'project_name']
    }
  },
  handler: async (args) => ({
    action: 'createProject',
    options: {
      directoryPath: args.directory_path,
      projectName: args.project_name
    }
  })
};

export const createBinInActiveProject = {
  definition: {
    name: 'create_bin_in_active_project',
    description: 'Create a new bin in the active project',
    inputSchema: {
      type: 'object',
      properties: {
        bin_name: {
          type: 'string',
          description: 'Name for the new bin'
        }
      },
      required: ['bin_name']
    }
  },
  handler: async (args) => ({
    action: 'createBinInActiveProject',
    options: {
      binName: args.bin_name
    }
  })
};