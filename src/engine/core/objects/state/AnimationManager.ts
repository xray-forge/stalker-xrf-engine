import { callback, hit, time_global, vector, XR_game_object } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { IAnimationDescriptor } from "@/engine/core/objects/state/lib/state_mgr_animation_list";
import { IAnimationStateDescriptor } from "@/engine/core/objects/state/lib/state_mgr_animstate_list";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { abort } from "@/engine/core/utils/debug";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorRotateY } from "@/engine/core/utils/physics";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { AnyCallable, Optional } from "@/engine/lib/types";

const MARKER_IN: number = 1;
const MARKER_OUT: number = 2;
const MARKER_IDLE: number = 3;

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
export class AnimationManager {
  public mgr: StateManager;
  public npc: XR_game_object;
  public name: string;
  public animations: LuaTable<string, IAnimationDescriptor> | LuaTable<string, IAnimationStateDescriptor>;
  public sid: number;
  public states: {
    last_id: Optional<number>;
    current_state: Optional<string>;
    target_state: Optional<string>;
    anim_marker: Optional<number>;
    next_rnd: Optional<number>;
    seq_id: number;
  };

  public constructor(
    npc: XR_game_object,
    mgr: StateManager,
    name: string,
    collection: LuaTable<string, IAnimationDescriptor> | LuaTable<string, IAnimationStateDescriptor>
  ) {
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
      seq_id: 1,
    };

    logger.info("Initialized new entry:", npc.name(), name, this.sid);

