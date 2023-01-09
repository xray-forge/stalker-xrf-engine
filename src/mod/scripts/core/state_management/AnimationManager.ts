import { callback, hit, time_global, vector, XR_game_object, XR_LuaBindBase } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { AnyCallable, AnyCallablesModule, Maybe, Optional } from "@/mod/lib/types";
import { IAnimationDescriptor } from "@/mod/scripts/core/state_management/lib/state_mgr_animation_list";
import { IAnimationStateDescriptor } from "@/mod/scripts/core/state_management/lib/state_mgr_animstate_list";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorRotateY } from "@/mod/scripts/utils/physics";

const MARKER_IN: number = 1;
const MARKER_OUT: number = 2;
const MARKER_IDLE: number = 3;

const log: LuaLogger = new LuaLogger("AnimationManager", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IAnimationManager extends XR_LuaBindBase {
  mgr: StateManager;
  npc: XR_game_object;
  name: string;
  animations: LuaTable<string, IAnimationDescriptor>;
  sid: number;
  states: {
    last_id: Optional<number>;
    current_state: Optional<string>;
    target_state: Optional<string>;
    anim_marker: Optional<number>;
    next_rnd: Optional<number>;
    seq_id: number;
  };

  set_control(): void;
  update_anim(): void;
  set_state(new_state: Optional<string>, fast_set: Maybe<boolean>): void;
  select_anim(): LuaMultiReturn<[Optional<string>, any]>;
  weapon_slot(): number;
  anim_for_slot(
    slot: number,
    t: LuaTable<number, LuaTable<number, string | LuaTable>>
  ): LuaTable<number, string | LuaTable<string>>;
  select_rnd(anim_state: IAnimationStateDescriptor, wpn_slot: number, must_play: boolean): Optional<LuaTable>;
  add_anim(anim: Optional<string | number>, state: IAnimationDescriptor): void;
  animation_callback(skip_multianim_check?: boolean): void;
  process_special_action(action_table: LuaTable): void;
}

export const AnimationManager: IAnimationManager = declare_xr_class("AnimationManager", null, {
  __init(
    npc: XR_game_object,
    mgr: StateManager,
    name: string,
    collection: LuaTable<string, IAnimationDescriptor>
  ): void {
    this.mgr = mgr;
    this.npc = npc;
    this.name = name;

    this.animations = collection;
    this.sid = math.random(1000);
    // -- printf("ANIMCLASS %s sid %s", this.npc:name(), tostring(this.sid))
    // -- callstack()

    this.states = {
      last_id: null,
      current_state: null,
      target_state: null,
      anim_marker: null,
      next_rnd: null,
      seq_id: 1
    };

    log.info("Initialized new entry:", npc.name(), name, this.sid);

    if (collection === null) {
      abort("Provided null object for animation instance");
    }
  },
  set_control(): void {
    log.info("Set control:", this);

    this.npc.set_callback(callback.script_animation, this.animation_callback, this);

    if (this.name === "state_mgr_animation_list") {
      this.mgr.animstate.states.anim_marker = null;
    }

    if (this.states.anim_marker === null) {
      this.update_anim();
    }
  },
  update_anim(): void {
    const [anim, state] = this.select_anim();

    if (anim !== null) {
      log.info("Update animation:", this.npc.name(), this.name, anim);
      this.add_anim(anim, state);
    }
  },
  set_state(new_state: Optional<string>, fast_set: Optional<boolean>): void {
    log.info("Setting state:", new_state, this);

    /**
     * Force animation over existing ones.
     */
    if (fast_set === true) {
      this.npc.clear_animations();

      const state =
        this.states.anim_marker == MARKER_IN
          ? this.animations.get(this.states.target_state!)
          : this.animations.get(this.states.current_state!);

      if (state !== null && state.out !== null) {
        const wpn_slot = this.weapon_slot();
        const anim_for_slot = this.anim_for_slot(wpn_slot, state.out as any);

        if (anim_for_slot !== null) {
          for (const [k, next_anim] of anim_for_slot) {
            if (type(next_anim) === "table") {
              this.process_special_action(next_anim as any);
            }
          }
        }
      }

      // -- ��������� current_state � null
      // --printf("NULIFY ANIM MARKER %s", tostring(this.states.anim_marker))

      this.states.anim_marker = null;

      this.states.current_state = new_state;
      this.states.target_state = new_state;
      this.states.seq_id = 1;

      this.states.next_rnd = time_global();

      return;
    }

    this.states.target_state = new_state;
    this.states.next_rnd = time_global();

    log.info("Set state:", new_state, this);
  },
  select_anim(): LuaMultiReturn<[Optional<string>, any]> {
    log.info("Select animation:", this);

    const states = this.states;

    // --printf("[%s] [%s] select anim [%s], current_state [%s]", this.npc:name(), this.name,
    // tostring(states.target_state), tostring(states.current_state))
    // --printf("        time %s", time_global())
    // --printf("        current state %s", utils.to_str(states.current_state))
    // --printf("        target state %s", utils.to_str(states.target_state))

    // New animation detected:
    if (states.target_state !== states.current_state) {
      if (states.target_state === null) {
        log.info("Reset animation:", this);

        const state = this.animations.get(states.current_state!);

        if (state.out === null) {
          states.anim_marker = MARKER_OUT;
          this.animation_callback(true);

          return $multi(null, null);
        }

        states.anim_marker = MARKER_OUT;

        const wpn_slot = this.weapon_slot();
        const anim_for_slot = this.anim_for_slot(wpn_slot, state.out as any);

        if (anim_for_slot == null) {
          states.anim_marker = MARKER_OUT;
          this.animation_callback(true);

          return $multi(null, null);
        }

        const next_anim = anim_for_slot.get(states.seq_id);

        if (type(next_anim) == "table") {
          log.info("Preprocess special action:", states.current_state, states.seq_id, this);
          this.process_special_action(next_anim as any);
          this.animation_callback();

          return $multi(null, null);
        }

        return $multi(next_anim as any as string, state);
      }

      if (states.current_state === null) {
        log.info("New animation:", this);

        const state = this.animations.get(states.target_state!);

        if (state.into == null) {
          states.anim_marker = MARKER_IN;
          this.animation_callback(true);

          return $multi(null, null);
        }

        states.anim_marker = MARKER_IN;

        const wpn_slot = this.weapon_slot();
        const anim_for_slot = this.anim_for_slot(wpn_slot, state.into as any);

        if (anim_for_slot == null) {
          // --printf("anim for slot null")
          states.anim_marker = MARKER_IN;
          this.animation_callback(true);

          return $multi(null, null);
        }

        const next_anim = anim_for_slot.get(states.seq_id);

        if (type(next_anim) == "table") {
          this.process_special_action(next_anim as any);
          this.animation_callback();

          return $multi(null, null);
        }

        return $multi(next_anim as any as string, state);
      }
    }

    // Same non-null animation:
    if (states.target_state === states.current_state && states.current_state !== null) {
      log.info("Update animation:", this);

      // --printf("        select rnd")
      const wpn_slot: number = this.weapon_slot();
      const state: IAnimationDescriptor = this.animations.get(states.current_state);
      let anim;

      if (state.rnd !== null) {
        anim = this.select_rnd(state as any, wpn_slot, time_global() >= states.next_rnd!);
      }

      if (anim == null && state.idle !== null) {
        anim = this.anim_for_slot(wpn_slot, state.idle as any);
      }

      if (anim !== null) {
        states.anim_marker = MARKER_IDLE;
      }

      return $multi(anim, state) as any;
    }

    return $multi(null, null);
  },
  weapon_slot(): number {
    const weapon: Optional<XR_game_object> = this.npc.active_item();

    if (weapon === null || this.npc.weapon_strapped()) {
      return 0;
    }

    return weapon.animation_slot();
  },
  anim_for_slot(slot, t): LuaTable<number, string | LuaTable> {
    log.info("Animation for slot:", slot, this);
    // --    printf("ANIM [%s] for slot [%s]", this.name, tostring(slot))
    // --    print_table(t)
    // --    printf("-------------------------")

    if (t.get(slot) === null) {
      slot = 0;
    }

    return t.get(slot);
  },
  select_rnd(anim_state, wpn_slot, must_play): Optional<string | LuaTable> {
    if (!must_play && math.random(100) > this.animations.get(this.states.current_state!).prop.rnd) {
      return null;
    }

    log.info("Select RND animation:", wpn_slot, must_play);

    const anima = this.anim_for_slot(wpn_slot, anim_state.rnd as any);

    if (anima === null) {
      return null;
    }

    const states = this.states;
    let r: number;

    if (anima.length() > 1) {
      if (states.last_id === null) {
        r = math.random(anima.length());
      } else {
        r = math.random(anima.length() - 1);

        if (r >= states.last_id) {
          r = r + 1;
        }
      }

      this.states.last_id = r;
    } else {
      r = 1;
    }

    return anima.get(r) as any as string;
  },
  add_anim(anim: string, state: IAnimationDescriptor): void {
    log.info("Add animation:", anim, type(state), this);

    const npc: XR_game_object = this.npc;
    const animation_props = state.prop;

    // --printf("[%s][%s] add_anim[%s] time[%s] no_rootmove[%s] %s", this.npc:name(), this.name, tostring(anim),
    // time_global(), tostring(animation_props == null or animation_props.moving !== true), device():time_global())

    if (!(npc.weapon_unstrapped() || npc.weapon_strapped())) {
      // --callstack()
      abort("Illegal call of add animation. Weapon is strapping now!!! %s", npc.name());
    }

    if (animation_props === null || animation_props.moving !== true) {
      log.info("No props animation addition:", this.npc.name(), anim);
      npc.add_animation(anim, true, false);

      return;
    }

    if (this.mgr.animation_position === null || this.mgr.pos_direction_applied === true) {
      // --npc:set_sight(CSightParams.eSightTypeAnimationDirection, false,false)
      // --        printf("%s no pos", npc:name())
      log.info("No position animation addition:", this.npc.name(), anim);
      npc.add_animation(anim, true, true);
    } else {
      if (this.mgr.animation_direction == null) {
        abort("Animation direction missing");
      }

      const rot_y = -math.deg(math.atan2(this.mgr.animation_direction.x, this.mgr.animation_direction.z));

      // --const rot_y2 =
      // math.deg(math.acos( (v1.x*v2.x + v1.y*v2.y)/math.sqrt((v1.x*v1.x + v1.y*v1.y)*(v2.x*v2.x + v2.y*v2.y))  ))

      // --printf("%s UGOL %s", npc:name(), rot_y)
      log.info("Positional animation addition:", this.npc.name(), anim);
      npc.add_animation(anim, true, this.mgr.animation_position, new vector().set(0, rot_y, 0), false);

      this.mgr.pos_direction_applied = true;
    }
  },
  animation_callback(skip_multianim_check?: boolean): void {
    if (this.states.anim_marker === null || this.npc.animation_count() !== 0) {
      return;
    }

    const states = this.states;

    if (states.anim_marker === MARKER_IN) {
      log.info("Animation callback:", this);

      states.anim_marker = null;

      if (skip_multianim_check !== true) {
        let into_table: LuaTable<number, string | LuaTable> = new LuaTable();
        const target_anims = this.animations.get(states.target_state!);

        if (target_anims !== null && target_anims.into !== null) {
          into_table = this.anim_for_slot(this.weapon_slot(), target_anims.into as any) as any;
        }

        if (into_table !== null && into_table.length() > states.seq_id) {
          states.seq_id = states.seq_id + 1;
          this.update_anim();

          return;
        }
      }

      states.seq_id = 1;
      states.current_state = states.target_state;
      this.update_anim();

      return;
    }

    if (states.anim_marker === MARKER_IDLE) {
      log.info("Animation callback:", this);

      states.anim_marker = null;

      const props = this.animations.get(states.current_state!).prop;

      if (props.maxidle === 0) {
        states.next_rnd = time_global() + props.sumidle * 1000;
      } else {
        states.next_rnd = time_global() + (props.sumidle + math.random(props.maxidle)) * 1000;
      }

      this.update_anim();

      return;
    }

    if (states.anim_marker === MARKER_OUT) {
      log.info("Animation callback:", this.npc.name(), "OUT");

      states.anim_marker = null;

      if (skip_multianim_check !== true) {
        let out_table: LuaTable<number, string | LuaTable> = new LuaTable();

        if (this.animations.get(states.current_state!).out) {
          out_table = this.anim_for_slot(
            this.weapon_slot(),
            this.animations.get(states.current_state!).out as any
          ) as any;
        }

        if (out_table !== null && out_table.length() > states.seq_id) {
          states.seq_id = states.seq_id + 1;
          this.update_anim();

          return;
        }
      }

      states.seq_id = 1;
      states.current_state = null;

      if (this.name == "state_mgr_animation_list") {
        if (this.mgr.animstate !== null && this.mgr.animstate.set_control !== null) {
          this.mgr.animstate.set_control();
          // --this.mgr.animstate:update_anim()
        }
      }
    }
  },
  process_special_action(action_table: LuaTable): void {
    // --printf("[%s] process_special_action", this.npc:name())

    // Attach.
    if (action_table.get("a") !== null) {
      // -- printf("item [%s] attach", utils.to_str(action_table.a))

      const obj = this.npc.object(action_table.get("a"));

      if (obj !== null) {
        obj.enable_attachable_item(true);
      }
    }

    // Detach.
    if (action_table.get("d") !== null) {
      // -- printf("item [%s] detach", utils.to_str(action_table.d))
      const obj = this.npc.object(action_table.get("d"));

      if (obj !== null) {
        obj.enable_attachable_item(false);
      }
    }

    // Play sound.
    if (action_table.get("s") !== null) {
      get_global<AnyCallablesModule>("xr_sound").set_sound_play(this.npc.id(), action_table.get("s"));
    }

    // Hit actor.
    if (action_table.get("sh") !== null) {
      const h = new hit();

      h.power = action_table.get("sh");
      h.direction = vectorRotateY(this.npc.direction(), 90);
      h.draftsman = this.npc;
      h.impulse = 200;
      h.type = hit.wound;
      this.npc.hit(h);
    }

    // Custom function.
    const cb: Optional<AnyCallable> = action_table.get("f");

    if (cb !== null) {
      // --printf("called function [%s]", tostring(action_table.f))
      cb(this.npc);
    }
  },
  __tostring(): string {
    const states: string =
      `#current_state: ${this.states.current_state} #target_state: ${this.states.target_state} ` +
      `#anim_marker: ${this.states.anim_marker} #seq_id: ${this.states.seq_id} #last_id: ${this.states.last_id}`;

    return `AnimationManager #name: ${this.name} #npc: ${this.npc.name()} #sid: ${this.sid} ${states}`;
  }
} as IAnimationManager);
