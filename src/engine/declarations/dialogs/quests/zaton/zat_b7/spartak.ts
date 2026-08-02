import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isStalkerAlive } from "@/engine/core/utils/object";

extern("dialogs.spartak_is_alive", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b7_stalker_victim_1");
});
