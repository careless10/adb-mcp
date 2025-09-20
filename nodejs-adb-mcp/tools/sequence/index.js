// Export all sequence tools
import * as basic from './basic.js';
import * as clips from './clips.js';
import * as exportOps from './export.js';

// Collect all tool definitions
export const toolDefinitions = [
  basic.getActiveSequence.definition,
  basic.setActiveSequence.definition,
  basic.createSequenceFromMedia.definition,
  basic.exportSequence.definition,
  clips.addMediaToSequence.definition,
  clips.removeItemFromSequence.definition,
  clips.closeGapsOnSequence.definition,
  clips.setClipDisabled.definition,
  clips.setAudioTrackMute.definition,
  exportOps.exportFrame.definition,
  exportOps.getSequenceFrameImage.definition
];

// Collect all handlers
export const handlers = {
  get_active_sequence: basic.getActiveSequence.handler,
  set_active_sequence: basic.setActiveSequence.handler,
  create_sequence_from_media: basic.createSequenceFromMedia.handler,
  export_sequence: basic.exportSequence.handler,
  add_media_to_sequence: clips.addMediaToSequence.handler,
  remove_item_from_sequence: clips.removeItemFromSequence.handler,
  close_gaps_on_sequence: clips.closeGapsOnSequence.handler,
  set_clip_disabled: clips.setClipDisabled.handler,
  set_audio_track_mute: clips.setAudioTrackMute.handler,
  export_frame: exportOps.exportFrame.handler,
  get_sequence_frame_image: exportOps.getSequenceFrameImage.handler
};