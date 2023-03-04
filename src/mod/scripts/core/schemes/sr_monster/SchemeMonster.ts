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
  XR_vector,
} from "xray16";

import { sounds } from "@/mod/globals/sound/sounds";
import { AnyObject, EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { mobCapture } from "@/mod/scripts/core/schemes/mobCapture";
import { mobRelease } from "@/mod/scripts/core/schemes/mobRelease";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { action } from "@/mod/scripts/utils/alife";
import { cfg_get_switch_conditions, getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeMonster");

/**
 * todo;
 */
export class SchemeMonster extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_MONSTER;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.id());

    subscribeActionForEvents(object, state, new SchemeMonster(object, state));
  }

  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
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

  public override resetScheme(): void {
    this.is_actor_inside = false;

    this.state.idle_end = 0;
    this.state.signals = {};
    this.snd_obj = null;
    this.final_action = false;
    this.appear_snd = new sound_object(sounds.monsters_boar_boar_swamp_appear_1);
    this.idle_state = false;
    this.path_name = null;
    this.monster_obj = null;
  }

  public override update(delta: number): void {
    const actor = registry.actor;

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
      (registry.objects.get(this.monster!.id) === null ||
        this.monster_obj!.position().distance_to(this.state.path.point(this.state.path.count() - 1)) <= 1)
    ) {
      if (registry.objects.has(this.monster!.id)) {
        mobRelease(this.monster_obj!, SchemeMonster.name);
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

      this.snd_obj = GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), this.state.snd_obj, null, null);
      if (this.snd_obj && this.snd_obj.playing()) {
        this.snd_obj.set_position(this.current);
      }
    } else if (
      this.monster_obj === null &&
      this.monster !== null &&
      registry.objects.get(this.monster.id) !== null &&
      !this.final_action
    ) {
      this.monster_obj = registry.objects.get(this.monster.id).object!;

      mobCapture(this.monster_obj, true, SchemeMonster.name);

      action(
        this.monster_obj,
        new move(move.run_fwd, this.state.path.point(this.state.path.count() - 1)),
        new cond(cond.move_end)
      );
      this.final_action = true;
    }

    trySwitchToAnotherSection(this.object, this.state, registry.actor);
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

      this.appear_snd.play_at_pos(registry.actor, this.current, 0, sound_object.s3d);

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
