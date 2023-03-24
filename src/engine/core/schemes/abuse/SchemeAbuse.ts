import { stalker_ids, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { AbuseManager } from "@/engine/core/schemes/abuse/AbuseManager";
import { ActionAbuseHit } from "@/engine/core/schemes/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/engine/core/schemes/abuse/evaluators/EvaluatorAbuse";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EScheme, ESchemeType, Optional, TCount, TSection } from "@/engine/lib/types";

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
    const actionPlanner: XR_action_planner = object.motivation_action_manager();

    actionPlanner.add_evaluator(EEvaluatorId.IS_ABUSED, new EvaluatorAbuse(state));

    const action: ActionAbuseHit = new ActionAbuseHit(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    action.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, true));
    action.add_effect(new world_property(EEvaluatorId.IS_ABUSED, false));

    actionPlanner.add_action(EActionId.ABUSE, action);

    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));

    state.abuseManager = new AbuseManager(object, state);
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
  public static addAbuse(object: XR_game_object, value: TCount): void {
    const abuseState: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    abuseState?.abuseManager.addAbuse(value);
  }

  /**
   * todo: Description.
   */
  public static clearAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuseManager.clearAbuse();
  }

  /**
   * todo: Description.
   */
  public static disableAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuseManager.disableAbuse();
  }

  /**
   * todo: Description.
   */
  public static enableAbuse(object: XR_game_object): void {
    const state: Optional<ISchemeAbuseState> = registry.objects.get(object.id())[
      SchemeAbuse.SCHEME_SECTION
    ] as ISchemeAbuseState;

    state?.abuseManager.enableAbuse();
  }

  /**
   * todo: Description.
   */
  public static isAbuse(object: XR_game_object): boolean {
    const state = registry.objects.get(object.id())[SchemeAbuse.SCHEME_SECTION] as ISchemeAbuseState;

    if (state === null) {
      return false;
    }

    return state.abuseManager.enable;
  }
}
