import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EStalkerState } from "@/engine/core/animation/types";
import { ActionPlayAnimpoint, ActionReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/actions";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { EvaluatorReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/evaluators";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, GameObject, IniFile, Optional, TName } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme defining how to handle animation and static animation states.
 * As example - sitting, standing near table when in smart cover or waiting for quest scripts.
 */
export class SchemeAnimpoint extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ANIMPOINT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeAnimpointState {
    logger.info("Activate scheme: %s %s %s", object.name(), scheme, section);

    const state: ISchemeAnimpointState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.coverName = readIniString(ini, section, "cover_name", false, null, "$script_id$_cover");
    state.useCamp = readIniBoolean(ini, section, "use_camp", false, true);
    state.reachMovement = readIniString<EStalkerState>(
      ini,
      section,
      "reach_movement",
      false,
      null,
      EStalkerState.WALK
    ) as EStalkerState;

    state.reachDistanceSqr = Math.pow(readIniNumber(ini, section, "reach_distance", false, 0.75), 2);

    const rawAvailableAnimations: Optional<TName> = readIniString(ini, section, "avail_animations");

    state.availableAnimations = rawAvailableAnimations === null ? null : parseStringsList(rawAvailableAnimations);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeAnimpointState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(EEvaluatorId.IS_ANIMPOINT_REACHED, new EvaluatorReachAnimpoint(state));
    planner.add_evaluator(
      EEvaluatorId.IS_ANIMPOINT_NEEDED,
      new EvaluatorSectionActive(state, "EvaluatorSleepSectionActive")
    );

    const actionReachAnimpoint: ActionReachAnimpoint = new ActionReachAnimpoint(state);

    addCommonActionPreconditions(actionReachAnimpoint);
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, true));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_REACHED, false));
    actionReachAnimpoint.add_effect(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
    actionReachAnimpoint.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.ANIMPOINT_REACH, actionReachAnimpoint);

    const actionAnimpoint: ActionPlayAnimpoint = new ActionPlayAnimpoint(state);

    addCommonActionPreconditions(actionAnimpoint);
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, true));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_REACHED, true));
    actionAnimpoint.add_effect(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
    actionAnimpoint.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.ANIMPOINT_PLAY, actionAnimpoint);

    // Cannot go to alife simulation if animation is defined.
    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));

    state.animpointManager = new AnimpointManager(object, state);

    AbstractScheme.subscribe(state, actionAnimpoint);
    AbstractScheme.subscribe(state, state.animpointManager);
  }
}
