import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { AbstractScheme } from "@/engine/core/schemes";
import { ActionSleeperActivity } from "@/engine/core/schemes/sleeper/actions/ActionSleeperActivity";
import { EvaluatorNeedSleep } from "@/engine/core/schemes/sleeper/evaluators/EvaluatorNeedSleep";
import { ISchemeSleeperState } from "@/engine/core/schemes/sleeper/ISchemeSleeperState";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, ClientObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeSleeper extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SLEEPER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    additional: string
  ): void {
    const state: ISchemeSleeperState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.path_main = readIniString(ini, section, "path_main", true, additional);
    state.wakeable = readIniBoolean(ini, section, "wakeable", false);
    state.path_walk = null;
    state.path_walk_info = null;
    state.path_look = null;
    state.path_look_info = null;
  }

  /**
   * Add scheme handlers and subscribe them to events.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSleeperState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    // Add evaluator to check if sleep is needed.
    actionPlanner.add_evaluator(EEvaluatorId.NEED_SLEEPER, new EvaluatorNeedSleep(state));

    const actionSleeper: ActionSleeperActivity = new ActionSleeperActivity(state, object);

    actionSleeper.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.ANONALY, false));
    actionSleeper.add_precondition(new world_property(EEvaluatorId.NEED_SLEEPER, true));

    addCommonActionPreconditions(actionSleeper);

    actionSleeper.add_effect(new world_property(EEvaluatorId.NEED_SLEEPER, false));
    actionSleeper.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    actionPlanner.add_action(EActionId.SLEEP_ACTIVITY, actionSleeper);

    // Cannot use alife activity when need to sleep.
    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.NEED_SLEEPER, false));

    SchemeSleeper.subscribe(object, state, actionSleeper);
  }
}
