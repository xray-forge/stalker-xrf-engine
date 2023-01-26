import {
  alife,
  cond,
  game,
  move,
  patrol,
  sound_object,
  vector,
  XR_cse_alife_monster_abstract,
  XR_game_object,
  XR_ini_file,
  XR_sound_object,
  XR_vector
} from "xray16";

import { sounds } from "@/mod/globals/sound/sounds";
import { AnyCallablesModule, AnyObject, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { action } from "@/mod/scripts/utils/alife";
import { getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionMonster");

export class ActionMonster extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_monster";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    log.info("Add to binder:", object.id());

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionMonster(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

    st.snd_obj = getConfigString(ini, section, "snd", object, false, "", null);
    st.delay = getConfigNumber(ini, section, "delay", object, false, 0);
    st.idle = getConfigNumber(ini, section, "idle", object, false, 30) * 10000;

    const path: string = getConfigString(ini, section, "sound_path", object, false, "", null)!;

    st.path_table = parseNames(path);
    st.monster = getConfigString(ini, section, "monster_section", object, false, "", null);
    st.sound_slide_vel = getConfigNumber(ini, section, "slide_velocity", object, false, 7);
  }

  public is_actor_inside: Optional<boolean> = null;
  public final_action: Optional<boolean> = null;
  public idle_state: Optional<boolean> = null;
  public path_name: Optional<string> = null;
  public cur_point: Optional<number> = null;
  public dir!: XR_vector;
  public current!: XR_vector;
  public target!: XR_vector;

  public monster: Optional<XR_cse_alife_monster_abstract> = null;
  public monster_obj: Optional<XR_game_object> = null;

  public snd_obj: Optional<XR_sound_object> = null;
  public appear_snd!: XR_sound_object;

  public reset_scheme(): void {
    this.is_actor_inside = false;

    this.state.idle_end = 0;
    this.state.signals = {};
    this.snd_obj = null;
    this.final_action = false;
    this.appear_snd = new sound_object(sounds.monsters_boar_boar_attack_1);
    this.idle_state = false;
    this.path_name = null;
    this.monster_obj = null;
  }

  public update(delta: number): void {
    const actor = getActor()!;

    if (this.idle_state) {
      if (this.state.idle_end <= game.time()) {
        this.idle_state = false;
      }

      return;
    }

    if (this.is_actor_inside === null && this.state.monster !== null) {
      this.is_actor_inside = this.object.inside(actor.position());

      return;
    }

    if (this.object.inside(actor.position())) {
      if (!this.is_actor_inside) {
        this.on_enter();
        this.is_actor_inside = true;
      }
    }

    if (
      this.final_action &&
      (storage.get(this.monster!.id) === null ||
        this.monster_obj!.position().distance_to(this.state.path.point(this.state.path.count() - 1)) <= 1)
    ) {
      if (storage.has(this.monster!.id)) {
        get_global<AnyCallablesModule>("xr_logic").mob_release(this.monster_obj);
      }

      alife().release(this.monster, true);

      this.monster = null;
      this.monster_obj = null;
      this.final_action = false;
      this.idle_state = true;
      this.state.idle_end = game.time() + this.state.idle;
      this.is_actor_inside = false;
      this.reset_path();

      return;
    }

    if (this.is_actor_inside === true && this.monster === null) {
      const target_pos = new vector().set(this.current);

      target_pos.mad(this.dir, (this.state.sound_slide_vel * delta) / 1000);
      if (target_pos.distance_to(this.current) > this.current.distance_to(this.target)) {
        this.cur_point = this.next_point();
        this.set_positions();
      } else {
        this.current = new vector().set(target_pos);
      }

      this.snd_obj = GlobalSound.set_sound_play(this.object.id(), this.state.snd_obj, null, null);
      if (this.snd_obj && this.snd_obj.playing()) {
        this.snd_obj.set_position(this.current);
      }
    } else if (
      this.monster_obj === null &&
      this.monster !== null &&
      storage.get(this.monster.id) !== null &&
      !this.final_action
    ) {
      this.monster_obj = storage.get(this.monster.id).object!;

      get_global<AnyCallablesModule>("xr_logic").mob_capture(this.monster_obj, true);

      action(
        this.monster_obj,
        new move(move.run_fwd, this.state.path.point(this.state.path.count() - 1)),
        new cond(cond.move_end)
      );
      this.final_action = true;
    }

    get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, getActor());
  }

  public on_enter(): void {
    this.reset_path();
    this.set_positions();
  }

  public reset_path(): void {
    this.cur_point = 0;

    const path_count = this.state.path_table!.length();

    if (path_count === 1) {
      this.path_name = this.state.path_table!.get(1);
      this.state.path = new patrol(this.path_name);

      return;
    }

    let path_name_new = this.path_name;

    // todo: WTF?
    while (this.path_name === path_name_new) {
      path_name_new = this.state.path_table!.get(math.random(1, path_count));
    }

    this.path_name = path_name_new;
    this.state.path = new patrol(this.path_name!);
  }

  public next_point(): number {
    if (this.cur_point! + 1 < this.state.path.count()) {
      return this.cur_point! + 1;
    } else {
      return 0;
    }
  }

  public set_positions(): void {
    if (this.next_point() === 0) {
      if (this.monster === null && this.state.monster !== null) {
        this.monster = alife().create<XR_cse_alife_monster_abstract>(
          this.state.monster,
          this.current,
          this.object.level_vertex_id(),
          this.object.game_vertex_id()
        );
        (this.monster as AnyObject).sim_forced_online = true;
      }

      this.appear_snd.play_at_pos(getActor()!, this.current, 0, sound_object.s3d);

      if (this.snd_obj !== null) {
        this.snd_obj.stop();
      }

      this.reset_path();
    }

    this.current = this.state.path.point(this.cur_point);
    this.target = this.state.path.point(this.next_point());
    this.dir = new vector().sub(this.target, this.current).normalize();
  }
}
