import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { isStalkerAlive } from "@/engine/core/utils/object";

extern("dialogs.tesak_is_alive", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});
extern("dialogs.gonta_is_alive", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return isStalkerAlive("zat_b103_lost_merc_leader");
});