    if (collection === null) {
      abort("Provided null object for animation instance");
    }
  }

  public set_control(): void {
    logger.info("Set control:", this);

    this.npc.set_callback(callback.script_animation, this.animation_callback, this);

    if (this.name === "state_mgr_animation_list") {
      this.mgr.animstate.states.anim_marker = null;
    }

    if (this.states.anim_marker === null) {
      this.update_anim();
    }
  }

  public update_anim(): void {
    const [anim, state] = this.select_anim();

    if (anim !== null) {
      this.add_anim(anim, state);
    }
  }

  public set_state(new_state: Optional<string>, fast_set: Optional<boolean>): void {
    logger.info("Setting state:", new_state, this);

    /**
     * Force animation over existing ones.
     */
    if (fast_set === true) {
      this.npc.clear_animations();

      const state =
        this.states.anim_marker === MARKER_IN
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

    logger.info("Set state:", new_state, this);
  }

  public select_anim(): LuaMultiReturn<[Optional<string>, any]> {
    logger.info("Select animation:", this);

    const states = this.states;

    // New animation detected:
    if (states.target_state !== states.current_state) {
      if (states.target_state === null) {
        logger.info("Reset animation:", this);

        const state = this.animations.get(states.current_state!);

        if (state.out === null) {
          states.anim_marker = MARKER_OUT;
          this.animation_callback(true);

          return $multi(null, null);
        }

        states.anim_marker = MARKER_OUT;

        const wpn_slot = this.weapon_slot();
        const anim_for_slot = this.anim_for_slot(wpn_slot, state.out as any);

        if (anim_for_slot === null) {
          states.anim_marker = MARKER_OUT;
          this.animation_callback(true);

          return $multi(null, null);
        }

        const next_anim = anim_for_slot.get(states.seq_id);

        if (type(next_anim) === "table") {
          logger.info("Preprocess special action:", states.current_state, states.seq_id, this);
          this.process_special_action(next_anim as any);
          this.animation_callback();

          return $multi(null, null);
        }

        return $multi(next_anim as any as string, state);
      }

      if (states.current_state === null) {
        logger.info("New animation:", this);

        const state = this.animations.get(states.target_state!);

        if (state.into === null) {
          states.anim_marker = MARKER_IN;
          this.animation_callback(true);

          return $multi(null, null);
        }

        states.anim_marker = MARKER_IN;

        const wpn_slot = this.weapon_slot();
        const anim_for_slot = this.anim_for_slot(wpn_slot, state.into as any);

        if (anim_for_slot === null) {
          // --printf("anim for slot null")
          states.anim_marker = MARKER_IN;
          this.animation_callback(true);

          return $multi(null, null);
        }

        const next_anim = anim_for_slot.get(states.seq_id);

        if (type(next_anim) === "table") {
          this.process_special_action(next_anim as any);
          this.animation_callback();

          return $multi(null, null);
        }

        return $multi(next_anim as any as string, state);
      }
    }

    // Same non-null animation:
    if (states.target_state === states.current_state && states.current_state !== null) {
      logger.info("Update animation:", this);

      // --printf("        select rnd")
      const wpn_slot: number = this.weapon_slot();
      const state: IAnimationDescriptor | IAnimationStateDescriptor = this.animations.get(states.current_state);
      let anim;

      if (state.rnd !== null) {
        anim = this.select_rnd(state as any, wpn_slot, time_global() >= states.next_rnd!);
      }

      if (anim === null && state.idle !== null) {
        anim = this.anim_for_slot(wpn_slot, state.idle as any);
      }

      if (anim !== null) {
        states.anim_marker = MARKER_IDLE;
      }

      return $multi(anim, state) as any;
    }

    return $multi(null, null);
  }

  public weapon_slot(): number {
    const weapon: Optional<XR_game_object> = this.npc.active_item();

    if (weapon === null || this.npc.weapon_strapped()) {
      return 0;
    }

    return weapon.animation_slot();
  }

  public anim_for_slot(
    slot: number,
    t: LuaTable<number, LuaTable<number, string | LuaTable>>
  ): LuaTable<number, string | LuaTable> {
    logger.info("Animation for slot:", slot, this);
    if (t.get(slot) === null) {
      slot = 0;
    }

    return t.get(slot);
  }

  public select_rnd(
    anim_state: IAnimationStateDescriptor,
    wpn_slot: number,
    must_play: boolean
  ): Optional<string | LuaTable> {
    if (!must_play && math.random(100) > this.animations.get(this.states.current_state!).prop.rnd) {
      return null;
    }

    logger.info("Select RND animation:", wpn_slot, must_play);

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
  }

  public add_anim(anim: string, state: IAnimationDescriptor): void {
    const npc: XR_game_object = this.npc;
    const animation_props = state.prop;

    // --printf("[%s][%s] add_anim[%s] time[%s] no_rootmove[%s] %s", this.npc:name(), this.name, tostring(anim),
    // time_global(), tostring(animation_props === null or animation_props.moving !== true), device():time_global())

    if (!(npc.weapon_unstrapped() || npc.weapon_strapped())) {
      // --callstack()
      abort("Illegal call of add animation. Weapon is strapping now!!! %s", npc.name());
    }

    if (animation_props === null || animation_props.moving !== true) {
      logger.info("No props animation addition:", this.npc.name(), anim);
      npc.add_animation(anim, true, false);

      return;
    }

    if (this.mgr.animation_position === null || this.mgr.pos_direction_applied === true) {
      // --npc:set_sight(CSightParams.eSightTypeAnimationDirection, false,false)
      // --        printf("%s no pos", npc:name())
      logger.info("No position animation addition:", this.npc.name(), anim);
      npc.add_animation(anim, true, true);
    } else {
      if (this.mgr.animation_direction === null) {
        abort("Animation direction missing");
      }

      const rot_y = -math.deg(math.atan2(this.mgr.animation_direction.x, this.mgr.animation_direction.z));

      // --const rot_y2 =
      // math.deg(math.acos( (v1.x*v2.x + v1.y*v2.y)/math.sqrt((v1.x*v1.x + v1.y*v1.y)*(v2.x*v2.x + v2.y*v2.y))  ))

      // --printf("%s UGOL %s", npc:name(), rot_y)
      logger.info("Positional animation addition:", this.npc.name(), anim);
      npc.add_animation(anim, true, this.mgr.animation_position, new vector().set(0, rot_y, 0), false);

      this.mgr.pos_direction_applied = true;
    }
  }

  public animation_callback(skip_multianim_check?: boolean): void {
    if (this.states.anim_marker === null || this.npc.animation_count() !== 0) {
      return;
    }

    const states = this.states;

    if (states.anim_marker === MARKER_IN) {
      logger.info("Animation callback:", this);

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
      logger.info("Animation callback:", this);

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
      logger.info("Animation callback:", this.npc.name(), "OUT");

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

      if (this.name === "state_mgr_animation_list") {
        if (this.mgr.animstate !== null && this.mgr.animstate.set_control !== null) {
          this.mgr.animstate.set_control();
          // --this.mgr.animstate:update_anim()
        }
      }
    }
  }

  public process_special_action(actionTable: LuaTable): void {
    // Attach.
    if (actionTable.get("a") !== null) {
      const obj = this.npc.object(actionTable.get("a"));

      if (obj !== null) {
        obj.enable_attachable_item(true);
      }
    }

    // Detach.
    if (actionTable.get("d") !== null) {
      const obj = this.npc.object(actionTable.get("d"));

      if (obj !== null) {
        obj.enable_attachable_item(false);
      }
    }

    // Play sound.
    if (actionTable.get("s") !== null) {
      GlobalSoundManager.getInstance().setSoundPlaying(this.npc.id(), actionTable.get("s"), null, null);
    }

    // Hit actor.
    if (actionTable.get("sh") !== null) {
      const h = new hit();

      h.power = actionTable.get("sh");
      h.direction = vectorRotateY(this.npc.direction(), 90);
      h.draftsman = this.npc;
      h.impulse = 200;
      h.type = hit.wound;
      this.npc.hit(h);
    }

    // Custom function.
    const cb: Optional<AnyCallable> = actionTable.get("f");

    if (cb !== null) {
      // --printf("called function [%s]", tostring(action_table.f))
      cb(this.npc);
    }
  }

  public toString(): string {
    const states: string =
      `#current_state: ${this.states.current_state} #target_state: ${this.states.target_state} ` +
      `#anim_marker: ${this.states.anim_marker} #seq_id: ${this.states.seq_id} #last_id: ${this.states.last_id}`;

    return `AnimationManager #name: ${this.name} #npc: ${this.npc.name()} #sid: ${this.sid} ${states}`;
  }
}
