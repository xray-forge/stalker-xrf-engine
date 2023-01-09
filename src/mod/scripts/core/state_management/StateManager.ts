import {
  action_planner,
  object,
  time_global,
  world_property,
  world_state,
  XR_action_planner,
  XR_game_object,
  XR_vector,
  XR_world_state
} from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { AnyCallable, AnyObject, Maybe, Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import * as animationManagement from "@/mod/scripts/core/state_management/animation/index";
import * as animationStateManagement from "@/mod/scripts/core/state_management/animation_state";
import { IAnimationManager, AnimationManager } from "@/mod/scripts/core/state_management/AnimationManager";
import * as bodyStateManagement from "@/mod/scripts/core/state_management/body_state";
import * as directionManagement from "@/mod/scripts/core/state_management/direction";
import { EStateManagerOperator } from "@/mod/scripts/core/state_management/EStateManagerOperator";
import { EStateManagerProperty } from "@/mod/scripts/core/state_management/EStateManagerProperty";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { animations } from "@/mod/scripts/core/state_management/lib/state_mgr_animation_list";
import { animstates } from "@/mod/scripts/core/state_management/lib/state_mgr_animstate_list";
import * as mentalManagement from "@/mod/scripts/core/state_management/mental";
import * as movementManagement from "@/mod/scripts/core/state_management/movement";
import * as smartCoverManagement from "@/mod/scripts/core/state_management/smart_cover";
import * as stateManagement from "@/mod/scripts/core/state_management/state";
import * as weaponManagement from "@/mod/scripts/core/state_management/weapon";
import { get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const log: LuaLogger = new LuaLogger("StateManager", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export class StateManager {
  public npc: XR_game_object;
  public animation!: IAnimationManager;
  public animstate!: IAnimationManager;
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

  public constructor(npc: XR_game_object) {
    this.npc = npc;
    this.planner = new action_planner();
    this.planner.setup(npc);

    goap_graph(this, npc);

    log.info("Construct state manager for:", this);
  }

  public set_state(
    state_name: string,
    callback: Optional<AnyObject>,
    timeout: Optional<number>,
    target: Optional<StateManager>,
    extra: Optional<AnyObject>
  ): void {
    // --printf("Set State called: for %s State: %s", this.npc:name(), state_name)
    // --callstack()

    if (states.get(state_name) === null) {
      abort("ERROR: ILLEGAL SET STATE CALLED!!! %s fo %s", tostring(state_name), this.npc.name());
    }

    /**
    if (target) {
      if (target.look_position) {
        // --printf("look position: %s %s %s", target.look_position.x,
        // --                                    target.look_position.y,
        // --                                    target.look_position.z)
      } else {
        // --printf("look position: null")
      }

      if (target.look_object) {
        // --printf("look object: %s", target.look_object:name())
      } else {
        // --printf("look object: null")
      }
    } else {
      // --printf("look target null")
    }
     */

    if (target !== null) {
      this.look_position = target.look_position;

      if (target.look_object !== null) {
        this.look_object = (target.look_object as any).id();
      } else {
        this.look_object = null;
      }
    } else {
      this.look_position = null;
      this.look_object = null;
    }

    if (this.target_state !== state_name) {
      log.info("Set state:", this);

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

  public get_state(): Optional<string> {
    return this.target_state;
  }

  public update(): void {
    if (this.animation.states.current_state === states.get(this.target_state).animation) {
      if (this.callback !== null && this.callback.func !== null) {
        if (this.callback.begin === null) {
          this.callback.begin = time_global();
          log.info("Callback initialized:", this);
        } else {
          if (time_global() - this.callback.begin >= this.callback.timeout!) {
            log.info("Callback called:", this);

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

  public __tostring(): string {
    return `StateManager #npc: ${this.npc.name()} #target_state: ${this.target_state} #combat: ${
      this.combat
    } #pos_direction_applied: ${this.pos_direction_applied} #current_object ${
      type(this.current_object) === "number" ? this.current_object : type(this.current_object)
    }`;
  }
}

export function set_state(
  npc: XR_game_object,
  state_name: string,
  callback: AnyCallable,
  timeout: number,
  target: StateManager,
  extra: Optional<AnyObject>
): void {
  storage.get(npc.id()).state_mgr?.set_state(state_name, callback, timeout, target, extra);
}

export function get_state(npc: XR_game_object): Maybe<string> {
  return storage.get(npc.id()).state_mgr?.get_state();
}

export function goap_graph(st: StateManager, npc: XR_game_object): void {
  st.planner.add_evaluator(
    EStateManagerProperty.end,
    create_xr_class_instance(stateManagement.StateManagerEvaEnd, "state_mgr_end", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.locked,
    create_xr_class_instance(stateManagement.StateManagerEvaLocked, "state_mgr_locked", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.locked_external,
    create_xr_class_instance(stateManagement.StateManagerEvaLockedExternal, "state_mgr_locked_external", st)
  );

  st.planner.add_evaluator(
    EStateManagerProperty.weapon,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeapon, "state_mgr_weapon", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_locked,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponLocked, "state_mgr_weapon_locked", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_strapped,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponStrapped, "state_mgr_weapon_strapped", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_strapped_now,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponStrappedNow, "state_mgr_weapon_strapped_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_unstrapped,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponUnstrapped, "state_mgr_weapon_unstrapped", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_unstrapped_now,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponUnstrappedNow, "state_mgr_weapon_unstrapped_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_none,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponNone, "state_mgr_weapon_none", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_none_now,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponNoneNow, "state_mgr_weapon_none_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_drop,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponDrop, "state_mgr_weapon_drop", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.weapon_fire,
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponFire, "state_mgr_weapon_fire", st)
  );

  st.planner.add_evaluator(
    EStateManagerProperty.movement,
    create_xr_class_instance(movementManagement.StateManagerEvaMovement, "state_mgr_movement", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.movement_walk,
    create_xr_class_instance(movementManagement.StateManagerEvaMovementWalk, "state_mgr_movement_walk", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.movement_run,
    create_xr_class_instance(movementManagement.StateManagerEvaMovementRun, "state_mgr_movement_run", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.movement_stand,
    create_xr_class_instance(movementManagement.StateManagerEvaMovementStand, "state_mgr_movement_stand", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.movement_stand_now,
    create_xr_class_instance(movementManagement.StateManagerEvaMovementStandNow, "state_mgr_movement_stand_now", st)
  );

  st.planner.add_evaluator(
    EStateManagerProperty.mental,
    create_xr_class_instance(mentalManagement.StateManagerEvaMental, "state_mgr_mental", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.mental_free,
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalFree, "state_mgr_mental_free", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.mental_free_now,
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalFreeNow, "state_mgr_mental_free_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.mental_danger,
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalDanger, "state_mgr_mental_danger", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.mental_danger_now,
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalDangerNow, "state_mgr_mental_danger_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.mental_panic,
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalPanic, "state_mgr_mental_panic", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.mental_panic_now,
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalPanicNow, "state_mgr_mental_panic_now", st)
  );

  st.planner.add_evaluator(
    EStateManagerProperty.bodystate,
    create_xr_class_instance(bodyStateManagement.StateManagerEvaBodyState, "state_mgr_bodystate", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.bodystate_crouch,
    create_xr_class_instance(bodyStateManagement.StateManagerEvaBodyStateCrouch, "state_mgr_bodystate_crouch", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.bodystate_standing,
    create_xr_class_instance(bodyStateManagement.StateManagerEvaBodyStateStanding, "state_mgr_bodystate_standing", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.bodystate_crouch_now,
    create_xr_class_instance(
      bodyStateManagement.StateManagerEvaBodyStateCrouchNow,
      "state_mgr_bodystate_crouch_now",
      st
    )
  );
  st.planner.add_evaluator(
    EStateManagerProperty.bodystate_standing_now,
    create_xr_class_instance(
      bodyStateManagement.StateManagerEvaBodyStateStandingNow,
      "state_mgr_bodystate_standing_now",
      st
    )
  );

  st.planner.add_evaluator(
    EStateManagerProperty.direction,
    create_xr_class_instance(directionManagement.StateManagerEvaDirection, "state_mgr_direction", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.direction_search,
    create_xr_class_instance(directionManagement.StateManagerEvaDirectionSearch, "state_mgr_direction_search", st)
  );

  st.animstate = create_xr_class_instance(AnimationManager, npc, st, "state_mgr_animstate_list", animstates);

  st.planner.add_evaluator(
    EStateManagerProperty.animstate,
    create_xr_class_instance(animationStateManagement.StateManagerEvaAnimationState, "state_mgr_animstate", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.animstate_idle_now,
    create_xr_class_instance(
      animationStateManagement.StateManagerEvaAnimationStateIdleNow,
      "state_mgr_animstate_idle_now",
      st
    )
  );
  st.planner.add_evaluator(
    EStateManagerProperty.animstate_play_now,
    create_xr_class_instance(
      animationStateManagement.StateManagerEvaAnimationStatePlayNow,
      "state_mgr_animstate_play_now",
      st
    )
  );
  st.planner.add_evaluator(
    EStateManagerProperty.animstate_locked,
    create_xr_class_instance(
      animationStateManagement.StateManagerEvaAnimationStateLocked,
      "state_mgr_animstate_locked",
      st
    )
  );

  st.animation = create_xr_class_instance(AnimationManager, npc, st, "state_mgr_animation_list", animations);

  st.planner.add_evaluator(
    EStateManagerProperty.animation,
    create_xr_class_instance(animationManagement.StateManagerEvaAnimation, "state_mgr_animation", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.animation_play_now,
    create_xr_class_instance(animationManagement.StateManagerEvaAnimationPlayNow, "state_mgr_animation_play_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.animation_none_now,
    create_xr_class_instance(animationManagement.StateManagerEvaAnimationNoneNow, "state_mgr_animation_none_now", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.animation_locked,
    create_xr_class_instance(animationManagement.StateManagerEvaAnimationLocked, "state_mgr_animation_locked", st)
  );

  st.planner.add_evaluator(
    EStateManagerProperty.smartcover,
    create_xr_class_instance(smartCoverManagement.StateManagerEvaSmartCover, "state_mgr_smartcover", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.smartcover_need,
    create_xr_class_instance(smartCoverManagement.StateManagerEvaSmartCoverNeed, "state_mgr_smartcover_need", st)
  );
  st.planner.add_evaluator(
    EStateManagerProperty.in_smartcover,
    create_xr_class_instance(smartCoverManagement.StateManagerEvaInSmartCover, "state_mgr_in_smartcover", st)
  );

  // --	st.planner.add_evaluator(EStateManagerProperty.smartcover_locked,
  // state_mgr_smartcover.eva_state_mgr_smartcover_locked("state_mgr_smartcover_locked", st))

  // --************************************************************************************
  // --*                               SMART_ACTIONS                                      *
  // --************************************************************************************

  // -- WEAPON
  // -- UNSTRAPP

  let action = create_xr_class_instance(
    weaponManagement.StateManagerActWeaponUnstrapp,
    "state_mgr_weapon_unstrapp",
    st
  );

  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon_unstrapped, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.weapon, true));
  st.planner.add_action(EStateManagerOperator.weapon_unstrapp, action);

  // -- STRAPP
  action = create_xr_class_instance(weaponManagement.StateManagerActWeaponStrapp, "state_mgr_weapon_strapp", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon_strapped, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.weapon, true));
  st.planner.add_action(EStateManagerOperator.weapon_strapp, action);

  // -- NONE
  action = create_xr_class_instance(weaponManagement.StateManagerActWeaponNone, "state_mgr_weapon_none", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon_none, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.weapon, true));
  st.planner.add_action(EStateManagerOperator.weapon_none, action);

  // -- DROP
  action = create_xr_class_instance(weaponManagement.StateManagerActWeaponDrop, "state_mgr_weapon_drop", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon_drop, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.weapon, true));
  st.planner.add_action(EStateManagerOperator.weapon_drop, action);

  // -- WALK
  action = create_xr_class_instance(movementManagement.StateManagerActMovementWalk, "state_mgr_movement_walk", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.movement_walk, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  st.planner.add_action(EStateManagerOperator.movement_walk, action);

  // -- WALK_turn

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementWalkTurn,
    "state_mgr_movement_walk_turn",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.movement_walk, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.movement_walk_turn, action);

  // -- WALK_search
  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementWalkSearch,
    "state_mgr_movement_walk_search",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.movement_walk, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.movement_walk_search, action);

  // -- RUN
  action = create_xr_class_instance(movementManagement.StateManagerActMovementRun, "state_mgr_movement_run", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.movement_run, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  st.planner.add_action(EStateManagerOperator.movement_run, action);

  // -- RUN_turn

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementRunTurn,
    "state_mgr_movement_run_turn",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.movement_run, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.movement_run_turn, action);

  // -- RUN_search

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementRunSearch,
    "state_mgr_movement_run_search",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.movement_run, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.movement_run_search, action);

  // -- STAND

  action = create_xr_class_instance(movementManagement.StateManagerActMovementStand, "state_mgr_movement_stand", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement_stand, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  st.planner.add_action(EStateManagerOperator.movement_stand, action);

  // -- STAND_turn

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementStandTurn,
    "state_mgr_movement_stand_turn",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement_stand, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.movement_stand_turn, action);

  // -- STAND_search

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementStandSearch,
    "state_mgr_movement_stand_search",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.movement, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  action.add_precondition(new world_property(EStateManagerProperty.movement_stand, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_effect(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.movement_stand_search, action);

  // -- DIRECTION

  // -- TURN

  action = create_xr_class_instance(directionManagement.StateManagerActDirectionTurn, "state_mgr_direction_turn", st);
  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, false));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true)); // --!
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.direction_turn, action);

  // -- SEARCH

  action = create_xr_class_instance(
    directionManagement.StateManagerActDirectionSearch,
    "state_mgr_direction_search",
    st
  );
  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction_search, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true)); // --!
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_effect(new world_property(EStateManagerProperty.direction, true));
  st.planner.add_action(EStateManagerOperator.direction_search, action);

  // -- MENTAL STATES

  // -- FREE

  action = create_xr_class_instance(mentalManagement.StateManagerActMentalFree, "state_mgr_mental_free", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental_free, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_standing_now, true));
  action.add_effect(new world_property(EStateManagerProperty.mental, true));
  st.planner.add_action(EStateManagerOperator.mental_free, action);

  // -- DANGER

  action = create_xr_class_instance(mentalManagement.StateManagerActMentalDanger, "state_mgr_mental_danger");
  action.add_precondition(new world_property(EStateManagerProperty.mental, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental_danger, true));
  action.add_effect(new world_property(EStateManagerProperty.mental, true));
  action.add_effect(new world_property(EStateManagerProperty.mental_danger_now, true));
  st.planner.add_action(EStateManagerOperator.mental_danger, action);

  // -- PANIC

  action = create_xr_class_instance(mentalManagement.StateManagerActMentalPanic, "state_mgr_mental_panic");
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental_panic, true));
  action.add_effect(new world_property(EStateManagerProperty.mental, true));
  st.planner.add_action(EStateManagerOperator.mental_panic, action);

  // -- BODYSTATES

  // -- CROUCH

  action = create_xr_class_instance(bodyStateManagement.StateManagerActBodyStateCrouch, "state_mgr_bodystate_crouch");
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch_now, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental_danger_now, true));
  action.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  st.planner.add_action(EStateManagerOperator.bodystate_crouch, action);

  // -- CROUCH_danger

  action = create_xr_class_instance(
    bodyStateManagement.StateManagerActBodyStateCrouchDanger,
    "state_mgr_bodystate_crouch_danger"
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  action.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch_now, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_crouch, true));
  action.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  action.add_effect(new world_property(EStateManagerProperty.mental, true));
  st.planner.add_action(EStateManagerOperator.bodystate_crouch_danger, action);

  // --  STAND

  action = create_xr_class_instance(
    bodyStateManagement.StateManagerActBodyStateStanding,
    "state_mgr_bodystate_standing",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_standing_now, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_standing, true));
  action.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  action.add_effect(new world_property(EStateManagerProperty.bodystate_standing_now, true));
  st.planner.add_action(EStateManagerOperator.bodystate_standing, action);

  // --  STAND_free

  action = create_xr_class_instance(
    bodyStateManagement.StateManagerActBodyStateStandingFree,
    "state_mgr_bodystate_standing_free",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, false));
  action.add_precondition(new world_property(EStateManagerProperty.mental, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_standing_now, false));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate_standing, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental_free, false));
  action.add_effect(new world_property(EStateManagerProperty.bodystate, true));
  action.add_effect(new world_property(EStateManagerProperty.bodystate_standing_now, true));
  action.add_effect(new world_property(EStateManagerProperty.mental, true));
  st.planner.add_action(EStateManagerOperator.bodystate_standing_free, action);

  // -- ANIMSTATES
  action = create_xr_class_instance(
    animationStateManagement.StateManagerActAnimationStateStart,
    "state_mgr_animstate_start",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate, false));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_none_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.direction, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_play_now, false));
  action.add_effect(new world_property(EStateManagerProperty.animstate, true));
  st.planner.add_action(EStateManagerOperator.animstate_start, action);

  action = create_xr_class_instance(
    animationStateManagement.StateManagerActAnimationStateStop,
    "state_mgr_animstate_stop",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false)); // --!
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              false))
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_play_now, false));
  action.add_effect(new world_property(EStateManagerProperty.animstate, true));
  action.add_effect(new world_property(EStateManagerProperty.animstate_play_now, false));
  action.add_effect(new world_property(EStateManagerProperty.animstate_idle_now, true));
  st.planner.add_action(EStateManagerOperator.animstate_stop, action);

  // -- ANIMATION

  // -- START
  action = create_xr_class_instance(animationManagement.StateManagerActAnimationStart, "state_mgr_animation_start", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate, true));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover, true));
  action.add_precondition(new world_property(EStateManagerProperty.in_smartcover, false));
  action.add_precondition(new world_property(EStateManagerProperty.direction, true));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation, false));
  action.add_precondition(new world_property(EStateManagerProperty.animation_play_now, false));
  action.add_effect(new world_property(EStateManagerProperty.animation, true));
  st.planner.add_action(EStateManagerOperator.animation_start, action);

  // -- STOP
  action = create_xr_class_instance(animationManagement.StateManagerActAnimationStop, "state_mgr_animation_stop", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              true))
  // --action.add_precondition    (new world_property(EStateManagerProperty.animation,              false))
  action.add_precondition(new world_property(EStateManagerProperty.animation_play_now, true));
  action.add_effect(new world_property(EStateManagerProperty.animation, true));
  action.add_effect(new world_property(EStateManagerProperty.animation_play_now, false));
  action.add_effect(new world_property(EStateManagerProperty.animation_none_now, true));
  st.planner.add_action(EStateManagerOperator.animation_stop, action);

  action = create_xr_class_instance(
    smartCoverManagement.StateManagerActSmartCoverEnter,
    "act_state_mgr_smartcover_enter",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover_need, true));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover, false));
  action.add_precondition(new world_property(EStateManagerProperty.animstate_idle_now, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation_play_now, false));
  action.add_effect(new world_property(EStateManagerProperty.smartcover, true));
  st.planner.add_action(EStateManagerOperator.smartcover_enter, action);

  action = create_xr_class_instance(
    smartCoverManagement.StateManagerActSmartCoverExit,
    "act_state_mgr_smartcover_exit",
    st
  );
  action.add_precondition(new world_property(EStateManagerProperty.locked, false));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover_need, false));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover, false));
  action.add_effect(new world_property(EStateManagerProperty.smartcover, true));
  st.planner.add_action(EStateManagerOperator.smartcover_exit, action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_smartcover", st);
  action.add_precondition(new world_property(EStateManagerProperty.in_smartcover, true));
  action.add_effect(new world_property(EStateManagerProperty.in_smartcover, false));
  st.planner.add_action(EStateManagerOperator.locked_smartcover, action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked, true));
  action.add_effect(new world_property(EStateManagerProperty.locked, false));
  st.planner.add_action(EStateManagerOperator.locked, action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_animation", st);
  action.add_precondition(new world_property(EStateManagerProperty.animation_locked, true));
  action.add_effect(new world_property(EStateManagerProperty.animation_locked, false));
  st.planner.add_action(EStateManagerOperator.locked_animation, action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_animstate", st);
  action.add_precondition(new world_property(EStateManagerProperty.animstate_locked, true));
  action.add_effect(new world_property(EStateManagerProperty.animstate_locked, false));
  st.planner.add_action(EStateManagerOperator.locked_animstate, action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_external", st);
  action.add_precondition(new world_property(EStateManagerProperty.locked_external, true));
  action.add_effect(new world_property(EStateManagerProperty.locked_external, false));
  st.planner.add_action(EStateManagerOperator.locked_external, action);

  action = create_xr_class_instance(stateManagement.StateManagerActEnd, "state_mgr_end", st);
  action.add_precondition(new world_property(EStateManagerProperty.end, false));
  action.add_precondition(new world_property(EStateManagerProperty.weapon, true));
  action.add_precondition(new world_property(EStateManagerProperty.movement, true));
  action.add_precondition(new world_property(EStateManagerProperty.mental, true));
  action.add_precondition(new world_property(EStateManagerProperty.bodystate, true));
  action.add_precondition(new world_property(EStateManagerProperty.direction, true));
  action.add_precondition(new world_property(EStateManagerProperty.animstate, true));
  action.add_precondition(new world_property(EStateManagerProperty.animation, true));
  action.add_precondition(new world_property(EStateManagerProperty.smartcover, true));
  action.add_effect(new world_property(EStateManagerProperty.end, true));
  st.planner.add_action(EStateManagerOperator.end, action);

  const goal: XR_world_state = new world_state();

  goal.add_property(new world_property(EStateManagerProperty.end, true));
  st.planner.set_goal_world_state(goal);
}
