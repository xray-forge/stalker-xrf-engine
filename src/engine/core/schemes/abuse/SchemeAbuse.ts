import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { AbuseManager } from "@/engine/core/schemes/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/engine/core/schemes/abuse/evaluators/EvaluatorAbuse";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeAbuse extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ABUSE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }
  /**
   * todo: Description.
   */
  public static override add(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeAbuseState
  ): void {
    const operators = {
      abuse: EActionId.abuse_base,
    };
    const properties = {
      abuse: EEvaluatorId.abuse_base,
      wounded: EEvaluatorId.sidor_wounded_base,
    };

    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    // -- Evaluators
    actionPlanner.add_evaluator(properties.abuse, new EvaluatorAbuse(state));

    // -- Actions
    const action: ActionAbuseHit = new ActionAbuseHit(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(properties.wounded, false));
    action.add_precondition(new world_property(properties.abuse, true));
    action.add_effect(new world_property(properties.abuse, false));

    actionPlanner.add_action(operators.abuse, action);

    actionPlanner.action(EActionId.alife).add_precondition(new world_property(properties.abuse, false));

    state.abuse_manager = new AbuseManager(object, state);
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}

  /**
   * todo: Description.
   */
  public static addAbuse(object: XR_game_object, value: number): void {
    const abuseState: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    abuseState?.abuse_manager.addAbuse(value);
  }

  /**
   * todo: Description.
   */
  public static clearAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuse_manager.clearAbuse();
  }

  /**
   * todo: Description.
   */
  public static disableAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuse_manager.disableAbuse();
  }

  /**
   * todo: Description.
   */
  public static enableAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuse_manager.enableAbuse();
  }

  /**
   * todo: Description.
   */
  public static isAbuse(object: XR_game_object): boolean {
    const state = registry.objects.get(object.id())[SchemeAbuse.SCHEME_SECTION] as ISchemeAbuseState;

    if (state === null) {
      return false;
    }

    return state.abuse_manager.enable;
  }
}