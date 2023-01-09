import { callback, hit, time_global, vector, XR_game_object, XR_LuaBindBase } from "xray16";

import { AnyCallable, AnyCallablesModule, Optional } from "@/mod/lib/types";
import { IAnimationDescriptor } from "@/mod/scripts/core/state_management/lib/state_mgr_animation_list";
import { IAnimationStateDescriptor } from "@/mod/scripts/core/state_management/lib/state_mgr_animstate_list";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { abort } from "@/mod/scripts/utils/debug";
import { vectorRotateY } from "@/mod/scripts/utils/physics";

const MARKER_IN: number = 1;
const MARKER_OUT: number = 2;
const MARKER_IDLE: number = 3;

export interface IAnimation extends XR_LuaBindBase {
  mgr: StateManager;
  npc: XR_game_object;
  name: string;
  animations: LuaTable<string, IAnimationDescriptor>;
  sid: number;
  anim_callback?: AnyCallable;
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
  set_state(new_state: Optional<string>, fast_set: Optional<boolean>): void;
  select_anim(): LuaMultiReturn<[Optional<string>, any]>;
  weapon_slot(): number;
  anim_for_slot(slot: number, t: LuaTable<number, LuaTable<number, string | LuaTable>>): LuaTable<number, string>;
  select_rnd(anim_state: IAnimationStateDescriptor, wpn_slot: number, must_play: boolean): Optional<LuaTable>;
  add_anim(anim: Optional<string | number>, state: IAnimationDescriptor): void;
  animation_callback(skip_multianim_check?: boolean): void;
  process_special_action(action_table: LuaTable): void;
}

