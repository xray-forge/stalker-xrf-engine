import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { createGameAutoSave } from "@/engine/core/utils/game_save";

extern("dialogs.leave_zone_save", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_zone_to_reality");
});
extern("dialogs.save_uni_travel_zat_to_jup", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_zat_to_jup");
});
extern("dialogs.save_uni_travel_zat_to_pri", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_zat_to_pri");
});
extern("dialogs.save_uni_travel_jup_to_zat", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_jup_to_zat");
});
extern("dialogs.save_uni_travel_jup_to_pri", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_jup_to_pri");
});
extern("dialogs.save_uni_travel_pri_to_zat", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_pri_to_zat");
});
extern("dialogs.save_uni_travel_pri_to_jup", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): void => {
  createGameAutoSave("st_save_uni_travel_pri_to_jup");
});
