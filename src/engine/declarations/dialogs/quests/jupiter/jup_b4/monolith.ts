import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { isStalkerAlive } from "@/engine/core/utils/object";

extern("dialogs.monolith_leader_is_alive", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return false;
});

extern("dialogs.monolith_leader_dead_or_hired", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
});

extern("dialogs.monolith_leader_dead_or_dolg", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return true;
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_duty_skin");
  }

  return true;
});

extern("dialogs.monolith_leader_dead_or_freedom", (_firstSpeaker: GameObject, _secondSpeaker: GameObject): boolean => {
  if (hasInfoPortion(infoPortions.jup_b218_soldier_hired)) {
    return true;
  }

  if (!(
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom) ||
    hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)
  )) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_monolith_skin");
  }

  if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom)) {
    return !isStalkerAlive("jup_b4_monolith_squad_leader_freedom_skin");
  } else if (hasInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty)) {
    return true;
  }

  return true;
});
