import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";

extern("dialogs.squad_not_in_smart_b304", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b304_monsters_smart_terrain");
});
extern("dialogs.squad_not_in_smart_b303", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "pri_b303");
});
