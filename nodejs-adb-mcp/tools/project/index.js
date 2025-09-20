// Export all project tools
import * as basic from './basic.js';
import * as create from './create.js';
import * as organize from './organize.js';

// Collect all tool definitions
export const toolDefinitions = [
  basic.getProjectInfo.definition,
  basic.saveProject.definition,
  basic.saveProjectAs.definition,
  basic.openProject.definition,
  create.createProject.definition,
  create.createBinInActiveProject.definition,
  organize.moveProjectItemsToBin.definition
];

// Collect all handlers
export const handlers = {
  get_project_info: basic.getProjectInfo.handler,
  save_project: basic.saveProject.handler,
  save_project_as: basic.saveProjectAs.handler,
  open_project: basic.openProject.handler,
  create_project: create.createProject.handler,
  create_bin_in_active_project: create.createBinInActiveProject.handler,
  move_project_items_to_bin: organize.moveProjectItemsToBin.handler
};