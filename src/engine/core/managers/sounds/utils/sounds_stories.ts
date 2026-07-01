import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { StoryManager } from "@/engine/core/managers/sounds/stories";
import { Nillable, TStringId } from "@/engine/lib/types";

/**
 * @returns Manager singleton for provided identifier (camp, squad, object etc).
 */
export function getStoryManager(id: TStringId): StoryManager {
  let manager: Nillable<StoryManager> = soundsConfig.managers.get(id);

  if (!manager) {
    manager = new StoryManager(id);
    soundsConfig.managers.set(id, manager);
  }

  return manager;
}
