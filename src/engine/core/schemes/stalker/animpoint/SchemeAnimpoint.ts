import { world_property } from "xray16";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { ActionAnimpoint, ActionReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/actions";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { AnimpointManager } from "@/engine/core/schemes/stalker/animpoint/AnimpointManager";
import { EvaluatorReachAnimpoint } from "@/engine/core/schemes/stalker/animpoint/evaluators";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, GameObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Logical scheme for stalkers to implement animation.
 * As example - sitting, standing near table etc.
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
    logger.info("Activate scheme:", object.name(), scheme, section);

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

    state.reachDistanceSqr = readIniNumber(ini, section, "reach_distance", false, 0.75);
    state.reachDistanceSqr *= state.reachDistanceSqr; // Calculate for sqr comparison.

    const rawAvailableAnimations: Optional<string> = readIniString(ini, section, "avail_animations", false);

    state.availableAnimations = rawAvailableAnimations === null ? null : parseStringsList(rawAvailableAnimations);

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    schemeState: ISchemeAnimpointState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    planner.add_evaluator(EEvaluatorId.IS_ANIMPOINT_REACHED, new EvaluatorReachAnimpoint(schemeState));
    planner.add_evaluator(
      EEvaluatorId.IS_ANIMPOINT_NEEDED,
      new EvaluatorSectionActive(schemeState, "EvaluatorSleepSectionActive")
    );

    schemeState.animpointManager = new AnimpointManager(object, schemeState);

    AbstractScheme.subscribe(object, schemeState, schemeState.animpointManager);

    const actionReachAnimpoint: ActionReachAnimpoint = new ActionReachAnimpoint(schemeState);

    addCommonActionPreconditions(actionReachAnimpoint);
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, true));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_REACHED, false));

    actionReachAnimpoint.add_effect(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
    actionReachAnimpoint.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));

    planner.add_action(EActionId.ANIMPOINT_REACH, actionReachAnimpoint);

    const actionAnimpoint: ActionAnimpoint = new ActionAnimpoint(schemeState);

    addCommonActionPreconditions(actionAnimpoint);
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, true));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_REACHED, true));
    actionAnimpoint.add_effect(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
    actionAnimpoint.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    planner.add_action(EActionId.ANIMPOINT_ACTIVITY, actionAnimpoint);

    AbstractScheme.subscribe(object, schemeState, actionAnimpoint);

    // Cannot go to alife simulation if animation is defined.
    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
  }
}
