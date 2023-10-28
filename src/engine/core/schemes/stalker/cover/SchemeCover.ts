import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { ActionCover } from "@/engine/core/schemes/stalker/cover/actions";
import { ISchemeCoverState } from "@/engine/core/schemes/stalker/cover/cover_types";
import { assertDefined } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme describing smart cover logics.
 * Usually it is used as some point with animation in smart terrains.
 * Example: stalkers sitting near tables, stalkers standing near wall etc.
 */
export class SchemeCover extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.COVER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeCoverState {
    const state: ISchemeCoverState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.smartTerrainName = readIniString(ini, section, "smart", false);
    state.animationConditionList = parseConditionsList(readIniString(ini, section, "anim", false, null, "hide"));
    state.soundIdle = readIniString(ini, section, "sound_idle", false);

    assertDefined(state.smartTerrainName, "There is no path_walk and smart in ActionCover.");

    state.useAttackDirection = readIniBoolean(ini, section, "use_attack_direction", false, true);

    state.radiusMin = readIniNumber(ini, section, "radius_min", false, 3);
    state.radiusMax = readIniNumber(ini, section, "radius_max", false, 5);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeCoverState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    // Add new evaluator to check whether smart cover is needed.
    actionPlanner.add_evaluator(
      EEvaluatorId.NEED_COVER,
      new EvaluatorSectionActive(state, "EvaluatorCoverSectionActive")
    );

    const newAction: ActionCover = new ActionCover(state);

    newAction.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    newAction.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    newAction.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    newAction.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    newAction.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    newAction.add_precondition(new world_property(EEvaluatorId.NEED_COVER, true));
    // Mark as cover not needed anymore.
    newAction.add_effect(new world_property(EEvaluatorId.NEED_COVER, false));
    // Mark as state logic inactive.
    newAction.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    actionPlanner.add_action(EActionId.COVER_ACTIVITY, newAction);

    // Subscribe action to global scheme events.
    SchemeCover.subscribe(object, state, newAction);

    // Do not continue alife activity while stay in animpoint.
    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_COVER, false));
  }
}
