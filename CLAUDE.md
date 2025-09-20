# Adobe Premiere MCP - Claude Reference

## Overview
This project provides MCP (Model Context Protocol) integration with Adobe Premiere Pro through a UXP plugin and Node.js MCP server.

## Architecture
1. **UXP Plugin** (`/uxp/pr/`) - Runs inside Premiere Pro
2. **Proxy Server** (`/adb-proxy-socket.js`) - WebSocket bridge between MCP and UXP
3. **MCP Server** (`/nodejs-adb-mcp/`) - Node.js MCP server that Claude connects to

## Running the System
1. Start proxy server: `node adb-proxy-socket.js`
2. MCP server starts automatically via Claude's configuration
3. Load UXP plugin in Premiere Pro using UXP Developer Tool

## Important Technical Details

### Position Coordinates
- **CRITICAL**: Position uses **pixel coordinates** but requires normalization
- Input: `[x, y]` in pixels (e.g., `[540, 675]` for center of 1080x1350)
- Internal: Normalized to 0-1 range by dividing by sequence dimensions
- Uses `PointF` object from Adobe API (required for Position parameter)

### Sequence Information
- Default sequence: `61d50210-173e-4101-adec-543704167a06`
- Dimensions: 1089x1359 (reports as this, but actual canvas is 1080x1350)
- V1 (track 0): Frame 18.png
- V2 (track 1): memorycovercard.psd

### Key API Patterns
```javascript
// Position requires PointF and normalization
const normalizedX = pixelX / sequenceWidth
const normalizedY = pixelY / sequenceHeight
const pointF = new PointF(normalizedX, normalizedY)
```

## Available MCP Tools (27 total)
- `set_clip_transform` - Position, Scale, Rotation (Position uses pixel coords)
- `get_project_info` - Get project details
- `explore_clip_properties` - Debug clip components
- `add_media_to_sequence` - Add clips to timeline
- Various effects: black_and_white, tint, gaussian_blur, motion_blur
- Video transitions and properties

## Common Issues & Solutions
1. **Position stuck at 32767**: Was using array instead of PointF object
2. **MCP not connected**: Run `/mcp` command in Claude to reconnect
3. **UXP changes not reflecting**: Enable "Load + Watch" in UXP Developer Tool

## Testing Commands
```bash
# Test if everything is working
mcp__adobe-premiere__get_project_info

# Move clip to center
mcp__adobe-premiere__set_clip_transform
  sequence_id: "61d50210-173e-4101-adec-543704167a06"
  video_track_index: 0
  track_item_index: 0
  position: [540, 675]
```

## File Locations
- UXP Plugin Core: `/uxp/pr/commands/core.js`
- MCP Server: `/nodejs-adb-mcp/index.js`
- Proxy Server: `/adb-proxy-socket.js`