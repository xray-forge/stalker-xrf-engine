import {
  action_planner,
  callback,
  object,
  time_global,
  world_property,
  world_state,
  XR_action_planner,
  XR_game_object,
  XR_vector
} from "xray16";

import { AnyCallable, AnyObject, Optional } from "@/mod/lib/types";
import { storage } from "@/mod/scripts/core/db";
import * as animationManagement from "@/mod/scripts/core/state_management/animation";
import { IAnimation } from "@/mod/scripts/core/state_management/animation/Animation";
import * as animationStateManagement from "@/mod/scripts/core/state_management/animation_state";
import * as bodyStateManagement from "@/mod/scripts/core/state_management/body_state";
import * as directionManagement from "@/mod/scripts/core/state_management/direction";
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

const log: LuaLogger = new LuaLogger("StateManager");

export class StateManager {
  public npc: XR_game_object;
  public animation!: IAnimation;
  public animstate!: IAnimation;
  public planner: XR_action_planner;
  public operators: LuaTable<string, number> = new LuaTable();
  public properties: LuaTable<string, number> = new LuaTable();

  public target_state: string = "idle";
  public current_direction: Optional<XR_vector> = null;
  public target_position: Optional<string> = null;
  public current_object: Optional<XR_game_object> | -1 = null;
  public combat: boolean = false;
  public alife: boolean = true;
  public need_reweapon: boolean = false;
  public animation_position: Optional<XR_vector> = null;
  public animation_direction: Optional<XR_vector> = null;
  public pos_direction_applied: boolean = false;
  public look_position: Optional<XR_vector> = null;
  public point_obj_dir?: boolean;
  public anim_callback?: AnyCallable;
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

    let switched: boolean = false;
    const last_state = this.target_state;

