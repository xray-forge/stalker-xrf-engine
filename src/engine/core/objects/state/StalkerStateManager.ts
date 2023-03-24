import {
  action_planner,
  object,
  time_global,
  world_property,
  world_state,
  XR_action_planner,
  XR_game_object,
  XR_vector,
  XR_world_state,
} from "xray16";

import { registry } from "@/engine/core/database";
import * as animationManagement from "@/engine/core/objects/state/animation";
import * as animationStateManagement from "@/engine/core/objects/state/animation_state";
import * as bodyStateManagement from "@/engine/core/objects/state/body_state";
import * as directionManagement from "@/engine/core/objects/state/direction";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { animations } from "@/engine/core/objects/state/lib/state_mgr_animation_list";
import { animstates } from "@/engine/core/objects/state/lib/state_mgr_animstate_list";
import * as mentalManagement from "@/engine/core/objects/state/mental";
import * as movementManagement from "@/engine/core/objects/state/movement";
import * as smartCoverManagement from "@/engine/core/objects/state/smart_cover";
import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import * as stateManagement from "@/engine/core/objects/state/state";
import {
  EStalkerStateType,
  EStateActionId,
  EStateEvaluatorId,
  ITargetStateDescriptor,
} from "@/engine/core/objects/state/types";
import * as weaponManagement from "@/engine/core/objects/state/weapon";
import { getObjectAnimationWeapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { LuaLogger } from "@/engine/core/utils/logging";
import { stringifyAsJson } from "@/engine/core/utils/transform/json";
import { areSameVectors } from "@/engine/core/utils/vector";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { AnyCallable, AnyObject, Optional, TDuration, TName, TTimestamp } from "@/engine/lib/types";

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

  public target_state: string = EStalkerStateType.IDLE;
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

    goap_graph(this, object);

    logger.info("Construct state manager for:", this);
  }

  /**
   * todo: Description.
   */
  public setState(
    stateName: TName,
    callback: Optional<AnyObject>,
    timeout: Optional<TDuration>,
    target: Optional<ITargetStateDescriptor>,
    extra: Optional<{
      isForced?: boolean;
      animation_position?: Optional<XR_vector>;
      animation_direction?: Optional<XR_vector>;
    }>
  ): void {
    assert(
      states.get(stateName),
      "Invalid set state called: '%s' fo '%s'.",
      stringifyAsJson(stateName),
      this.npc.name()
    );

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

    let last_pl_id = null;
    let pl_id = this.planner.current_action_id();

    while (pl_id !== last_pl_id && pl_id !== EStateActionId.end && pl_id !== EStateActionId.locked) {
      last_pl_id = pl_id;
      this.planner.update();
      pl_id = this.planner.current_action_id();
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

/**
 * todo;
 */
export function setStalkerState(
  object: XR_game_object,
  state_name: string,
  callback: Optional<AnyCallable> | AnyObject,
  timeout: Optional<number>,
  target: Optional<ITargetStateDescriptor>,
  extra: Optional<AnyObject>
): void {
  registry.objects.get(object.id()).state_mgr?.setState(state_name, callback, timeout, target, extra);
}

/**
 * todo;
 */
export function getStalkerState(object: XR_game_object): Optional<string> {
  return registry.objects.get(object.id()).state_mgr?.getState() as Optional<string>;
}

/**
 * todo;
 */
export function goap_graph(stateManager: StalkerStateManager, object: XR_game_object): void {
  stateManager.planner.add_evaluator(EStateEvaluatorId.end, new stateManagement.EvaluatorStateEnd(stateManager));
  stateManager.planner.add_evaluator(EStateEvaluatorId.locked, new stateManagement.EvaluatorStateLocked(stateManager));
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.locked_external,
    new stateManagement.EvaluatorStateLockedExternal(stateManager)
  );

  stateManager.planner.add_evaluator(EStateEvaluatorId.weapon, new weaponManagement.EvaluatorWeapon(stateManager));
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_locked,
    new weaponManagement.EvaluatorWeaponLocked(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_strapped,
    new weaponManagement.EvaluatorWeaponStrapped(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_strapped_now,
    new weaponManagement.EvaluatorWeaponStrappedNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_unstrapped,
    new weaponManagement.EvaluatorWeaponUnstrapped(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_unstrapped_now,
    new weaponManagement.EvaluatorWeaponUnstrappedNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_none,
    new weaponManagement.EvaluatorWeaponNone(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_none_now,
    new weaponManagement.EvaluatorWeaponNoneNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_drop,
    new weaponManagement.EvaluatorWeaponDrop(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.weapon_fire,
    new weaponManagement.EvaluatorWeaponFire(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateEvaluatorId.movement,
    new movementManagement.StateManagerEvaMovement(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.movement_walk,
    new movementManagement.StateManagerEvaMovementWalk(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.movement_run,
    new movementManagement.StateManagerEvaMovementRun(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.movement_stand,
    new movementManagement.StateManagerEvaMovementStand(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.movement_stand_now,
    new movementManagement.StateManagerEvaMovementStandNow(stateManager)
  );

  stateManager.planner.add_evaluator(EStateEvaluatorId.mental, new mentalManagement.EvaluatorMental(stateManager));
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.mental_free,
    new mentalManagement.EvaluatorMentalFree(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.mental_free_now,
    new mentalManagement.EvaluatorMentalFreeNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.mental_danger,
    new mentalManagement.EvaluatorMentalDanger(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.mental_danger_now,
    new mentalManagement.EvaluatorMentalDangerNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.mental_panic,
    new mentalManagement.EvaluatorMentalPanic(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.mental_panic_now,
    new mentalManagement.EvaluatorMentalPanicNow(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateEvaluatorId.bodystate,
    new bodyStateManagement.EvaluatorBodyState(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.bodystate_crouch,
    new bodyStateManagement.EvaluatorBodyStateCrouch(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.bodystate_standing,
    new bodyStateManagement.EvaluatorBodyStateStanding(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.bodystate_crouch_now,
    new bodyStateManagement.EvaluatorBodyStateCrouchNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.bodystate_standing_now,
    new bodyStateManagement.EvaluatorBodyStateStandingNow(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateEvaluatorId.direction,
    new directionManagement.EvaluatorDirection(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.direction_search,
    new directionManagement.EvaluatorDirectionSearch(stateManager)
  );

  stateManager.animstate = new StalkerAnimationManager(object, stateManager, "state_mgr_animstate_list", animstates);

  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animstate,
    new animationStateManagement.EvaluatorAnimationState(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animstate_idle_now,
    new animationStateManagement.EvaluatorAnimationStateIdleNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animstate_play_now,
    new animationStateManagement.EvaluatorAnimationStatePlayNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animstate_locked,
    new animationStateManagement.EvaluatorAnimationStateLocked(stateManager)
  );

  stateManager.animation = new StalkerAnimationManager(object, stateManager, "state_mgr_animation_list", animations);

  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animation,
    new animationManagement.EvaluatorAnimation(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animation_play_now,
    new animationManagement.EvaluatorAnimationPlayNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animation_none_now,
    new animationManagement.EvaluatorAnimationNoneNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.animation_locked,
    new animationManagement.EvaluatorAnimationLocked(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateEvaluatorId.smartcover,
    new smartCoverManagement.EvaluatorSmartCover(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.smartcover_need,
    new smartCoverManagement.EvaluatorSmartCoverNeed(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateEvaluatorId.in_smartcover,
    new smartCoverManagement.EvaluatorInSmartCover(stateManager)
  );

  // --	st.planner.add_evaluator(EStateManagerProperty.smartcover_locked,
  // state_mgr_smartcover.eva_state_mgr_smartcover_locked("state_mgr_smartcover_locked", st))

  // --************************************************************************************
  // --*                               SMART_ACTIONS                                      *
  // --************************************************************************************

  // -- WEAPON
  // -- UNSTRAPP

  const unstrappAction = new weaponManagement.ActionWeaponUnstrap(stateManager);

  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.weapon_unstrapped, true));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  unstrappAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  unstrappAction.add_effect(new world_property(EStateEvaluatorId.weapon, true));
  stateManager.planner.add_action(EStateActionId.weapon_unstrapp, unstrappAction);

  // -- STRAPP
  const strappAction = new weaponManagement.ActionWeaponStrap(stateManager);

  strappAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.weapon_strapped, true));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  strappAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  strappAction.add_effect(new world_property(EStateEvaluatorId.weapon, true));
  stateManager.planner.add_action(EStateActionId.weapon_strapp, strappAction);

  // -- NONE
  const weaponNoneAction = new weaponManagement.ActionWeaponNone(stateManager);

  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.weapon_none, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  weaponNoneAction.add_effect(new world_property(EStateEvaluatorId.weapon, true));
  stateManager.planner.add_action(EStateActionId.weapon_none, weaponNoneAction);

  // -- DROP
  const weaponDropAction = new weaponManagement.ActionWeaponDrop(stateManager);

  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.weapon_drop, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  weaponDropAction.add_effect(new world_property(EStateEvaluatorId.weapon, true));
  stateManager.planner.add_action(EStateActionId.weapon_drop, weaponDropAction);

  // -- WALK
  const movementWalkAction = new movementManagement.StateManagerActMovementWalk(stateManager);

  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.movement_walk, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  movementWalkAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  stateManager.planner.add_action(EStateActionId.movement_walk, movementWalkAction);

  // -- WALK_turn

  const movementWalkTurnAction = new movementManagement.StateManagerActMovementWalkTurn(stateManager);

  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement_walk, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  movementWalkTurnAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  movementWalkTurnAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.movement_walk_turn, movementWalkTurnAction);

  // -- WALK_search
  const movementWalkSearchAction = new movementManagement.StateManagerActMovementWalkSearch(stateManager);

  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement_walk, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  movementWalkSearchAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  movementWalkSearchAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.movement_walk_search, movementWalkSearchAction);

  // -- RUN
  const movementRunAction = new movementManagement.ActionMovementRun(stateManager);

  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.movement_run, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  movementRunAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  stateManager.planner.add_action(EStateActionId.movement_run, movementRunAction);

  // -- RUN_turn
  const movementRunTurnAction = new movementManagement.StateManagerActMovementRunTurn(stateManager);

  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement_run, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  movementRunTurnAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  movementRunTurnAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.movement_run_turn, movementRunTurnAction);

  // -- RUN_search
  const movementRunSearchAction = new movementManagement.StateManagerActMovementRunSearch(stateManager);

  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement_run, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  movementRunSearchAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  movementRunSearchAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.movement_run_search, movementRunSearchAction);

  // -- STAND
  const movementStandAction = new movementManagement.StateManagerActMovementStand(stateManager);

  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.movement_stand, true));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  movementStandAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  stateManager.planner.add_action(EStateActionId.movement_stand, movementStandAction);

  // -- STAND_turn
  const standTurnAction = new movementManagement.StateManagerActMovementStandTurn(stateManager);

  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement_stand, true));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  standTurnAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  standTurnAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.movement_stand_turn, standTurnAction);

  // -- STAND_search
  const movementStandSearchAction = new movementManagement.StateManagerActMovementStandSearch(stateManager);

  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, true));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement_stand, true));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  movementStandSearchAction.add_effect(new world_property(EStateEvaluatorId.movement, true));
  movementStandSearchAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.movement_stand_search, movementStandSearchAction);

  // -- DIRECTION

  // -- TURN
  const directionTurnAction = new directionManagement.ActionDirectionTurn(stateManager);

  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true)); // --!
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  directionTurnAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.direction_turn, directionTurnAction);

  // -- SEARCH
  const directionSearchAction = new directionManagement.ActionDirectionSearch(stateManager);

  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.direction_search, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true)); // --!
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  directionSearchAction.add_effect(new world_property(EStateEvaluatorId.direction, true));
  stateManager.planner.add_action(EStateActionId.direction_search, directionSearchAction);

  // -- MENTAL STATES

  // -- FREE
  const mentalFreeAction = new mentalManagement.ActionMentalFree(stateManager);

  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.mental_free, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_standing_now, true));
  mentalFreeAction.add_effect(new world_property(EStateEvaluatorId.mental, true));
  stateManager.planner.add_action(EStateActionId.mental_free, mentalFreeAction);

  // -- DANGER

  const mentalDangerAction = new mentalManagement.ActionMentalDanger(stateManager);

  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.mental, false));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.mental_danger, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.mental, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.mental_danger_now, true));
  stateManager.planner.add_action(EStateActionId.mental_danger, mentalDangerAction);

  // -- PANIC

  const mentalPanicAction = new mentalManagement.ActionMentalPanic(stateManager);

  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.mental_panic, true));
  mentalPanicAction.add_effect(new world_property(EStateEvaluatorId.mental, true));
  stateManager.planner.add_action(EStateActionId.mental_panic, mentalPanicAction);

  // -- BODYSTATES

  // -- CROUCH
  const bodyStateStateCrouch = new bodyStateManagement.ActionBodyStateCrouch(stateManager);

  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.bodystate, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.bodystate_crouch_now, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.bodystate_crouch, true));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.mental_danger_now, true));
  bodyStateStateCrouch.add_effect(new world_property(EStateEvaluatorId.bodystate, true));
  stateManager.planner.add_action(EStateActionId.bodystate_crouch, bodyStateStateCrouch);

  // -- CROUCH_danger
  const bodyStateCrouchDangerAction = new bodyStateManagement.ActionBodyStateCrouchDanger(stateManager);

  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_crouch_now, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_crouch, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateEvaluatorId.bodystate, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateEvaluatorId.mental, true));
  stateManager.planner.add_action(EStateActionId.bodystate_crouch_danger, bodyStateCrouchDangerAction);

  // --  STAND

  const bodyStateStandingAction = new bodyStateManagement.ActionBodyStateStanding(stateManager);

  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_standing_now, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_standing, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.bodystate, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.bodystate_standing_now, true));
  stateManager.planner.add_action(EStateActionId.bodystate_standing, bodyStateStandingAction);

  // --  STAND_free

  const standingFreeAction = new bodyStateManagement.ActionBodyStateStandingFree(stateManager);

  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_standing_now, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.bodystate_standing, true));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.mental_free, false));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.bodystate, true));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.bodystate_standing_now, true));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.mental, true));
  stateManager.planner.add_action(EStateActionId.bodystate_standing_free, standingFreeAction);

  // -- ANIMSTATES
  const animationStateStartAction = new animationStateManagement.ActionAnimationStateStart(stateManager);

  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.animstate, false));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.smartcover, true));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.animation_none_now, true));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.direction, true));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  animationStateStartAction.add_precondition(new world_property(EStateEvaluatorId.animstate_play_now, false));
  animationStateStartAction.add_effect(new world_property(EStateEvaluatorId.animstate, true));
  stateManager.planner.add_action(EStateActionId.animstate_start, animationStateStartAction);

  const animationStateStopAction = new animationStateManagement.ActionAnimationStateStop(stateManager);

  animationStateStopAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  animationStateStopAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  animationStateStopAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, false));
  animationStateStopAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              false))
  animationStateStopAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, false));
  animationStateStopAction.add_precondition(new world_property(EStateEvaluatorId.animation_play_now, false));
  animationStateStopAction.add_effect(new world_property(EStateEvaluatorId.animstate, true));
  animationStateStopAction.add_effect(new world_property(EStateEvaluatorId.animstate_play_now, false));
  animationStateStopAction.add_effect(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  stateManager.planner.add_action(EStateActionId.animstate_stop, animationStateStopAction);

  // -- ANIMATION

  // -- START
  const animationStartAction = new animationManagement.ActionAnimationStart(stateManager);

  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.animstate, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.smartcover, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.in_smartcover, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.direction, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.animation, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.animation_play_now, false));
  animationStartAction.add_effect(new world_property(EStateEvaluatorId.animation, true));
  stateManager.planner.add_action(EStateActionId.animation_start, animationStartAction);

  // -- STOP
  const animationStopAction = new animationManagement.ActionAnimationStop(stateManager);

  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              true))
  // --action.add_precondition    (new world_property(EStateManagerProperty.animation,              false))
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.animation_play_now, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.animation, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.animation_play_now, false));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.animation_none_now, true));
  stateManager.planner.add_action(EStateActionId.animation_stop, animationStopAction);

  const smartCoverEnterAction = new smartCoverManagement.ActionSmartCoverEnter(stateManager);

  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.smartcover_need, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.smartcover, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.animstate_idle_now, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.animation_play_now, false));
  smartCoverEnterAction.add_effect(new world_property(EStateEvaluatorId.smartcover, true));
  stateManager.planner.add_action(EStateActionId.smartcover_enter, smartCoverEnterAction);

  const smartCoverExitAction = new smartCoverManagement.ActionSmartCoverExit(stateManager);

  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.locked, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.smartcover_need, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.smartcover, false));
  smartCoverExitAction.add_effect(new world_property(EStateEvaluatorId.smartcover, true));
  stateManager.planner.add_action(EStateActionId.smartcover_exit, smartCoverExitAction);

  const lockedSmartCoverAction = new stateManagement.ActionStateLocked(stateManager, "lockedSmartCoverAction");

  lockedSmartCoverAction.add_precondition(new world_property(EStateEvaluatorId.in_smartcover, true));
  lockedSmartCoverAction.add_effect(new world_property(EStateEvaluatorId.in_smartcover, false));
  stateManager.planner.add_action(EStateActionId.locked_smartcover, lockedSmartCoverAction);

  const lockedAction = new stateManagement.ActionStateLocked(stateManager, "lockedAction");

  lockedAction.add_precondition(new world_property(EStateEvaluatorId.locked, true));
  lockedAction.add_effect(new world_property(EStateEvaluatorId.locked, false));
  stateManager.planner.add_action(EStateActionId.locked, lockedAction);

  const lockedAnimationAction = new stateManagement.ActionStateLocked(stateManager, "lockedAnimationAction");

  lockedAnimationAction.add_precondition(new world_property(EStateEvaluatorId.animation_locked, true));
  lockedAnimationAction.add_effect(new world_property(EStateEvaluatorId.animation_locked, false));
  stateManager.planner.add_action(EStateActionId.locked_animation, lockedAnimationAction);

  const lockedAnimstateAction = new stateManagement.ActionStateLocked(stateManager, "lockedAnimstateAction");

  lockedAnimstateAction.add_precondition(new world_property(EStateEvaluatorId.animstate_locked, true));
  lockedAnimstateAction.add_effect(new world_property(EStateEvaluatorId.animstate_locked, false));
  stateManager.planner.add_action(EStateActionId.locked_animstate, lockedAnimstateAction);

  const lockedExternalAction = new stateManagement.ActionStateLocked(stateManager, "lockedExternalAction");

  lockedExternalAction.add_precondition(new world_property(EStateEvaluatorId.locked_external, true));
  lockedExternalAction.add_effect(new world_property(EStateEvaluatorId.locked_external, false));
  stateManager.planner.add_action(EStateActionId.locked_external, lockedExternalAction);

  const endStateAction = new stateManagement.ActionStateEnd(stateManager);

  endStateAction.add_precondition(new world_property(EStateEvaluatorId.end, false));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.weapon, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.movement, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.mental, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.bodystate, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.direction, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.animstate, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.animation, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.smartcover, true));
  endStateAction.add_effect(new world_property(EStateEvaluatorId.end, true));
  stateManager.planner.add_action(EStateActionId.end, endStateAction);

  const goal: XR_world_state = new world_state();

  goal.add_property(new world_property(EStateEvaluatorId.end, true));
  stateManager.planner.set_goal_world_state(goal);
}
