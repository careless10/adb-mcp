// Export all effects tools
import * as color from './color.js';
import * as blur from './blur.js';
import * as transitions from './transitions.js';

// Collect all tool definitions
export const toolDefinitions = [
  color.addBlackAndWhiteEffect.definition,
  color.addTintEffect.definition,
  blur.addGaussianBlurEffect.definition,
  blur.addMotionBlurEffect.definition,
  transitions.appendVideoTransition.definition
];

// Collect all handlers
export const handlers = {
  add_black_and_white_effect: color.addBlackAndWhiteEffect.handler,
  add_tint_effect: color.addTintEffect.handler,
  add_gaussian_blur_effect: blur.addGaussianBlurEffect.handler,
  add_motion_blur_effect: blur.addMotionBlurEffect.handler,
  append_video_transition: transitions.appendVideoTransition.handler
};