    if (this.target_state !== state_name) {
      // --printf("Set State called: for %s State: %s  [%s]", this.npc:name(), state_name, device():time_global())
      // --callstack()
      // --log(string.format("Set State called: for %s State: %s  [%s]",
      // this.npc:name(), state_name, device():time_global()))

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
      switched = true;

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
    // --printf("Update called for stalker [%s]", this.npc:name())

    if (this.animation.states.current_state === states.get(this.target_state).animation) {
      if (this.callback !== null && this.callback.func !== null) {
        if (this.callback.begin === null) {
          this.callback.begin = time_global();
          // --printf("        Callback initialized %s", time_global())
        } else {
          if (time_global() - this.callback.begin >= this.callback.timeout!) {
            // --printf("        Callback called %s", time_global())

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

    while (pl_id !== last_pl_id && pl_id !== this.operators.get("end") && pl_id !== this.operators.get("locked")) {
      last_pl_id = pl_id;
      this.planner.update();
      pl_id = this.planner.current_action_id();
    }

    // --this.planner:show("")
  }
}

export function set_state(
  npc: XR_game_object,
  state_name: string,
  callback: AnyCallable,
  timeout: number,
  target: XR_game_object,
  extra: unknown
): void {
  storage.get(npc.id()).state_mgr?.set_state(state_name, callback, timeout, target, extra);
}

export function get_state(npc: XR_game_object): Optional<undefined> {
  return storage.get(npc.id()).state_mgr?.get_state();
}

export function goap_graph(st: StateManager, npc: XR_game_object): void {
  // -- EVALUATORS

  // -- MANAGER
  st.properties.set("end", 1);
  st.properties.set("locked", 2);
  st.properties.set("locked_external", 3);

  // -- WEAPON
  st.properties.set("weapon", 11);
  st.properties.set("weapon_locked", 12);
  st.properties.set("weapon_strapped", 13);
  st.properties.set("weapon_strapped_now", 14);
  st.properties.set("weapon_unstrapped", 15);
  st.properties.set("weapon_unstrapped_now", 16);
  st.properties.set("weapon_none", 17);
  st.properties.set("weapon_none_now", 18);
  st.properties.set("weapon_drop", 19);
  st.properties.set("weapon_fire", 20);

  // -- MOVEMENT
  st.properties.set("movement", 21);
  st.properties.set("movement_walk", 22);
  st.properties.set("movement_run", 23);
  st.properties.set("movement_stand", 24);
  st.properties.set("movement_stand_now", 25);

  // -- MENTAL STATES
  st.properties.set("mental", 31);
  st.properties.set("mental_free", 32);
  st.properties.set("mental_free_now", 33);
  st.properties.set("mental_danger", 34);
  st.properties.set("mental_danger_now", 35);
  st.properties.set("mental_panic", 36);
  st.properties.set("mental_panic_now", 37);

  // -- BODYSTATES
  st.properties.set("bodystate", 41);
  st.properties.set("bodystate_crouch", 42);
  st.properties.set("bodystate_standing", 43);
  st.properties.set("bodystate_crouch_now", 44);
  st.properties.set("bodystate_standing_now", 45);

  // -- DIRECTION
  st.properties.set("direction", 51);
  st.properties.set("direction_search", 52);

  // -- ANIMSTATE
  st.properties.set("animstate", 61);
  st.properties.set("animstate_locked", 62);
  st.properties.set("animstate_idle_now", 64);
  st.properties.set("animstate_play_now", 66);

  // -- ANIMATION
  st.properties.set("animation", 81);
  st.properties.set("animation_locked", 82);
  st.properties.set("animation_play_now", 84);
  st.properties.set("animation_none_now", 86);

  // -- SMARTCOVER
  st.properties.set("smartcover_need", 90);
  st.properties.set("smartcover", 91);
  st.properties.set("in_smartcover", 92);
  // --	st.properties.set("smartcover_locked"]           = 92

  st.planner.add_evaluator(
    st.properties.get("end"),
    create_xr_class_instance(stateManagement.StateManagerEvaEnd, "state_mgr_end", st)
  );
  st.planner.add_evaluator(
    st.properties.get("locked"),
    create_xr_class_instance(stateManagement.StateManagerEvaLocked, "state_mgr_locked", st)
  );
  st.planner.add_evaluator(
    st.properties.get("locked_external"),
    create_xr_class_instance(stateManagement.StateManagerEvaLockedExternal, "state_mgr_locked_external", st)
  );

  st.planner.add_evaluator(
    st.properties.get("weapon"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeapon, "state_mgr_weapon", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_locked"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponLocked, "state_mgr_weapon_locked", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_strapped"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponStrapped, "state_mgr_weapon_strapped", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_strapped_now"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponStrappedNow, "state_mgr_weapon_strapped_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_unstrapped"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponUnstrapped, "state_mgr_weapon_unstrapped", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_unstrapped_now"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponUnstrappedNow, "state_mgr_weapon_unstrapped_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_none"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponNone, "state_mgr_weapon_none", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_none_now"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponNoneNow, "state_mgr_weapon_none_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_drop"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponDrop, "state_mgr_weapon_drop", st)
  );
  st.planner.add_evaluator(
    st.properties.get("weapon_fire"),
    create_xr_class_instance(weaponManagement.StateManagerEvaWeaponFire, "state_mgr_weapon_fire", st)
  );

  st.planner.add_evaluator(
    st.properties.get("movement"),
    create_xr_class_instance(movementManagement.StateManagerEvaMovement, "state_mgr_movement", st)
  );
  st.planner.add_evaluator(
    st.properties.get("movement_walk"),
    create_xr_class_instance(movementManagement.StateManagerEvaMovementWalk, "state_mgr_movement_walk", st)
  );
  st.planner.add_evaluator(
    st.properties.get("movement_run"),
    create_xr_class_instance(movementManagement.StateManagerEvaMovementRun, "state_mgr_movement_run", st)
  );
  st.planner.add_evaluator(
    st.properties.get("movement_stand"),
    create_xr_class_instance(movementManagement.StateManagerEvaMovementStand, "state_mgr_movement_stand", st)
  );
  st.planner.add_evaluator(
    st.properties.get("movement_stand_now"),
    create_xr_class_instance(movementManagement.StateManagerEvaMovementStandNow, "state_mgr_movement_stand_now", st)
  );

  st.planner.add_evaluator(
    st.properties.get("mental"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMental, "state_mgr_mental", st)
  );
  st.planner.add_evaluator(
    st.properties.get("mental_free"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalFree, "state_mgr_mental_free", st)
  );
  st.planner.add_evaluator(
    st.properties.get("mental_free_now"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalFreeNow, "state_mgr_mental_free_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("mental_danger"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalDanger, "state_mgr_mental_danger", st)
  );
  st.planner.add_evaluator(
    st.properties.get("mental_danger_now"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalDangerNow, "state_mgr_mental_danger_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("mental_panic"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalPanic, "state_mgr_mental_panic", st)
  );
  st.planner.add_evaluator(
    st.properties.get("mental_panic_now"),
    create_xr_class_instance(mentalManagement.StateManagerEvaMentalPanicNow, "state_mgr_mental_panic_now", st)
  );

  st.planner.add_evaluator(
    st.properties.get("bodystate"),
    create_xr_class_instance(bodyStateManagement.StateManagerEvaBodyState, "state_mgr_bodystate", st)
  );
  st.planner.add_evaluator(
    st.properties.get("bodystate_crouch"),
    create_xr_class_instance(bodyStateManagement.StateManagerEvaBodyStateCrouch, "state_mgr_bodystate_crouch", st)
  );
  st.planner.add_evaluator(
    st.properties.get("bodystate_standing"),
    create_xr_class_instance(bodyStateManagement.StateManagerEvaBodyStateStanding, "state_mgr_bodystate_standing", st)
  );
  st.planner.add_evaluator(
    st.properties.get("bodystate_crouch_now"),
    create_xr_class_instance(
      bodyStateManagement.StateManagerEvaBodyStateCrouchNow,
      "state_mgr_bodystate_crouch_now",
      st
    )
  );
  st.planner.add_evaluator(
    st.properties.get("bodystate_standing_now"),
    create_xr_class_instance(
      bodyStateManagement.StateManagerEvaBodyStateStandingNow,
      "state_mgr_bodystate_standing_now",
      st
    )
  );

  st.planner.add_evaluator(
    st.properties.get("direction"),
    create_xr_class_instance(directionManagement.StateManagerEvaDirection, "state_mgr_direction", st)
  );
  st.planner.add_evaluator(
    st.properties.get("direction_search"),
    create_xr_class_instance(directionManagement.StateManagerEvaDirectionSearch, "state_mgr_direction_search", st)
  );

  st.animstate = create_xr_class_instance(
    animationManagement.Animation,
    npc,
    st,
    "state_mgr_animstate_list",
    animstates
  );

  st.planner.add_evaluator(
    st.properties.get("animstate"),
    create_xr_class_instance(animationStateManagement.StateManagerEvaAnimationState, "state_mgr_animstate", st)
  );
  st.planner.add_evaluator(
    st.properties.get("animstate_idle_now"),
    create_xr_class_instance(
      animationStateManagement.StateManagerEvaAnimationStateIdleNow,
      "state_mgr_animstate_idle_now",
      st
    )
  );
  st.planner.add_evaluator(
    st.properties.get("animstate_play_now"),
    create_xr_class_instance(
      animationStateManagement.StateManagerEvaAnimationStatePlayNow,
      "state_mgr_animstate_play_now",
      st
    )
  );
  st.planner.add_evaluator(
    st.properties.get("animstate_locked"),
    create_xr_class_instance(
      animationStateManagement.StateManagerEvaAnimationStateLocked,
      "state_mgr_animstate_locked",
      st
    )
  );

  st.animation = create_xr_class_instance(
    animationManagement.Animation,
    npc,
    st,
    "state_mgr_animation_list",
    animations
  );

  st.npc.set_callback(callback.script_animation, st.animation.anim_callback!, st.animation);
  st.planner.add_evaluator(
    st.properties.get("animation"),
    create_xr_class_instance(animationManagement.StateManagerEvaAnimation, "state_mgr_animation", st)
  );
  st.planner.add_evaluator(
    st.properties.get("animation_play_now"),
    create_xr_class_instance(animationManagement.StateManagerEvaAnimationPlayNow, "state_mgr_animation_play_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("animation_none_now"),
    create_xr_class_instance(animationManagement.StateManagerEvaAnimationNoneNow, "state_mgr_animation_none_now", st)
  );
  st.planner.add_evaluator(
    st.properties.get("animation_locked"),
    create_xr_class_instance(animationManagement.StateManagerEvaAnimationLocked, "state_mgr_animation_locked", st)
  );

  st.planner.add_evaluator(
    st.properties.get("smartcover"),
    create_xr_class_instance(smartCoverManagement.StateManagerEvaSmartCover, "state_mgr_smartcover", st)
  );
  st.planner.add_evaluator(
    st.properties.get("smartcover_need"),
    create_xr_class_instance(smartCoverManagement.StateManagerEvaSmartCoverNeed, "state_mgr_smartcover_need", st)
  );
  st.planner.add_evaluator(
    st.properties.get("in_smartcover"),
    create_xr_class_instance(smartCoverManagement.StateManagerEvaInSmartCover, "state_mgr_in_smartcover", st)
  );

  // --	st.planner.add_evaluator(st.properties.get("smartcover_locked"),
  // state_mgr_smartcover.eva_state_mgr_smartcover_locked("state_mgr_smartcover_locked", st))

  st.operators.set("end", 1);
  st.operators.set("locked", 2);
  st.operators.set("locked_external", 3);
  st.operators.set("locked_animation", 4);
  st.operators.set("locked_animstate", 5);
  st.operators.set("locked_smartcover", 6);

  st.operators.set("weapon_strapp", 11);
  st.operators.set("weapon_unstrapp", 12);
  st.operators.set("weapon_none", 13);
  st.operators.set("weapon_fire", 14);
  st.operators.set("weapon_drop", 15);

  st.operators.set("movement", 21);
  st.operators.set("movement_walk", 22);
  st.operators.set("movement_run", 23);
  st.operators.set("movement_stand", 24);
  st.operators.set("movement_walk_turn", 25);
  st.operators.set("movement_walk_search", 26);
  st.operators.set("movement_stand_turn", 27);
  st.operators.set("movement_stand_search", 28);
  st.operators.set("movement_run_turn", 29);
  st.operators.set("movement_run_search", 30);

  st.operators.set("mental_free", 31);
  st.operators.set("mental_danger", 32);
  st.operators.set("mental_panic", 33);

  st.operators.set("bodystate_crouch", 41);
  st.operators.set("bodystate_standing", 42);
  st.operators.set("bodystate_crouch_danger", 43);
  st.operators.set("bodystate_standing_free", 44);

  st.operators.set("direction_turn", 51);
  st.operators.set("direction_search", 52);

  st.operators.set("animstate_start", 61);
  st.operators.set("animstate_stop", 62);

  st.operators.set("animation_start", 71);
  st.operators.set("animation_stop", 72);

  st.operators.set("walk_turn", 75);
  st.operators.set("walk_search", 76);
  st.operators.set("stand_turn", 77);
  st.operators.set("stand_search", 78);

  st.operators.set("smartcover_enter", 80);
  st.operators.set("smartcover_exit", 81);

  // --' Actions

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

  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("weapon_unstrapped"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("weapon"), true));
  st.planner.add_action(st.operators.get("weapon_unstrapp"), action);

  // -- STRAPP
  action = create_xr_class_instance(weaponManagement.StateManagerActWeaponStrapp, "state_mgr_weapon_strapp", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("weapon_strapped"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("weapon"), true));
  st.planner.add_action(st.operators.get("weapon_strapp"), action);

  // -- NONE
  action = create_xr_class_instance(weaponManagement.StateManagerActWeaponNone, "state_mgr_weapon_none", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("weapon_none"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("weapon"), true));
  st.planner.add_action(st.operators.get("weapon_none"), action);

  // -- DROP
  action = create_xr_class_instance(weaponManagement.StateManagerActWeaponDrop, "state_mgr_weapon_drop", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("weapon_drop"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("weapon"), true));
  st.planner.add_action(st.operators.get("weapon_drop"), action);

  // -- WALK
  action = create_xr_class_instance(movementManagement.StateManagerActMovementWalk, "state_mgr_movement_walk", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("movement_walk"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  st.planner.add_action(st.operators.get("movement_walk"), action);

  // -- WALK_turn

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementWalkTurn,
    "state_mgr_movement_walk_turn",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("movement_walk"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("movement_walk_turn"), action);

  // -- WALK_search
  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementWalkSearch,
    "state_mgr_movement_walk_search",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("movement_walk"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("movement_walk_search"), action);

  // -- RUN
  action = create_xr_class_instance(movementManagement.StateManagerActMovementRun, "state_mgr_movement_run", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("movement_run"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  st.planner.add_action(st.operators.get("movement_run"), action);

  // -- RUN_turn

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementRunTurn,
    "state_mgr_movement_run_turn",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("movement_run"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("movement_run_turn"), action);

  // -- RUN_search

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementRunSearch,
    "state_mgr_movement_run_search",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("movement_run"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("movement_run_search"), action);

  // -- STAND

  action = create_xr_class_instance(movementManagement.StateManagerActMovementStand, "state_mgr_movement_stand", st);
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("movement_stand"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  st.planner.add_action(st.operators.get("movement_stand"), action);

  // -- STAND_turn

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementStandTurn,
    "state_mgr_movement_stand_turn",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), false));
  action.add_precondition(new world_property(st.properties.get("movement_stand"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("movement_stand_turn"), action);

  // -- STAND_search

  action = create_xr_class_instance(
    movementManagement.StateManagerActMovementStandSearch,
    "state_mgr_movement_stand_search",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("movement"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), true));
  action.add_precondition(new world_property(st.properties.get("movement_stand"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_effect(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("movement_stand_search"), action);

  // -- DIRECTION

  // -- TURN

  action = create_xr_class_instance(directionManagement.StateManagerActDirectionTurn, "state_mgr_direction_turn", st);
  // --action.add_precondition    (new world_property(st.properties.get("locked"),                 false))
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), false));
  action.add_precondition(new world_property(st.properties.get("weapon"), true)); // --!
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("direction_turn"), action);

  // -- SEARCH

  action = create_xr_class_instance(
    directionManagement.StateManagerActDirectionSearch,
    "state_mgr_direction_search",
    st
  );
  // --action.add_precondition    (new world_property(st.properties.get("locked"),                 false))
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), false));
  action.add_precondition(new world_property(st.properties.get("direction_search"), true));
  action.add_precondition(new world_property(st.properties.get("weapon"), true)); // --!
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_effect(new world_property(st.properties.get("direction"), true));
  st.planner.add_action(st.operators.get("direction_search"), action);

  // -- MENTAL STATES

  // -- FREE

  action = create_xr_class_instance(mentalManagement.StateManagerActMentalFree, "state_mgr_mental_free", st);
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("mental"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  // --'	action.add_precondition    (new world_property(st.properties.get("movement"),               true))
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_precondition(new world_property(st.properties.get("mental_free"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate_standing_now"), true));
  action.add_effect(new world_property(st.properties.get("mental"), true));
  st.planner.add_action(st.operators.get("mental_free"), action);

  // -- DANGER

  action = create_xr_class_instance(mentalManagement.StateManagerActMentalDanger, "state_mgr_mental_danger");
  action.add_precondition(new world_property(st.properties.get("mental"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  // --'	action.add_precondition    (new world_property(st.properties.get("movement"),               true))
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_precondition(new world_property(st.properties.get("mental_danger"), true));
  action.add_effect(new world_property(st.properties.get("mental"), true));
  action.add_effect(new world_property(st.properties.get("mental_danger_now"), true));
  st.planner.add_action(st.operators.get("mental_danger"), action);

  // -- PANIC

  action = create_xr_class_instance(mentalManagement.StateManagerActMentalPanic, "state_mgr_mental_panic");
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("mental"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_precondition(new world_property(st.properties.get("mental_panic"), true));
  action.add_effect(new world_property(st.properties.get("mental"), true));
  st.planner.add_action(st.operators.get("mental_panic"), action);

  // -- BODYSTATES

  // -- CROUCH

  action = create_xr_class_instance(bodyStateManagement.StateManagerActBodyStateCrouch, "state_mgr_bodystate_crouch");
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  // --'	action.add_precondition    (new world_property(st.properties.get("movement"),               true))
  action.add_precondition(new world_property(st.properties.get("bodystate_crouch_now"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate_crouch"), true));
  action.add_precondition(new world_property(st.properties.get("mental_danger_now"), true));
  action.add_effect(new world_property(st.properties.get("bodystate"), true));
  st.planner.add_action(st.operators.get("bodystate_crouch"), action);

  // -- CROUCH_danger

  action = create_xr_class_instance(
    bodyStateManagement.StateManagerActBodyStateCrouchDanger,
    "state_mgr_bodystate_crouch_danger"
  );
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), false));
  action.add_precondition(new world_property(st.properties.get("mental"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  // --'	action.add_precondition    (new world_property(st.properties.get("movement"),               true))
  action.add_precondition(new world_property(st.properties.get("bodystate_crouch_now"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate_crouch"), true));
  action.add_effect(new world_property(st.properties.get("bodystate"), true));
  action.add_effect(new world_property(st.properties.get("mental"), true));
  st.planner.add_action(st.operators.get("bodystate_crouch_danger"), action);

  // --  STAND

  action = create_xr_class_instance(
    bodyStateManagement.StateManagerActBodyStateStanding,
    "state_mgr_bodystate_standing",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  // --'	action.add_precondition    (new world_property(st.properties.get("movement"),               true))
  action.add_precondition(new world_property(st.properties.get("bodystate_standing_now"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate_standing"), true));
  action.add_effect(new world_property(st.properties.get("bodystate"), true));
  action.add_effect(new world_property(st.properties.get("bodystate_standing_now"), true));
  st.planner.add_action(st.operators.get("bodystate_standing"), action);

  // --  STAND_free

  action = create_xr_class_instance(
    bodyStateManagement.StateManagerActBodyStateStandingFree,
    "state_mgr_bodystate_standing_free",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate"), false));
  action.add_precondition(new world_property(st.properties.get("mental"), false));
  // --	action.add_precondition    (new world_property(st.properties.get("weapon"),                 true))
  // --'	action.add_precondition    (new world_property(st.properties.get("movement"),               true))
  action.add_precondition(new world_property(st.properties.get("bodystate_standing_now"), false));
  action.add_precondition(new world_property(st.properties.get("bodystate_standing"), true));
  action.add_precondition(new world_property(st.properties.get("mental_free"), false));
  action.add_effect(new world_property(st.properties.get("bodystate"), true));
  action.add_effect(new world_property(st.properties.get("bodystate_standing_now"), true));
  action.add_effect(new world_property(st.properties.get("mental"), true));
  st.planner.add_action(st.operators.get("bodystate_standing_free"), action);

  // -- ANIMSTATES
  action = create_xr_class_instance(
    animationStateManagement.StateManagerActAnimationStateStart,
    "state_mgr_animstate_start",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("animstate"), false));
  action.add_precondition(new world_property(st.properties.get("smartcover"), true));
  action.add_precondition(new world_property(st.properties.get("animation_none_now"), true));
  action.add_precondition(new world_property(st.properties.get("direction"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("weapon"), true));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("animstate_play_now"), false));
  action.add_effect(new world_property(st.properties.get("animstate"), true));
  st.planner.add_action(st.operators.get("animstate_start"), action);

  action = create_xr_class_instance(
    animationStateManagement.StateManagerActAnimationStateStop,
    "state_mgr_animstate_stop",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("animation_locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false)); // --!
  // --action.add_precondition    (new world_property(st.properties.get("animstate"),              false))
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), false));
  action.add_precondition(new world_property(st.properties.get("animation_play_now"), false));
  action.add_effect(new world_property(st.properties.get("animstate"), true));
  action.add_effect(new world_property(st.properties.get("animstate_play_now"), false));
  action.add_effect(new world_property(st.properties.get("animstate_idle_now"), true));
  st.planner.add_action(st.operators.get("animstate_stop"), action);

  // -- ANIMATION

  // -- START

  action = create_xr_class_instance(animationManagement.StateManagerActAnimationStart, "state_mgr_animation_start", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  action.add_precondition(new world_property(st.properties.get("animstate"), true));
  action.add_precondition(new world_property(st.properties.get("smartcover"), true));
  action.add_precondition(new world_property(st.properties.get("in_smartcover"), false));
  action.add_precondition(new world_property(st.properties.get("direction"), true));
  action.add_precondition(new world_property(st.properties.get("weapon"), true));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("animation"), false));
  action.add_precondition(new world_property(st.properties.get("animation_play_now"), false));
  action.add_effect(new world_property(st.properties.get("animation"), true));
  st.planner.add_action(st.operators.get("animation_start"), action);

  // -- STOP

  action = create_xr_class_instance(animationManagement.StateManagerActAnimationStop, "state_mgr_animation_stop", st);
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("locked_external"), false));
  // --action.add_precondition    (new world_property(st.properties.get("animstate"),              true))
  // --action.add_precondition    (new world_property(st.properties.get("animation"),              false))
  action.add_precondition(new world_property(st.properties.get("animation_play_now"), true));
  action.add_effect(new world_property(st.properties.get("animation"), true));
  action.add_effect(new world_property(st.properties.get("animation_play_now"), false));
  action.add_effect(new world_property(st.properties.get("animation_none_now"), true));
  st.planner.add_action(st.operators.get("animation_stop"), action);

  action = create_xr_class_instance(
    smartCoverManagement.StateManagerActSmartCoverEnter,
    "act_state_mgr_smartcover_enter",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("weapon"), true));
  action.add_precondition(new world_property(st.properties.get("smartcover_need"), true));
  action.add_precondition(new world_property(st.properties.get("smartcover"), false));
  action.add_precondition(new world_property(st.properties.get("animstate_idle_now"), true));
  action.add_precondition(new world_property(st.properties.get("animation_play_now"), false));
  action.add_effect(new world_property(st.properties.get("smartcover"), true));
  st.planner.add_action(st.operators.get("smartcover_enter"), action);

  action = create_xr_class_instance(
    smartCoverManagement.StateManagerActSmartCoverExit,
    "act_state_mgr_smartcover_exit",
    st
  );
  action.add_precondition(new world_property(st.properties.get("locked"), false));
  action.add_precondition(new world_property(st.properties.get("weapon"), true));
  action.add_precondition(new world_property(st.properties.get("smartcover_need"), false));
  action.add_precondition(new world_property(st.properties.get("smartcover"), false));
  action.add_effect(new world_property(st.properties.get("smartcover"), true));
  st.planner.add_action(st.operators.get("smartcover_exit"), action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_smartcover", st);
  action.add_precondition(new world_property(st.properties.get("in_smartcover"), true));
  action.add_effect(new world_property(st.properties.get("in_smartcover"), false));
  st.planner.add_action(st.operators.get("locked_smartcover"), action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked", st);
  action.add_precondition(new world_property(st.properties.get("locked"), true));
  action.add_effect(new world_property(st.properties.get("locked"), false));
  st.planner.add_action(st.operators.get("locked"), action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_animation", st);
  action.add_precondition(new world_property(st.properties.get("animation_locked"), true));
  action.add_effect(new world_property(st.properties.get("animation_locked"), false));
  st.planner.add_action(st.operators.get("locked_animation"), action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_animstate", st);
  action.add_precondition(new world_property(st.properties.get("animstate_locked"), true));
  action.add_effect(new world_property(st.properties.get("animstate_locked"), false));
  st.planner.add_action(st.operators.get("locked_animstate"), action);

  action = create_xr_class_instance(stateManagement.StateManagerActLocked, "state_mgr_locked_external", st);
  action.add_precondition(new world_property(st.properties.get("locked_external"), true));
  action.add_effect(new world_property(st.properties.get("locked_external"), false));
  st.planner.add_action(st.operators.get("locked_external"), action);

  action = create_xr_class_instance(stateManagement.StateManagerActEnd, "state_mgr_end", st);
  action.add_precondition(new world_property(st.properties.get("end"), false));
  action.add_precondition(new world_property(st.properties.get("weapon"), true));
  action.add_precondition(new world_property(st.properties.get("movement"), true));
  action.add_precondition(new world_property(st.properties.get("mental"), true));
  action.add_precondition(new world_property(st.properties.get("bodystate"), true));
  action.add_precondition(new world_property(st.properties.get("direction"), true));
  action.add_precondition(new world_property(st.properties.get("animstate"), true));
  action.add_precondition(new world_property(st.properties.get("animation"), true));
  action.add_precondition(new world_property(st.properties.get("smartcover"), true));
  action.add_effect(new world_property(st.properties.get("end"), true));
  st.planner.add_action(st.operators.get("end"), action);

  const goal = new world_state();

  goal.add_property(new world_property(st.properties.get("end"), true));
  st.planner.set_goal_world_state(goal);

  if (npc.debug_planner !== null) {
    npc.debug_planner(st.planner);
  }
}
