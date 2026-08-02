import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

extern("dialogs.quest_dialog_heli_precond", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return !(
    (hasInfoPortion(infoPortions.jup_b9_heli_1_searched) &&
      hasInfoPortion(infoPortions.zat_b100_heli_2_searched) &&
      hasInfoPortion(infoPortions.zat_b28_heli_3_searched) &&
      hasInfoPortion(infoPortions.jup_b8_heli_4_searched) &&
      hasInfoPortion(infoPortions.zat_b101_heli_5_searched)) ||
    hasInfoPortion(infoPortions.pri_b305_actor_wondered_done)
  );
});

extern("dialogs.quest_dialog_military_precond", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.zat_b28_heli_3_searched) || hasInfoPortion(infoPortions.jup_b9_blackbox_decrypted)) {
    if (!(
      hasInfoPortion(infoPortions.zat_b28_heli_3_searched) && hasInfoPortion(infoPortions.jup_b9_blackbox_decrypted)
    )) {
      return true;
    }
  }

  return false;
});

extern("dialogs.quest_dialog_squad_precond", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  return !(
    hasInfoPortion(infoPortions.jup_b218_monolith_hired) &&
    hasInfoPortion(infoPortions.jup_b218_soldier_hired) &&
    hasInfoPortion(infoPortions.jup_a10_vano_agree_go_und)
  );
});

extern("dialogs.quest_dialog_toolkits_precond", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.zat_a2_mechanic_toolkit_search) && !hasInfoPortion(infoPortions.zat_b3_task_end)) {
    return true;
  } else if (
    hasInfoPortion(infoPortions.jup_b217_tech_instruments_start) &&
    !hasInfoPortion(infoPortions.jup_b217_task_end)
  ) {
    return true;
  }

  return false;
});
