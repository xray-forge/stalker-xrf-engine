import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { smartTerrainNames } from "@/engine/constants/smart_terrain_names";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";

extern("dialogs.squad_not_in_smart_b101", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.zat_b101);
});
extern("dialogs.squad_not_in_smart_b103", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.zat_b103);
});
extern("dialogs.squad_not_in_smart_b104", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.zat_b104);
});
extern("dialogs.squad_not_in_smart_b40", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.zat_b40_smart_terrain);
});
extern("dialogs.squad_not_in_smart_b18", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.zat_b18);
});
extern("dialogs.squad_in_smart_zat_base", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.zat_stalker_base_smart);
});