export const Animation: IAnimation = declare_xr_class("Animation", null, {
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
  },
  set_control(): void {
    // --printf("[%s] [%s] set control current_state[%s] marker[%s] sid[%s]", this.npc:name(), this.name,
    // tostring(this.states.current_state), tostring(this.states.anim_marker), this.sid)

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
      this.add_anim(anim, state as any);
    }
  },
  set_state(new_state: Optional<string>, fast_set: Optional<boolean>): void {
    // --printf("[%s] [%s] set new animation [%s], current_state [%s]", this.npc:name(), this.name,
    // tostring(new_state), tostring(this.states.current_state))
    // --    print_table(this.states)

    if (fast_set === true) {
      // --printf(" FAST SET %s  sid(%s)", this.npc:name(), this.sid)
      // -- clear_animations

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
  },
  select_anim(): LuaMultiReturn<[Optional<string>, any]> {
    const states = this.states;

    // --printf("[%s] [%s] select anim [%s], current_state [%s]", this.npc:name(), this.name,
    // tostring(states.target_state), tostring(states.current_state))
    // --printf("        time %s", time_global())
    // --printf("        current state %s", utils.to_str(states.current_state))
    // --printf("        target state %s", utils.to_str(states.target_state))

    if (states.target_state !== states.current_state) {
      if (states.target_state === null) {
        const state = this.animations.get(states.current_state!);

        if (state.out == null) {
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
          this.process_special_action(next_anim as any);
          this.animation_callback();

          return $multi(null, null);
        }

        return $multi(next_anim, state);
      }

      if (states.current_state === null) {
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

        return $multi(next_anim, state);
      }
    }

    if (states.target_state === states.current_state && states.current_state !== null) {
      // --printf("        select rnd")
      const wpn_slot = this.weapon_slot();
      const state = this.animations.get(this.states.current_state!);
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
    const weapon = this.npc.active_item();

    if (weapon === null || this.npc.weapon_strapped() === true) {
      return 0;
    }

    return weapon.animation_slot();
  },
  anim_for_slot(slot, t): LuaTable<number, string | LuaTable> {
    // --    printf("ANIM [%s] for slot [%s]", this.name, tostring(slot))
    // --    print_table(t)
    // --    printf("-------------------------")

    if (t.get(slot) === null) {
      slot = 0;
    }

    // if (t[0] === null) {
    // --        print_table(t)
    // --        abort("cant find animation for slot %s", tonumber(slot))
    // }

    return t.get(slot);
  },
  select_rnd(anim_state, wpn_slot, must_play): Optional<string | LuaTable> {
    if (!must_play && math.random(100) > this.animations.get(this.states.current_state!).prop.rnd) {
      return null;
    }

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

    return anima.get(r);
  },
  add_anim(anim: string, state: IAnimationDescriptor): void {
    const npc = this.npc;
    const animation_props = state.prop;

    // --printf("[%s][%s] add_anim[%s] time[%s] no_rootmove[%s] %s", this.npc:name(), this.name, tostring(anim),
    // time_global(), tostring(animation_props == null or animation_props.moving !== true), device():time_global())

    if (!(npc.weapon_unstrapped() || npc.weapon_strapped())) {
      // --callstack()
      abort("Illegal call of add animation. Weapon is strapping now!!! %s", npc.name());
    }

    if (animation_props == null || animation_props.moving !== true) {
      npc.add_animation(anim, true, false);

      return;
    }

    if (this.mgr.animation_position == null || this.mgr.pos_direction_applied == true) {
      // -- �������� � �������������.
      // --npc:set_sight(CSightParams.eSightTypeAnimationDirection, false,false)
      // --        printf("%s no pos", npc:name())
      npc.add_animation(anim, true, true);
    } else {
      if (this.mgr.animation_direction == null) {
        abort("Animation direction missing");
      }

      // -- ���� ���������� ������� (��������� ������. ����� ��� ��������� � ������ ��������� �� ������)
      const rot_y = -math.deg(math.atan2(this.mgr.animation_direction.x, this.mgr.animation_direction.z));

      // --const rot_y2 =
      // math.deg(math.acos( (v1.x*v2.x + v1.y*v2.y)/math.sqrt((v1.x*v1.x + v1.y*v1.y)*(v2.x*v2.x + v2.y*v2.y))  ))

      // --printf("%s UGOL %s", npc:name(), rot_y)
      // -- ������������� ������ - ��� ����� ����� �������� �������� � ���������� �����������.
      npc.add_animation(anim, true, this.mgr.animation_position, new vector().set(0, rot_y, 0), false);

      this.mgr.pos_direction_applied = true;
    }
  },
  animation_callback(skip_multianim_check?: boolean): void {
    // --printf("[%s][%s] ANIM CALLBACK time[%s] count[%s]", this.npc:name(), this.name,
    // time_global(), this.npc:animation_count())

    if (this.npc.animation_count() !== 0) {
      return;
    }

    const states = this.states;

    if (states.anim_marker === MARKER_IN) {
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

        states.seq_id = 1;
        states.current_state = null;

        if (this.name == "state_mgr_animation_list") {
          if (this.mgr.animstate !== null && this.mgr.animstate.set_control !== null) {
            this.mgr.animstate.set_control();
            // --this.mgr.animstate:update_anim()
          }
        }
      }
    }
  },
  process_special_action(action_table: LuaTable): void {
    // --printf("[%s] process_special_action", this.npc:name())

    if (action_table.get("a") !== null) {
      // -- printf("item [%s] attach", utils.to_str(action_table.a))

      const obj = this.npc.object(action_table.get("a"));

      if (obj !== null) {
        obj.enable_attachable_item(true);
      }
    }

    if (action_table.get("d") !== null) {
      // -- printf("item [%s] detach", utils.to_str(action_table.d))
      const obj = this.npc.object(action_table.get("d"));

      if (obj !== null) {
        obj.enable_attachable_item(false);
      }
    }

    if (action_table.get("s") !== null) {
      get_global<AnyCallablesModule>("xr_sound").set_sound_play(this.npc.id(), action_table.get("s"));
    }

    if (action_table.get("sh") !== null) {
      const h = new hit();

      h.power = action_table.get("sh");
      h.direction = vectorRotateY(this.npc.direction(), 90);
      h.draftsman = this.npc;
      h.impulse = 200;
      h.type = hit.wound;
      this.npc.hit(h);
    }

    if (action_table.get("f") !== null) {
      // --printf("called function [%s]", tostring(action_table.f))
      action_table.get("f")(this.npc);
    }
  }
} as IAnimation);
