import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { createGameAutoSave } from "@/engine/core/utils/game_save";

extern(
  "dialogs.save_zat_b106_arrived_to_chimera_lair",
  (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
    createGameAutoSave("st_save_zat_b106_arrived_to_chimera_lair");
  }
);
extern("dialogs.save_zat_b5_met_with_others", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_zat_b5_met_with_others");
});
