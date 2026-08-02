import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { smartTerrainNames } from "@/engine/constants/smart_terrain_names";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";

extern("dialogs.squad_not_in_smart_b213", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.jup_b213);
});
extern("dialogs.squad_not_in_smart_b214", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.jup_b214);
});
// The original callback name references b6, but it checks the jup_b41 terrain.
extern("dialogs.squad_not_in_smart_b6", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.jup_b41);
});
extern("dialogs.squad_not_in_smart_b205", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.jup_b205_smart_terrain);
});
extern("dialogs.squad_not_in_smart_b47", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return !isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), smartTerrainNames.jup_b47);
});
