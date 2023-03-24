import { action_planner, object, time_global, XR_action_planner, XR_game_object, XR_vector } from "xray16";

import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import { EStalkerState, EStateActionId, ITargetStateDescriptor } from "@/engine/core/objects/state/types";
import { getObjectAnimationWeapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors } from "@/engine/core/utils/vector";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { AnyCallable, AnyObject, Optional, TDuration, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo:
 * - Refactor and simplify
 * - Simplify creation of actions with some helper function and evaluators descriptor?
 */
export class StalkerStateManager {
  public npc: XR_game_object;
  public animation!: StalkerAnimationManager;
  public animstate!: StalkerAnimationManager;
  public planner: XR_action_planner;

  public target_state: EStalkerState = EStalkerState.IDLE;
  public current_object: Optional<XR_game_object> | -1 = null;
  public combat: boolean = false;
  public alife: boolean = true;
  public animation_position: Optional<XR_vector> = null;
  public animation_direction: Optional<XR_vector> = null;
  public pos_direction_applied: boolean = false;
  public look_position: Optional<XR_vector> = null;
  public point_obj_dir?: boolean;
  public isForced: Optional<boolean> = null;
  public look_object: Optional<number> = null;

  public callback: Optional<{
    begin: Optional<number>;
    timeout: Optional<number>;
    func: Optional<AnyCallable>;
    turn_end_func: Optional<AnyCallable>;
    obj: AnyObject;
  }> = null;

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object) {
    this.npc = object;
    this.planner = new action_planner();
    this.planner.setup(object);
  }

  /**
   * todo: Description.
   */
  public setState(
    stateName: EStalkerState,
    callback: Optional<AnyObject>,
    timeout: Optional<TDuration>,
    target: Optional<ITargetStateDescriptor>,
    extra: Optional<{
      isForced?: boolean;
      animation_position?: Optional<XR_vector>;
      animation_direction?: Optional<XR_vector>;
    }>
  ): void {
    assert(states.get(stateName), "Invalid set state called: '%s' fo '%s'.", stateName, this.npc.name());

    if (target !== null) {
      this.look_position = target.look_position;

      if (target.look_object !== null) {
        this.look_object = target.look_object.id();
      } else {
        this.look_object = null;
      }
    } else {
      this.look_position = null;
      this.look_object = null;
    }

    if (this.target_state !== stateName) {
      logger.info("Set state:", this);

      if (
        (states.get(this.target_state).weapon === "fire" || states.get(this.target_state).weapon === "sniper_fire") &&
        states.get(stateName).weapon !== "fire" &&
        states.get(stateName).weapon !== "sniper_fire"
      ) {
        if (this.npc.weapon_unstrapped()) {
          this.npc.set_item(object.idle, getObjectAnimationWeapon(this.npc, stateName));
        }
      }

      if (states.get(stateName).special_danger_move === true) {
        if (this.npc.special_danger_move() !== true) {
          this.npc.special_danger_move(true);
        }
      } else {
        if (this.npc.special_danger_move() === true) {
          this.npc.special_danger_move(false);
        }
      }

      this.target_state = stateName;
      this.current_object = null;

      if (extra !== null) {
        this.isForced = extra.isForced === true;

        if (
          this.pos_direction_applied === false ||
          (this.animation_position !== null &&
            extra.animation_position !== null &&
            !areSameVectors(this.animation_position, extra.animation_position as XR_vector)) ||
          (this.animation_direction !== null &&
            extra.animation_direction !== null &&
            !areSameVectors(this.animation_direction, extra.animation_direction as XR_vector))
        ) {
          this.animation_position = extra.animation_position as Optional<XR_vector>;
          this.animation_direction = extra.animation_direction as Optional<XR_vector>;
          this.pos_direction_applied = false;
        }
      } else {
        this.animation_position = null;
        this.animation_direction = null;
        this.pos_direction_applied = false;
        this.isForced = null;
      }

      this.callback = callback as any;

      if (timeout !== null && timeout >= 0) {
        this.callback!.timeout = timeout;
        this.callback!.begin = null;
      } else {
        if (this.callback) {
          this.callback.func = null;
          this.callback.timeout = null;
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public getState(): Optional<string> {
    return this.target_state;
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.animation.states.current_state === states.get(this.target_state).animation) {
      if (this.callback !== null && this.callback.func !== null) {
        const now: TTimestamp = time_global();

        if (this.callback.begin === null) {
          this.callback.begin = now;
          logger.info("Callback initialized:", this);
        } else {
          if (now - this.callback.begin >= this.callback.timeout!) {
            logger.info("Callback called:", this);

            const a = this.callback.func;
            const b = this.callback.obj;

            this.callback.begin = null;
            this.callback.func = null;

            a(b);
          }
        }
      }
    }

    this.planner.update();

    if (!this.planner.initialized()) {
      return;
    }

    let plannerPreviousActionId: Optional<TNumberId> = null;
    let plannerCurrentActionId: TNumberId = this.planner.current_action_id();

    while (
      plannerCurrentActionId !== plannerPreviousActionId &&
      plannerCurrentActionId !== EStateActionId.end &&
      plannerCurrentActionId !== EStateActionId.locked
    ) {
      plannerPreviousActionId = plannerCurrentActionId;
      this.planner.update();
      plannerCurrentActionId = this.planner.current_action_id();
    }

    // --this.planner:show("")
  }

  /**
   * todo: Description.
   */
  public toString(): string {
    return `StalkerStateManager #npc: ${this.npc.name()} #target_state: ${this.target_state} #combat: ${
      this.combat
    } #pos_direction_applied: ${this.pos_direction_applied} #current_object ${
      type(this.current_object) === "number" ? this.current_object : type(this.current_object)
    }`;
  }
}
