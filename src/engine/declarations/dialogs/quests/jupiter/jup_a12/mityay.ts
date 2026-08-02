import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isStalkerAlive } from "@/engine/core/utils/object";

extern("dialogs.mityay_is_alive", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("jup_a12_stalker_assaulter");
});
