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
import { AnimationManager } from "@/engine/core/objects/state/AnimationManager";
import * as bodyStateManagement from "@/engine/core/objects/state/body_state";
import * as directionManagement from "@/engine/core/objects/state/direction";
import { EStateManagerOperator } from "@/engine/core/objects/state/EStateManagerOperator";
import { EStateManagerProperty } from "@/engine/core/objects/state/EStateManagerProperty";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { animations } from "@/engine/core/objects/state/lib/state_mgr_animation_list";
import { animstates } from "@/engine/core/objects/state/lib/state_mgr_animstate_list";
import * as mentalManagement from "@/engine/core/objects/state/mental";
import * as movementManagement from "@/engine/core/objects/state/movement";
import * as smartCoverManagement from "@/engine/core/objects/state/smart_cover";
import * as stateManagement from "@/engine/core/objects/state/state";
import * as weaponManagement from "@/engine/core/objects/state/weapon";
import { get_weapon } from "@/engine/core/objects/state/weapon/StateManagerWeapon";
import { abort } from "@/engine/core/utils/debug";
import { stringifyAsJson } from "@/engine/core/utils/json";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorCmp } from "@/engine/core/utils/physics";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { AnyCallable, AnyObject, Optional, TDuration, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
export interface ITargetStateDescriptor {
  look_object: Optional<XR_game_object>;
  look_position: Optional<XR_vector>;
}

/**
 * todo:
 * - Refactor and simplify
 * - Simplify creation of actions with some helper function and evaluators descriptor?
 */
export class StateManager {
  public npc: XR_game_object;
  public animation!: AnimationManager;
  public animstate!: AnimationManager;
  public planner: XR_action_planner;

  public target_state: string = "idle";
  public current_object: Optional<XR_game_object> | -1 = null;
  public combat: boolean = false;
  public alife: boolean = true;
  public animation_position: Optional<XR_vector> = null;
  public animation_direction: Optional<XR_vector> = null;
  public pos_direction_applied: boolean = false;
  public look_position: Optional<XR_vector> = null;
  public point_obj_dir?: boolean;
  public fast_set: Optional<boolean> = null;
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
  public constructor(npc: XR_game_object) {
    this.npc = npc;
    this.planner = new action_planner();
    this.planner.setup(npc);

    goap_graph(this, npc);

    logger.info("Construct state manager for:", this);
  }

  /**
   * todo: Description.
   */
  public set_state(
    state_name: TName,
    callback: Optional<AnyObject>,
    timeout: Optional<TDuration>,
    target: Optional<ITargetStateDescriptor>,
    extra: Optional<AnyObject>
  ): void {
    // --printf("Set State called: for %s State: %s", this.npc:name(), state_name)
    // --callstack()

    if (states.get(state_name) === null) {
      abort("ERROR: ILLEGAL SET STATE CALLED!!! %s fo %s", stringifyAsJson(state_name), this.npc.name());
    }

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

    if (this.target_state !== state_name) {
      logger.info("Set state:", this);

      if (
        (states.get(this.target_state).weapon === "fire" || states.get(this.target_state).weapon === "sniper_fire") &&
        // -- || this.target_state === "idle"
        states.get(state_name).weapon !== "fire" &&
        states.get(state_name).weapon !== "sniper_fire"
      ) {
        // --this.npc:set_item(state_mgr_weapon.get_idle_state(state_name),
        // state_mgr_weapon.get_weapon(this.npc, state_name))
        if (this.npc.weapon_unstrapped()) {
          this.npc.set_item(object.idle, get_weapon(this.npc, state_name));
          // --printf("[%s] stop shooting", this.npc:name())
        }
      }

      // --' �������� �� ������������� special_danger_move
      if (states.get(state_name).special_danger_move === true) {
        // --printf("SPECIAL DANGER MOVE %s for stalker [%s]",
        // tostring(this.npc:special_danger_move()), this.npc:name())
        if (this.npc.special_danger_move() !== true) {
          this.npc.special_danger_move(true);
        }
      } else {
        // --printf("SPECIAL DANGER MOVE %s for stalker [%s]",
        // tostring(this.npc:special_danger_move()), this.npc:name())
        if (this.npc.special_danger_move() === true) {
          this.npc.special_danger_move(false);
        }
      }

      this.target_state = state_name;
      this.current_object = null;

      if (extra !== null) {
        this.fast_set = extra.fast_set;

        if (
          this.pos_direction_applied === false ||
          (this.animation_position !== null &&
            extra.animation_position !== null &&
            !vectorCmp(this.animation_position, extra.animation_position)) ||
          (this.animation_direction !== null &&
            extra.animation_direction !== null &&
            !vectorCmp(this.animation_direction, extra.animation_direction))
        ) {
          this.animation_position = extra.animation_position;
          this.animation_direction = extra.animation_direction;
          this.pos_direction_applied = false;
        }
      } else {
        this.animation_position = null;
        this.animation_direction = null;
        this.pos_direction_applied = false;
        this.fast_set = null;
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
  public get_state(): Optional<string> {
    return this.target_state;
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.animation.states.current_state === states.get(this.target_state).animation) {
      if (this.callback !== null && this.callback.func !== null) {
        if (this.callback.begin === null) {
          this.callback.begin = time_global();
          logger.info("Callback initialized:", this);
        } else {
          if (time_global() - this.callback.begin >= this.callback.timeout!) {
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

    while (pl_id !== last_pl_id && pl_id !== EStateManagerOperator.end && pl_id !== EStateManagerOperator.locked) {
      last_pl_id = pl_id;
      this.planner.update();
      pl_id = this.planner.current_action_id();
    }

    // --this.planner:show("")
  }

  /**
   * todo: Description.
   */
  public __tostring(): string {
    return `StateManager #npc: ${this.npc.name()} #target_state: ${this.target_state} #combat: ${
      this.combat
    } #pos_direction_applied: ${this.pos_direction_applied} #current_object ${
      type(this.current_object) === "number" ? this.current_object : type(this.current_object)
    }`;
  }
}

/**
 * todo;
 */
export function set_state(
  npc: XR_game_object,
  state_name: string,
  callback: Optional<AnyCallable> | AnyObject,
  timeout: Optional<number>,
  target: Optional<ITargetStateDescriptor>,
  extra: Optional<AnyObject>
): void {
  registry.objects.get(npc.id()).state_mgr?.set_state(state_name, callback, timeout, target, extra);
}

/**
 * todo;
 */
export function get_state(npc: XR_game_object): Optional<string> {
  return registry.objects.get(npc.id()).state_mgr?.get_state() as Optional<string>;
}

/**
 * todo;
 */
export function goap_graph(stateManager: StateManager, object: XR_game_object): void {
  stateManager.planner.add_evaluator(EStateManagerProperty.end, new stateManagement.StateManagerEvaEnd(stateManager));
  stateManager.planner.add_evaluator(
    EStateManagerProperty.locked,
    new stateManagement.StateManagerEvaLocked(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.locked_external,
    new stateManagement.StateManagerEvaLockedExternal(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon,
    new weaponManagement.StateManagerEvaWeapon(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_locked,
    new weaponManagement.StateManagerEvaWeaponLocked(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_strapped,
    new weaponManagement.StateManagerEvaWeaponStrapped(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_strapped_now,
    new weaponManagement.StateManagerEvaWeaponStrappedNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_unstrapped,
    new weaponManagement.StateManagerEvaWeaponUnstrapped(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_unstrapped_now,
    new weaponManagement.StateManagerEvaWeaponUnstrappedNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_none,
    new weaponManagement.StateManagerEvaWeaponNone(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_none_now,
    new weaponManagement.StateManagerEvaWeaponNoneNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_drop,
    new weaponManagement.StateManagerEvaWeaponDrop(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.weapon_fire,
    new weaponManagement.StateManagerEvaWeaponFire(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateManagerProperty.movement,
    new movementManagement.StateManagerEvaMovement(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.movement_walk,
    new movementManagement.StateManagerEvaMovementWalk(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.movement_run,
    new movementManagement.StateManagerEvaMovementRun(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.movement_stand,
    new movementManagement.StateManagerEvaMovementStand(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.movement_stand_now,
    new movementManagement.StateManagerEvaMovementStandNow(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental,
    new mentalManagement.StateManagerEvaMental(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental_free,
    new mentalManagement.StateManagerEvaMentalFree(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental_free_now,
    new mentalManagement.StateManagerEvaMentalFreeNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental_danger,
    new mentalManagement.StateManagerEvaMentalDanger(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental_danger_now,
    new mentalManagement.StateManagerEvaMentalDangerNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental_panic,
    new mentalManagement.StateManagerEvaMentalPanic(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.mental_panic_now,
    new mentalManagement.StateManagerEvaMentalPanicNow(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateManagerProperty.bodystate,
    new bodyStateManagement.StateManagerEvaBodyState(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.bodystate_crouch,
    new bodyStateManagement.StateManagerEvaBodyStateCrouch(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.bodystate_standing,
    new bodyStateManagement.StateManagerEvaBodyStateStanding(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.bodystate_crouch_now,
    new bodyStateManagement.StateManagerEvaBodyStateCrouchNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.bodystate_standing_now,
    new bodyStateManagement.StateManagerEvaBodyStateStandingNow(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateManagerProperty.direction,
    new directionManagement.StateManagerEvaDirection(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.direction_search,
    new directionManagement.StateManagerEvaDirectionSearch(stateManager)
  );

  stateManager.animstate = new AnimationManager(object, stateManager, "state_mgr_animstate_list", animstates);

  stateManager.planner.add_evaluator(
    EStateManagerProperty.animstate,
    new animationStateManagement.StateManagerEvaAnimationState(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.animstate_idle_now,
    new animationStateManagement.StateManagerEvaAnimationStateIdleNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.animstate_play_now,
    new animationStateManagement.StateManagerEvaAnimationStatePlayNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.animstate_locked,
    new animationStateManagement.StateManagerEvaAnimationStateLocked(stateManager)
  );

  stateManager.animation = new AnimationManager(object, stateManager, "state_mgr_animation_list", animations);

  stateManager.planner.add_evaluator(
    EStateManagerProperty.animation,
    new animationManagement.StateManagerEvaAnimation(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.animation_play_now,
    new animationManagement.StateManagerEvaAnimationPlayNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.animation_none_now,
    new animationManagement.StateManagerEvaAnimationNoneNow(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.animation_locked,
    new animationManagement.StateManagerEvaAnimationLocked(stateManager)
  );

  stateManager.planner.add_evaluator(
    EStateManagerProperty.smartcover,
    new smartCoverManagement.StateManagerEvaSmartCover(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.smartcover_need,
    new smartCoverManagement.StateManagerEvaSmartCoverNeed(stateManager)
  );
  stateManager.planner.add_evaluator(
    EStateManagerProperty.in_smartcover,
    new smartCoverManagement.StateManagerEvaInSmartCover(stateManager)
  );

  // --	st.planner.add_evaluator(EStateManagerProperty.smartcover_locked,
  // state_mgr_smartcover.eva_state_mgr_smartcover_locked("state_mgr_smartcover_locked", st))

  // --************************************************************************************
  // --*                               SMART_ACTIONS                                      *
  // --************************************************************************************

  // -- WEAPON
  // -- UNSTRAPP

  const unstrappAction = new weaponManagement.StateManagerActWeaponUnstrapp(stateManager);

  unstrappAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.weapon_unstrapped, true));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  unstrappAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  unstrappAction.add_effect(new world_property(EStateManagerProperty.weapon, true));
  stateManager.planner.add_action(EStateManagerOperator.weapon_unstrapp, unstrappAction);

  // -- STRAPP
  const strappAction = new weaponManagement.StateManagerActWeaponStrapp(stateManager);

  strappAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  strappAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  strappAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  strappAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  strappAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  strappAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  strappAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  strappAction.add_precondition(new world_property(EStateManagerProperty.weapon_strapped, true));
  strappAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  strappAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  strappAction.add_effect(new world_property(EStateManagerProperty.weapon, true));
  stateManager.planner.add_action(EStateManagerOperator.weapon_strapp, strappAction);

  // -- NONE
  const weaponNoneAction = new weaponManagement.StateManagerActWeaponNone(stateManager);

  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.weapon_none, true));
  weaponNoneAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  weaponNoneAction.add_effect(new world_property(EStateManagerProperty.weapon, true));
  stateManager.planner.add_action(EStateManagerOperator.weapon_none, weaponNoneAction);

  // -- DROP
  const weaponDropAction = new weaponManagement.StateManagerActWeaponDrop(stateManager);

  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.weapon_drop, true));
  weaponDropAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  weaponDropAction.add_effect(new world_property(EStateManagerProperty.weapon, true));
  stateManager.planner.add_action(EStateManagerOperator.weapon_drop, weaponDropAction);

  // -- WALK
  const movementWalkAction = new movementManagement.StateManagerActMovementWalk(stateManager);

  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.movement_walk, true));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  movementWalkAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  movementWalkAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_walk, movementWalkAction);

  // -- WALK_turn

  const movementWalkTurnAction = new movementManagement.StateManagerActMovementWalkTurn(stateManager);

  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.movement_walk, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  movementWalkTurnAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  movementWalkTurnAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_walk_turn, movementWalkTurnAction);

  // -- WALK_search
  const movementWalkSearchAction = new movementManagement.StateManagerActMovementWalkSearch(stateManager);

  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.movement_walk, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  movementWalkSearchAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  movementWalkSearchAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_walk_search, movementWalkSearchAction);

  // -- RUN
  const movementRunAction = new movementManagement.StateManagerActMovementRun(stateManager);

  movementRunAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.movement_run, true));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  movementRunAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  movementRunAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_run, movementRunAction);

  // -- RUN_turn
  const movementRunTurnAction = new movementManagement.StateManagerActMovementRunTurn(stateManager);

  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.movement_run, true));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  movementRunTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  movementRunTurnAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  movementRunTurnAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_run_turn, movementRunTurnAction);

  // -- RUN_search
  const movementRunSearchAction = new movementManagement.StateManagerActMovementRunSearch(stateManager);

  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.movement_run, true));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  movementRunSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  movementRunSearchAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  movementRunSearchAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_run_search, movementRunSearchAction);

  // -- STAND
  const movementStandAction = new movementManagement.StateManagerActMovementStand(stateManager);

  movementStandAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementStandAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementStandAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementStandAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementStandAction.add_precondition(new world_property(EStateManagerProperty.movement_stand, true));
  movementStandAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  movementStandAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_stand, movementStandAction);

  // -- STAND_turn
  const standTurnAction = new movementManagement.StateManagerActMovementStandTurn(stateManager);

  standTurnAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.movement_stand, true));
  standTurnAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  standTurnAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  standTurnAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_stand_turn, standTurnAction);

  // -- STAND_search
  const movementStandSearchAction = new movementManagement.StateManagerActMovementStandSearch(stateManager);

  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.movement, false));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.movement_stand, true));
  movementStandSearchAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  movementStandSearchAction.add_effect(new world_property(EStateManagerProperty.movement, true));
  movementStandSearchAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.movement_stand_search, movementStandSearchAction);

  // -- DIRECTION

  // -- TURN
  const directionTurnAction = new directionManagement.StateManagerActDirectionTurn(stateManager);

  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.weapon, true)); // --!
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  directionTurnAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  directionTurnAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.direction_turn, directionTurnAction);

  // -- SEARCH
  const directionSearchAction = new directionManagement.StateManagerActDirectionSearch(stateManager);

  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.direction, false));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.weapon, true)); // --!
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  directionSearchAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  directionSearchAction.add_effect(new world_property(EStateManagerProperty.direction, true));
  stateManager.planner.add_action(EStateManagerOperator.direction_search, directionSearchAction);

  // -- MENTAL STATES

  // -- FREE
  const mentalFreeAction = new mentalManagement.StateManagerActMentalFree(stateManager);

  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.mental_free, true));
  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  mentalFreeAction.add_precondition(new world_property(EStateManagerProperty.bodystate_standing_now, true));
  mentalFreeAction.add_effect(new world_property(EStateManagerProperty.mental, true));
  stateManager.planner.add_action(EStateManagerOperator.mental_free, mentalFreeAction);

  // -- DANGER

  const mentalDangerAction = new mentalManagement.StateManagerActMentalDanger(stateManager);

  mentalDangerAction.add_precondition(new world_property(EStateManagerProperty.mental, false));
  mentalDangerAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalDangerAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  mentalDangerAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  mentalDangerAction.add_precondition(new world_property(EStateManagerProperty.mental_danger, true));
  mentalDangerAction.add_effect(new world_property(EStateManagerProperty.mental, true));
  mentalDangerAction.add_effect(new world_property(EStateManagerProperty.mental_danger_now, true));
  stateManager.planner.add_action(EStateManagerOperator.mental_danger, mentalDangerAction);

  // -- PANIC

  const mentalPanicAction = new mentalManagement.StateManagerActMentalPanic(stateManager);

  mentalPanicAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  mentalPanicAction.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  mentalPanicAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  mentalPanicAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  mentalPanicAction.add_precondition(new world_property(EStateManagerProperty.mental_panic, true));
  mentalPanicAction.add_effect(new world_property(EStateManagerProperty.mental, true));
  stateManager.planner.add_action(EStateManagerOperator.mental_panic, mentalPanicAction);

  // -- BODYSTATES

  // -- CROUCH
  const bodyStateStateCrouch = new bodyStateManagement.StateManagerActBodyStateCrouch(stateManager);

  bodyStateStateCrouch.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStateCrouch.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch_now, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch, true));
  bodyStateStateCrouch.add_precondition(new world_property(EStateManagerProperty.mental_danger_now, true));
  bodyStateStateCrouch.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  stateManager.planner.add_action(EStateManagerOperator.bodystate_crouch, bodyStateStateCrouch);

  // -- CROUCH_danger
  const bodyStateCrouchDangerAction = new bodyStateManagement.StateManagerActBodyStateCrouchDanger(stateManager);

  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch_now, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateManagerProperty.mental, true));
  stateManager.planner.add_action(EStateManagerOperator.bodystate_crouch_danger, bodyStateCrouchDangerAction);

  // --  STAND

  const bodyStateStandingAction = new bodyStateManagement.StateManagerActBodyStateStanding(stateManager);

  bodyStateStandingAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStandingAction.add_precondition(new world_property(EStateManagerProperty.bodystate_standing_now, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateManagerProperty.bodystate_standing, true));
  bodyStateStandingAction.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  bodyStateStandingAction.add_effect(new world_property(EStateManagerProperty.bodystate_standing_now, true));
  stateManager.planner.add_action(EStateManagerOperator.bodystate_standing, bodyStateStandingAction);

  // --  STAND_free

  const standingFreeAction = new bodyStateManagement.StateManagerActBodyStateStandingFree(stateManager);

  standingFreeAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  standingFreeAction.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  standingFreeAction.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  standingFreeAction.add_precondition(new world_property(EStateManagerProperty.bodystate_standing_now, false));
  standingFreeAction.add_precondition(new world_property(EStateManagerProperty.bodystate_standing, true));
  standingFreeAction.add_precondition(new world_property(EStateManagerProperty.mental_free, false));
  standingFreeAction.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  standingFreeAction.add_effect(new world_property(EStateManagerProperty.bodystate_standing_now, true));
  standingFreeAction.add_effect(new world_property(EStateManagerProperty.mental, true));
  stateManager.planner.add_action(EStateManagerOperator.bodystate_standing_free, standingFreeAction);

  // -- ANIMSTATES
  const animationStateStartAction = new animationStateManagement.StateManagerActAnimationStateStart(stateManager);

  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.animstate, false));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.smartcover, true));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.direction, true));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  animationStateStartAction.add_precondition(new world_property(EStateManagerProperty.animstate_play_now, false));
  animationStateStartAction.add_effect(new world_property(EStateManagerProperty.animstate, true));
  stateManager.planner.add_action(EStateManagerOperator.animstate_start, animationStateStartAction);

  const animationStateStopAction = new animationStateManagement.StateManagerActAnimationStateStop(stateManager);

  animationStateStopAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  animationStateStopAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  animationStateStopAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  animationStateStopAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              false))
  animationStateStopAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, false));
  animationStateStopAction.add_precondition(new world_property(EStateManagerProperty.animation_play_now, false));
  animationStateStopAction.add_effect(new world_property(EStateManagerProperty.animstate, true));
  animationStateStopAction.add_effect(new world_property(EStateManagerProperty.animstate_play_now, false));
  animationStateStopAction.add_effect(new world_property(EStateManagerProperty.animstate_idle_now, true));
  stateManager.planner.add_action(EStateManagerOperator.animstate_stop, animationStateStopAction);

  // -- ANIMATION

  // -- START
  const animationStartAction = new animationManagement.StateManagerActAnimationStart(stateManager);

  animationStartAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.animstate, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.smartcover, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.in_smartcover, false));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.direction, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.animation, false));
  animationStartAction.add_precondition(new world_property(EStateManagerProperty.animation_play_now, false));
  animationStartAction.add_effect(new world_property(EStateManagerProperty.animation, true));
  stateManager.planner.add_action(EStateManagerOperator.animation_start, animationStartAction);

  // -- STOP
  const animationStopAction = new animationManagement.StateManagerActAnimationStop(stateManager);

  animationStopAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  animationStopAction.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              true))
  // --action.add_precondition    (new world_property(EStateManagerProperty.animation,              false))
  animationStopAction.add_precondition(new world_property(EStateManagerProperty.animation_play_now, true));
  animationStopAction.add_effect(new world_property(EStateManagerProperty.animation, true));
  animationStopAction.add_effect(new world_property(EStateManagerProperty.animation_play_now, false));
  animationStopAction.add_effect(new world_property(EStateManagerProperty.animation_none_now, true));
  stateManager.planner.add_action(EStateManagerOperator.animation_stop, animationStopAction);

  const smartCoverEnterAction = new smartCoverManagement.StateManagerActSmartCoverEnter(stateManager);

  smartCoverEnterAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateManagerProperty.smartcover_need, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateManagerProperty.smartcover, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateManagerProperty.animation_play_now, false));
  smartCoverEnterAction.add_effect(new world_property(EStateManagerProperty.smartcover, true));
  stateManager.planner.add_action(EStateManagerOperator.smartcover_enter, smartCoverEnterAction);

  const smartCoverExitAction = new smartCoverManagement.StateManagerActSmartCoverExit(stateManager);

  smartCoverExitAction.add_precondition(new world_property(EStateManagerProperty.locked, false));
  smartCoverExitAction.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  smartCoverExitAction.add_precondition(new world_property(EStateManagerProperty.smartcover_need, false));
  smartCoverExitAction.add_precondition(new world_property(EStateManagerProperty.smartcover, false));
  smartCoverExitAction.add_effect(new world_property(EStateManagerProperty.smartcover, true));
  stateManager.planner.add_action(EStateManagerOperator.smartcover_exit, smartCoverExitAction);

  const lockedSmartCoverAction = new stateManagement.StateManagerActLocked(stateManager, "lockedSmartCoverAction");

  lockedSmartCoverAction.add_precondition(new world_property(EStateManagerProperty.in_smartcover, true));
  lockedSmartCoverAction.add_effect(new world_property(EStateManagerProperty.in_smartcover, false));
  stateManager.planner.add_action(EStateManagerOperator.locked_smartcover, lockedSmartCoverAction);

  const lockedAction = new stateManagement.StateManagerActLocked(stateManager, "lockedAction");

  lockedAction.add_precondition(new world_property(EStateManagerProperty.locked, true));
  lockedAction.add_effect(new world_property(EStateManagerProperty.locked, false));
  stateManager.planner.add_action(EStateManagerOperator.locked, lockedAction);

  const lockedAnimationAction = new stateManagement.StateManagerActLocked(stateManager, "lockedAnimationAction");

  lockedAnimationAction.add_precondition(new world_property(EStateManagerProperty.animation_locked, true));
  lockedAnimationAction.add_effect(new world_property(EStateManagerProperty.animation_locked, false));
  stateManager.planner.add_action(EStateManagerOperator.locked_animation, lockedAnimationAction);

  const lockedAnimstateAction = new stateManagement.StateManagerActLocked(stateManager, "lockedAnimstateAction");

  lockedAnimstateAction.add_precondition(new world_property(EStateManagerProperty.animstate_locked, true));
  lockedAnimstateAction.add_effect(new world_property(EStateManagerProperty.animstate_locked, false));
  stateManager.planner.add_action(EStateManagerOperator.locked_animstate, lockedAnimstateAction);

  const lockedExternalAction = new stateManagement.StateManagerActLocked(stateManager, "lockedExternalAction");

  lockedExternalAction.add_precondition(new world_property(EStateManagerProperty.locked_external, true));
  lockedExternalAction.add_effect(new world_property(EStateManagerProperty.locked_external, false));
  stateManager.planner.add_action(EStateManagerOperator.locked_external, lockedExternalAction);

  const endStateAction = new stateManagement.StateManagerActEnd(stateManager);

  endStateAction.add_precondition(new world_property(EStateManagerProperty.end, false));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.movement, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.mental, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.direction, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.animstate, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.animation, true));
  endStateAction.add_precondition(new world_property(EStateManagerProperty.smartcover, true));
  endStateAction.add_effect(new world_property(EStateManagerProperty.end, true));
  stateManager.planner.add_action(EStateManagerOperator.end, endStateAction);

  const goal: XR_world_state = new world_state();

  goal.add_property(new world_property(EStateManagerProperty.end, true));
  stateManager.planner.set_goal_world_state(goal);
}
