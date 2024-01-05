import { registry } from "@/engine/core/database";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { meetConfig } from "@/engine/core/schemes/stalker/meet/MeetConfig";
import { parseConditionsList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectsRelationSafe } from "@/engine/core/utils/relation";
import { NO_MEET_SECTION } from "@/engine/lib/constants/sections";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { EGameObjectRelation, GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Initialize meet scheme defaults based on object relations and current section logics preferences.
 *
 * @param object - game object
 * @param ini - target ini file to read config from
 * @param section - currently active section
 * @param state - target meet scheme logics state
 */
export function initializeMeetScheme(
  object: GameObject,
  ini: IniFile,
  section: TSection,
  state: ISchemeMeetState
): void {
  // Section not changed, nothing to re-init.
  if (tostring(section) === state.meetSection && tostring(section) !== NIL) {
    return;
  }

  state.meetSection = tostring(section);

  const relation: Optional<EGameObjectRelation> = getObjectsRelationSafe(object, registry.actor);

  // Meet is disabled, mark sections as disabled.
  if (tostring(section) === NO_MEET_SECTION) {
    state.closeDistance = parseConditionsList("0");
    state.closeAnimation = parseConditionsList(NIL);
    state.closeSoundDistance = parseConditionsList("0");
    state.closeSoundHello = parseConditionsList(NIL);
    state.closeSoundBye = parseConditionsList(NIL);
    state.closeVictim = parseConditionsList(NIL);

    state.farDistance = parseConditionsList("0");
    state.farAnimation = parseConditionsList(NIL);
    state.farSoundDistance = parseConditionsList("0");
    state.farSound = parseConditionsList(NIL);
    state.farVictim = parseConditionsList(NIL);

    state.useSound = parseConditionsList(NIL);
    state.use = parseConditionsList(FALSE);
    state.meetDialog = parseConditionsList(NIL);
    state.abuse = parseConditionsList(FALSE);
    state.isTradeEnabled = parseConditionsList(TRUE);
    state.isBreakAllowed = parseConditionsList(TRUE);
    state.isMeetOnTalking = false;
    state.useText = parseConditionsList(NIL);

    state.resetDistance = meetConfig.MEET_RESET_DISTANCE;
    state.isMeetOnlyAtPathEnabled = true;
  } else {
    const defaults = relation === EGameObjectRelation.ENEMY ? meetConfig.ENEMY_DEFAULTS : meetConfig.NEUTRAL_DEFAULTS;

    state.closeDistance = parseConditionsList(
      readIniString(ini, section, "close_distance", false, null, defaults.closeDistance)
    );
    state.closeAnimation = parseConditionsList(
      readIniString(ini, section, "close_anim", false, null, defaults.closeAnimation)
    );
    state.closeSoundDistance = parseConditionsList(
      readIniString(ini, section, "close_snd_distance", false, null, defaults.closeDistance)
    );
    state.closeSoundHello = parseConditionsList(
      readIniString(ini, section, "close_snd_hello", false, null, defaults.closeSoundHello)
    );
    state.closeSoundBye = parseConditionsList(
      readIniString(ini, section, "close_snd_bye", false, null, defaults.closeSoundBye)
    );
    state.closeVictim = parseConditionsList(
      readIniString(ini, section, "close_victim", false, null, defaults.closeVictim)
    );

    state.farDistance = parseConditionsList(
      readIniString(ini, section, "far_distance", false, null, defaults.farDistance)
    );
    state.farAnimation = parseConditionsList(
      readIniString(ini, section, "far_anim", false, null, defaults.farAnimation)
    );
    state.farSoundDistance = parseConditionsList(
      readIniString(ini, section, "far_snd_distance", false, null, defaults.farSoundDistance)
    );
    state.farSound = parseConditionsList(readIniString(ini, section, "far_snd", false, null, defaults.farSound));
    state.farVictim = parseConditionsList(readIniString(ini, section, "far_victim", false, null, defaults.farVictim));

    state.useSound = parseConditionsList(readIniString(ini, section, "snd_on_use", false, null, defaults.useSound));
    state.use = parseConditionsList(readIniString(ini, section, "use", false, null, defaults.use));
    state.meetDialog = parseConditionsList(
      readIniString(ini, section, "meet_dialog", false, null, defaults.meetDialog)
    );
    state.abuse = parseConditionsList(readIniString(ini, section, "abuse", false, null, defaults.abuse));
    state.isTradeEnabled = parseConditionsList(
      readIniString(ini, section, "trade_enable", false, null, defaults.isTradeEnabled)
    );
    state.isBreakAllowed = parseConditionsList(
      readIniString(ini, section, "allow_break", false, null, defaults.isBreakAllowed)
    );
    state.isMeetOnTalking =
      readIniString(ini, section, "meet_on_talking", false, null, defaults.isMeetOnTalking) === TRUE;
    state.useText = parseConditionsList(readIniString(ini, section, "use_text", false, null, defaults.useText));

    state.resetDistance = meetConfig.MEET_RESET_DISTANCE;
    state.isMeetOnlyAtPathEnabled = true;
  }

  state.meetManager.initialize();
  state.isMeetInitialized = true;
}
