import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";

extern("dialogs.dolg_can_work_for_sci", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});
extern("dialogs.dolg_can_not_work_for_sci", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work)
  );
});
extern("dialogs.freedom_can_work_for_sci", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});
extern("dialogs.freedom_can_not_work_for_sci", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return (
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work) ||
    hasInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work)
  );
});
extern("dialogs.squad_in_smart_jup_b25", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return isObjectInSmartTerrain(getNpcSpeaker(firstSpeaker, secondSpeaker), "jup_a6");
});
