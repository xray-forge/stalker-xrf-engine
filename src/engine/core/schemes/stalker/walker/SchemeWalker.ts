import { level, world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EStalkerState } from "@/engine/core/animation/types";
import { ActionWalkerActivity } from "@/engine/core/schemes/stalker/walker/actions";
import { ISchemeWalkerState } from "@/engine/core/schemes/stalker/walker/walker_types";
import { assert } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions, readIniBoolean, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, GameObject, IniFile, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing walker patrols logics for stalkers.
 */
export class SchemeWalker extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.WALKER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrain: TName
  ): ISchemeWalkerState {
    logger.info("Activate scheme: %s", object.name());

    const state: ISchemeWalkerState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathWalk = readIniString(ini, section, "path_walk", true, smartTerrain);

    assert(level.patrol_path_exists(state.pathWalk), "There is no patrol path %s", state.pathWalk);

    state.pathLook = readIniString(ini, section, "path_look", false, smartTerrain);

    assert(
      state.pathWalk !== state.pathLook,
      "You are trying to set 'path_look' equal to 'path_walk' in section [%s] for object [%s]",
      section,
      object.name()
    );

    state.team = readIniString(ini, section, "team", false, smartTerrain);
    state.soundIdle = readIniString(ini, section, "sound_idle", false);
    state.useCamp = readIniBoolean(ini, section, "use_camp", false, false);

    const baseMoving: EStalkerState = readIniString(ini, section, "def_state_moving1", false);

    state.suggestedState = {
      campering: null,
      camperingFire: null,
      movingFire: null,
      standing: readIniString(ini, section, "def_state_standing", false),
      moving: readIniString(ini, section, "def_state_moving", false, null, baseMoving),
    };

    state.pathWalkInfo = null;
    state.pathLookInfo = null;

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeWalkerState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(EEvaluatorId.NEED_WALKER, new EvaluatorSectionActive(state, "EvaluatorWalkerSectionActive"));

    const actionWalkerActivity: ActionWalkerActivity = new ActionWalkerActivity(state, object);

    actionWalkerActivity.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionWalkerActivity.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionWalkerActivity.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionWalkerActivity.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionWalkerActivity.add_precondition(new world_property(EEvaluatorId.NEED_WALKER, true));

    addCommonActionPreconditions(actionWalkerActivity);

    actionWalkerActivity.add_effect(new world_property(EEvaluatorId.NEED_WALKER, false));
    actionWalkerActivity.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.WALKER_ACTIVITY, actionWalkerActivity);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_WALKER, false));

    AbstractScheme.subscribe(state, actionWalkerActivity);
  }
}
