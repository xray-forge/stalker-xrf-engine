import { stalker_ids, time_global, world_property, XR_action_planner, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { ActionAbuseHit } from "@/mod/scripts/core/schemes/abuse/actions/ActionAbuseHit";
import { EvaluatorAbuse } from "@/mod/scripts/core/schemes/abuse/evaluators/EvaluatorAbuse";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
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
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    const operators = {
      abuse: action_ids.abuse_base,
    };
    const properties = {
      abuse: evaluators_id.abuse_base,
      wounded: evaluators_id.sidor_wounded_base,
    };

    const manager: XR_action_planner = object.motivation_action_manager();

    // -- Evaluators
    manager.add_evaluator(properties.abuse, new EvaluatorAbuse(state));

    // -- Actions
    const action = new ActionAbuseHit(state);

    action.add_precondition(new world_property(stalker_ids.property_alive, true));
    action.add_precondition(new world_property(stalker_ids.property_danger, false));
    action.add_precondition(new world_property(properties.wounded, false));
    action.add_precondition(new world_property(properties.abuse, true));
    action.add_effect(new world_property(properties.abuse, false));
    manager.add_action(operators.abuse, action);

    const alifeAction = manager.action(action_ids.alife);

    alifeAction.add_precondition(new world_property(properties.abuse, false));

    state.abuse_manager = new SchemeAbuse(object, state);
  }

  /**
   * todo;
   */
  public static setAbuse(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const st = assignStorageAndBind(object, ini, scheme, section);
  }

  /**
   * todo;
   */
  public static addAbuse(object: XR_game_object, value: number): void {
    const t: Optional<{ abuse_manager: SchemeAbuse }> = registry.objects.get(object.id()).abuse;

    if (t) {
      t.abuse_manager.addAbuse(value);
    }
  }

  /**
   * todo;
   */
  public static override resetScheme(
    object: XR_game_object,
    scheme: EScheme,
    state: IStoredObject,
    section: TSection
  ): void {}

  /**
   * todo;
   */
  public static clear_abuse(object: XR_game_object): void {
    const state = registry.objects.get(object.id()).abuse;

    if (state) {
      state.abuse_manager.clearAbuse();
    }
  }

  /**
   * todo;
   */
  public static disable_abuse(object: XR_game_object): void {
    const state = registry.objects.get(object.id()).abuse;

    if (state) {
      state.abuse_manager.disableAbuse();
    }
  }

  /**
   * todo;
   */
  public static enable_abuse(object: XR_game_object): void {
    const state = registry.objects.get(object.id()).abuse;

    if (state) {
      state.abuse_manager.enableAbuse();
    }
  }

  /**
   * todo;
   */
  public static is_abuse(object: XR_game_object): boolean {
    const state = registry.objects.get(object.id()).abuse;

    if (state === null) {
      return false;
    }

    return state.abuse_manager.enable;
  }

  public enable: boolean;
  public abuse_rate: number;
  public abuse_value: number;
  public abuse_threshold: number;
  public last_update: Optional<number>;
  public hit_done: boolean;

  public constructor(object: XR_game_object, state: IStoredObject) {
    super(object, state);

    this.enable = true;
    this.abuse_rate = 2;
    this.abuse_value = 0;
    this.abuse_threshold = 5;
    this.last_update = null;
    this.hit_done = false;
  }

  public SetAbuseRate(rate: number): void {
    this.abuse_rate = rate;
  }

  public abused(): boolean {
    return this.abuse_value >= this.abuse_threshold;
  }

  public override update(): boolean {
    if (this.last_update === null) {
      this.last_update = time_global();
    }

    if (this.abuse_value > 0) {
      this.abuse_value = this.abuse_value - (time_global() - this.last_update) * 0.00005;
    } else {
      this.abuse_value = 0;
    }

    if (this.abuse_value > this.abuse_threshold * 1.1) {
      this.abuse_value = this.abuse_threshold * 1.1;
    }

    if (this.hit_done && this.abuse_value < (this.abuse_threshold * 2) / 3) {
      this.hit_done = false;
    }

    this.last_update = time_global();

    return this.abused();
  }

  public addAbuse(value: number): void {
    if (this.enable) {
      this.abuse_value = this.abuse_value + value * this.abuse_rate;
    }
  }

  public clearAbuse(): void {
    this.abuse_value = 0;
  }

  public disableAbuse(): void {
    this.enable = false;
  }

  public enableAbuse(): void {
    this.enable = true;
  }
}
