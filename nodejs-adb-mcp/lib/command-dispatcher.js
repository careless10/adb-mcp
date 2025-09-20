import { socketClient } from './socket-client.js';

// Import all tool handlers
import * as projectTools from '../tools/project/index.js';
import * as sequenceTools from '../tools/sequence/index.js';
import * as effectsTools from '../tools/effects/index.js';
import * as transformTools from '../tools/transform/index.js';
import * as mediaTools from '../tools/media/index.js';

// Combine all handlers
const handlers = {
  ...projectTools.handlers,
  ...sequenceTools.handlers,
  ...effectsTools.handlers,
  ...transformTools.handlers,
  ...mediaTools.handlers
};

// Combine all tool definitions
export const toolDefinitions = [
  ...projectTools.toolDefinitions,
  ...sequenceTools.toolDefinitions,
  ...effectsTools.toolDefinitions,
  ...transformTools.toolDefinitions,
  ...mediaTools.toolDefinitions
];

export async function dispatchCommand(toolName, args) {
  const handler = handlers[toolName];

  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  try {
    // Build command object for socket
    const command = await handler(args);

    // Send via socket and get response
    const response = await socketClient.sendCommand(command);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response.response || response, null, 2)
      }]
    };
  } catch (error) {
    console.error(`Error executing ${toolName}:`, error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}