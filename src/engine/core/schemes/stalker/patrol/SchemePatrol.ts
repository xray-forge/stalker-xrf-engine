import { world_property } from "xray16";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EvaluatorSectionEnded } from "@/engine/core/ai/planner/evaluators";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { ActionCommander, ActionPatrol } from "@/engine/core/schemes/stalker/patrol/actions";
import { EvaluatorPatrolCommander } from "@/engine/core/schemes/stalker/patrol/evaluators";
import { ISchemePatrolState } from "@/engine/core/schemes/stalker/patrol/patrol_types";
import { patrolConfig } from "@/engine/core/schemes/stalker/patrol/PatrolConfig";
import { PatrolManager } from "@/engine/core/schemes/stalker/patrol/PatrolManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions, readIniBoolean, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { ActionPlanner, GameObject, IniFile, Optional, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing stalker patrol logics.
 */
export class SchemePatrol extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PATROL;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemePatrolState {
    logger.info("Activate scheme: %s %s %s", object.name(), scheme, section);

    const state: ISchemePatrolState = AbstractScheme.assign(object, ini, scheme, section);
    const squad: Optional<Squad> = getObjectSquad(object);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathName = readIniString(ini, section, "path_walk", true, smartTerrainName);
    state.pathWalk = state.pathName;
    state.pathLook = readIniString(ini, section, "path_look", false, smartTerrainName);
    state.pathWalkInfo = null;
    state.pathLookInfo = null;

    if (state.pathWalk === state.pathLook) {
      abort(
        "Bad attempt to set 'path_look' equal to 'path_walk' in section '%s' for object '%s'.",
        section,
        object.name()
      );
    }

    state.formation = readIniString(ini, section, "formation", false, null, EPatrolFormation.BACK);
    state.silent = readIniBoolean(ini, section, "silent", false, false);
    state.moveType = readIniString(ini, section, "move_type", false, null, "patrol");
    state.commander = readIniBoolean(ini, section, "commander", false, false);
    state.patrolKey = squad ? `${state.pathName}_${tostring(squad.id)}` : state.pathName;

    state.suggestedState = {
      moving: readIniString(
        ini,
        section,
        "def_state_moving",
        false,
        null,
        readIniString(ini, section, "def_state_moving1", false)
      ),
      standing: readIniString(ini, section, "def_state_standing", false),
      campering: null,
      camperingFire: null,
      movingFire: null,
    };

    if (patrolConfig.PATROLS.get(state.patrolKey) === null) {
      patrolConfig.PATROLS.set(state.patrolKey, new PatrolManager(state.pathName));
    }

    patrolConfig.PATROLS.get(state.patrolKey).addObject(object, state.commander);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemePatrolState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(
      EEvaluatorId.IS_PATROL_ENDED,
      new EvaluatorSectionEnded(state, "EvaluatorPatrolSectionEnded")
    );
    planner.add_evaluator(EEvaluatorId.IS_PATROL_COMMANDER, new EvaluatorPatrolCommander(state));

    const actionCommander: ActionCommander = new ActionCommander(state, object);

    addCommonActionPreconditions(actionCommander);
    actionCommander.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionCommander.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionCommander.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionCommander.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionCommander.add_precondition(new world_property(EEvaluatorId.IS_PATROL_ENDED, false));
    actionCommander.add_precondition(new world_property(EEvaluatorId.IS_PATROL_COMMANDER, true));
    actionCommander.add_effect(new world_property(EEvaluatorId.IS_PATROL_ENDED, true));
    actionCommander.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.COMMAND_SQUAD, actionCommander);

    const actionPatrol: ActionPatrol = new ActionPatrol(state, object);

    addCommonActionPreconditions(actionPatrol);
    actionPatrol.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_PATROL_ENDED, false));
    actionPatrol.add_precondition(new world_property(EEvaluatorId.IS_PATROL_COMMANDER, false));
    actionPatrol.add_effect(new world_property(EEvaluatorId.IS_PATROL_ENDED, true));
    actionPatrol.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.PATROL_ACTIVITY, actionPatrol);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_PATROL_ENDED, true));

    AbstractScheme.subscribe(state, actionCommander);
    AbstractScheme.subscribe(state, actionPatrol);
  }
}
