import { stalker_ids, world_property } from "xray16";

import { EStalkerState } from "@/engine/core/objects/animation";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { ActionAnimpoint, ActionReachAnimpoint } from "@/engine/core/schemes/animpoint/actions";
import { AnimpointManager } from "@/engine/core/schemes/animpoint/AnimpointManager";
import { EvaluatorNeedAnimpoint, EvaluatorReachAnimpoint } from "@/engine/core/schemes/animpoint/evaluators";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { addCommonActionPreconditions } from "@/engine/core/utils/scheme/scheme_setup";
import { ActionPlanner, ClientObject, IniFile, Optional } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Logical scheme for stalkers to implement animation.
 * As example - sitting, standing near table etc.
 */
export class SchemeAnimpoint extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ANIMPOINT;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * Activate animation scheme.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    logger.info("Activate scheme:", object.name(), scheme, section);

    const state: ISchemeAnimpointState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.coverName = readIniString(ini, section, "cover_name", false, "", "$script_id$_cover");
    state.useCamp = readIniBoolean(ini, section, "use_camp", false, true);
    state.reachMovement = readIniString<EStalkerState>(
      ini,
      section,
      "reach_movement",
      false,
      "",
      EStalkerState.WALK
    ) as EStalkerState;

    state.reachDistance = readIniNumber(ini, section, "reach_distance", false, 0.75);
    state.reachDistance *= state.reachDistance; // Calculate for sqr comparison.

    const rawAvailableAnimations: Optional<string> = readIniString(ini, section, "avail_animations", false, "", null);

    state.availableAnimations = rawAvailableAnimations === null ? null : parseStringsList(rawAvailableAnimations);
  }

  /**
   * Add animation state to object state.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    schemeState: ISchemeAnimpointState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.IS_ANIMPOINT_NEEDED, new EvaluatorNeedAnimpoint(schemeState));
    actionPlanner.add_evaluator(EEvaluatorId.IS_ANIMPOINT_REACHED, new EvaluatorReachAnimpoint(schemeState));

    schemeState.animpoint = new AnimpointManager(object, schemeState);

    SchemeAnimpoint.subscribe(object, schemeState, schemeState.animpoint);

    const actionReachAnimpoint: ActionReachAnimpoint = new ActionReachAnimpoint(schemeState);

    actionReachAnimpoint.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionReachAnimpoint.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionReachAnimpoint.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, true));
    actionReachAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_REACHED, false));
    addCommonActionPreconditions(actionReachAnimpoint);
    actionReachAnimpoint.add_effect(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
    actionReachAnimpoint.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    actionPlanner.add_action(EActionId.ANIMPOINT_REACH, actionReachAnimpoint);

    SchemeAnimpoint.subscribe(object, schemeState, actionReachAnimpoint);

    const actionAnimpoint: ActionAnimpoint = new ActionAnimpoint(schemeState);

    actionAnimpoint.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionAnimpoint.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    actionAnimpoint.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, true));
    actionAnimpoint.add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_REACHED, true));
    addCommonActionPreconditions(actionAnimpoint);
    actionAnimpoint.add_effect(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
    actionAnimpoint.add_effect(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
    actionPlanner.add_action(EActionId.ANIMPOINT_ACTIVITY, actionAnimpoint);

    SchemeAnimpoint.subscribe(object, schemeState, actionAnimpoint);

    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_ANIMPOINT_NEEDED, false));
  }
}
