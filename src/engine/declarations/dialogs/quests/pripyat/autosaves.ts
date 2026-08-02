import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { createGameAutoSave } from "@/engine/core/utils/game_save";

extern("dialogs.save_pri_a17_hospital_start", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_pri_a17_hospital_start");
});
