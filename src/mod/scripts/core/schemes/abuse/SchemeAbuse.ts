import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { AbuseManager } from "@/mod/scripts/core/schemes/abuse/AbuseManager";
import { ActionAbuseHit } from "@/mod/scripts/core/schemes/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/mod/scripts/core/schemes/abuse/evaluators/EvaluatorAbuse";
import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse/ISchemeAbuseState";
import { AbstractScheme, action_ids, evaluators_id } from "@/mod/scripts/core/schemes/base";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeAbuse");

/**
 * todo;
 */
export class SchemeAbuse extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.ABUSE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo;
   */
  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: ISchemeAbuseState
  ): void {
    const operators = {
      abuse: action_ids.abuse_base,
    };
    const properties = {
      abuse: evaluators_id.abuse_base,
      wounded: evaluators_id.sidor_wounded_base,
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

    actionPlanner.action(action_ids.alife).add_precondition(new world_property(properties.abuse, false));

    state.abuse_manager = new AbuseManager(object, state);
  }

  /**
   * todo;
   */
  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    AbstractScheme.assignStateAndBind(object, ini, scheme, section);
  }

  /**
   * todo;
   */
  public static addAbuse(object: XR_game_object, value: number): void {
    const abuseState: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    abuseState?.abuse_manager.addAbuse(value);
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {}

  /**
   * todo;
   */
  public static clearAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuse_manager.clearAbuse();
  }

  /**
   * todo;
   */
  public static disableAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuse_manager.disableAbuse();
  }

  /**
   * todo;
   */
  public static enableAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuse_manager.enableAbuse();
  }

  /**
   * todo;
   */
  public static isAbuse(object: XR_game_object): boolean {
    const state = registry.objects.get(object.id())[SchemeAbuse.SCHEME_SECTION] as ISchemeAbuseState;

    if (state === null) {
      return false;
    }

    return state.abuse_manager.enable;
  }
}
