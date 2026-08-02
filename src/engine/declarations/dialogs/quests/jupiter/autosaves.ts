import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";

extern("dialogs.save_jup_b218_travel_jup_to_pas", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b218_travel_jup_to_pas");
});
extern("dialogs.save_jup_a10_gonna_return_debt", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  if (!hasInfoPortion(infoPortions.jup_a10_avtosave)) {
    createGameAutoSave("st_save_jup_a10_gonna_return_debt");
    giveInfoPortion(infoPortions.jup_a10_avtosave);
  }
});
extern("dialogs.save_jup_b6_arrived_to_fen", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b6_arrived_to_fen");
});
extern("dialogs.save_jup_b6_arrived_to_ash_heap", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b6_arrived_to_ash_heap");
});
extern("dialogs.save_jup_b19_arrived_to_kopachy", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_jup_b19_arrived_to_kopachy");
});
