// Basic project operations

export const getProjectInfo = {
  definition: {
    name: 'get_project_info',
    description: 'Get current Premiere Pro project information',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  handler: async (args) => ({
    action: 'getProjectInfo'
  })
};

export const saveProject = {
  definition: {
    name: 'save_project',
    description: 'Save the current project',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  handler: async (args) => ({
    action: 'saveProject'
  })
};

export const saveProjectAs = {
  definition: {
    name: 'save_project_as',
    description: 'Save the project with a new name/location',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Full path where to save the project'
        }
      },
      required: ['file_path']
    }
  },
  handler: async (args) => ({
    action: 'saveProjectAs',
    options: {
      filePath: args.file_path
    }
  })
};

export const openProject = {
  definition: {
    name: 'open_project',
    description: 'Open a project file',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Full path to the project file to open'
        }
      },
      required: ['file_path']
    }
  },
  handler: async (args) => ({
    action: 'openProject',
    options: {
      filePath: args.file_path
    }
  })
};