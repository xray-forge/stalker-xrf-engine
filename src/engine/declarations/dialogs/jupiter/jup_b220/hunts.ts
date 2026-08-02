import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check whether not all b220 hunting targets have been reported as done yet.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether some hunts are still pending.
 */
extern("dialogs_jupiter.jupiter_b220_all_hunted", (_: GameObject, __: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told) &&
    hasInfoPortion(infoPortions.jup_b220_trapper_zaton_chimera_hunted_told) &&
    hasInfoPortion(infoPortions.jup_b211_swamp_bloodsuckers_hunt_done) &&
    hasInfoPortion(infoPortions.jup_b208_burers_hunt_done) &&
    hasInfoPortion(infoPortions.jup_b212_jupiter_chimera_hunt_done)
  ) {
    return false;
  }

  return true;
});

/**
 * Check whether no completed b220 hunt is currently waiting to be reported.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether no hunt is ready to report.
 */
extern("dialogs_jupiter.jupiter_b220_no_one_hunted", (_: GameObject, __: GameObject): boolean => {
  if (
    hasInfoPortion(infoPortions.jup_b220_trapper_about_himself_told) &&
    hasInfoPortion(infoPortions.zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give) &&
    !hasInfoPortion(infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.zat_b106_chimera_dead) &&
    !hasInfoPortion(infoPortions.jup_b220_trapper_zaton_chimera_hunted_told)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.jup_b6_all_hunters_are_dead) &&
    !hasInfoPortion(infoPortions.jup_b211_swamp_bloodsuckers_hunt_done)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.jup_b208_burers_dead) &&
    !hasInfoPortion(infoPortions.jup_b208_burers_hunt_done)
  ) {
    return false;
  } else if (
    hasInfoPortion(infoPortions.jup_b212_jupiter_chimera_dead) &&
    !hasInfoPortion(infoPortions.jup_b212_jupiter_chimera_hunt_done)
  ) {
    return false;
  }

  return true;
});
