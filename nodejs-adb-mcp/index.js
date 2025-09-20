#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Import socket client and dispatcher
import { socketClient } from './lib/socket-client.js';
import { toolDefinitions, dispatchCommand } from './lib/command-dispatcher.js';

// Create MCP server
const server = new Server(
  {
    name: 'adobe-premiere-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    return await dispatchCommand(name, args);
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

async function main() {
  console.error('Adobe Premiere MCP Server v2.0 starting...');
  console.error(`Found ${toolDefinitions.length} tools registered`);

  // Connect to proxy
  try {
    await socketClient.connect();
    console.error('Successfully connected to Adobe proxy server');
  } catch (error) {
    console.error('Warning: Could not connect to proxy initially:', error.message);
    console.error('Will retry on first command...');
  }

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Adobe Premiere MCP Server running on stdio');
  console.error(`Tools available: ${toolDefinitions.map(t => t.name).join(', ')}`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down...');
  socketClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down...');
  socketClient.disconnect();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});