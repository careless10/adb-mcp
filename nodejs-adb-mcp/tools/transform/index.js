// Export all transform tools
import * as clip from './clip.js';

// Collect all tool definitions
export const toolDefinitions = [
  clip.setClipTransform.definition,
  clip.setVideoClipProperties.definition,
  clip.exploreClipProperties.definition
];

// Collect all handlers
export const handlers = {
  set_clip_transform: clip.setClipTransform.handler,
  set_video_clip_properties: clip.setVideoClipProperties.handler,
  explore_clip_properties: clip.exploreClipProperties.handler
};