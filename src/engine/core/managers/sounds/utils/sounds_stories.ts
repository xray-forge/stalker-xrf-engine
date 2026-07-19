import { Nillable, TStringId } from "xray16/lib";

import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryPlaybackController } from "@/engine/core/managers/sounds/stories";

/**
 * @param id - Identifier of the camp, squad, or other story context.
 * @returns Story playback controller for the provided context identifier.
 */
export function getStoryPlayback(id: TStringId): StoryPlaybackController {
  let storyPlayback: Nillable<StoryPlaybackController> = soundsConfig.storyPlaybacks.get(id);

  if (!storyPlayback) {
    storyPlayback = new StoryPlaybackController(id);
    soundsConfig.storyPlaybacks.set(id, storyPlayback);
  }

  return storyPlayback;
}
