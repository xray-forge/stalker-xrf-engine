import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { Optional, TStringId } from "@/engine/lib/types";

/**
 * @returns manager singleton for provided identifier (camp, squad, object etc)
 */
export function getStoryManager(id: TStringId): StoryManager {
  let manager: Optional<StoryManager> = soundsConfig.managers.get(id);

  if (!manager) {
    manager = new StoryManager(id);
    soundsConfig.managers.set(id, manager);
  }

  return manager;
}
