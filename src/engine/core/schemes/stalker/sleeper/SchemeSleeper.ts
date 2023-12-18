import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ActionSleeperActivity } from "@/engine/core/schemes/stalker/sleeper/actions/ActionSleeperActivity";
import { ISchemeSleeperState } from "@/engine/core/schemes/stalker/sleeper/sleeper_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, GameObject, IniFile, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme implementing sleeping logics at some specific smart terrain places.
 */
export class SchemeSleeper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SLEEPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    smartTerrainName: TName
  ): ISchemeSleeperState {
    const state: ISchemeSleeperState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.pathMain = readIniString(ini, section, "path_main", true, smartTerrainName);
    state.wakeable = readIniBoolean(ini, section, "wakeable", false);
    state.pathWalk = null;
    state.pathWalkInfo = null;
    state.pathLook = null;
    state.pathLookInfo = null;

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSleeperState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    // Add evaluator to check if sleep is needed.
    planner.add_evaluator(EEvaluatorId.NEED_SLEEPER, new EvaluatorSectionActive(state, "EvaluatorSleepSectionActive"));

    const actionSleeper: ActionSleeperActivity = new ActionSleeperActivity(state, object);

    actionSleeper.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.NEED_SLEEPER, true));

    addCommonActionPreconditions(actionSleeper);

    actionSleeper.add_effect(new world_property(EEvaluatorId.NEED_SLEEPER, false));
    actionSleeper.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.SLEEP_ACTIVITY, actionSleeper);

    // Cannot use alife activity when need to sleep.
    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_SLEEPER, false));

    AbstractScheme.subscribe(state, actionSleeper);
  }
}
