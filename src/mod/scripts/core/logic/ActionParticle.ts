import { particles_object, patrol, time_global, XR_game_object, XR_ini_file, XR_patrol } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { getConfigBoolean, getConfigNumber, getConfigString, path_parse_waypoints } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionParticle");

export class ActionParticle extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_particle";

  /**
   * Add scheme to object binder for initialization.
   */
  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    log.info("Add to binder:", object.name());

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionParticle(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(object, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);

    st.name = getConfigString(ini, section, "name", object, true, "", null);
    st.path = getConfigString(ini, section, "path", object, true, "", null);
    st.mode = getConfigNumber(ini, section, "mode", object, true);
    st.looped = getConfigBoolean(ini, section, "looped", object, false);

    if (st.path === null || st.path === "") {
      abort("SR_PARTICLE : invalid path name");
    }

    if (st.mode !== 1 && st.mode !== 2) {
      abort("SR_PARTICLE : invalid mode");
    }
  }

  public particles: LuaTable = new LuaTable();
  public path: Optional<XR_patrol> = null;
  public last_update: number = 0;
  public started: boolean = false;
  public first_played: boolean = false;

  public reset_scheme(): void {
    if (this.state.mode === 2) {
      this.path = new patrol(this.state.path);

      const flags = path_parse_waypoints(this.state.path)!;
      const count = this.path.count();

      for (const a of $range(1, count)) {
        let d = 0;

        if (flags.get(a - 1)["d"] !== null) {
          d = tonumber(flags.get(a - 1)["d"])!;
          if (d === null) {
            d = 0;
          }
        }

        this.particles.set(a, {
          particle: new particles_object(this.state.name),
          snd: null,
          delay: d,
          time: time_global(),
          played: false
        });
      }
    } else {
      this.particles.set(1, {
        particle: new particles_object(this.state.name),
        snd: null,
        delay: 0,
        time: time_global(),
        played: false
      });
      this.path = null;
    }

    this.state.signals = {};
    this.last_update = 0;
    this.started = false;
    this.first_played = false;
  }

  public update(delta: number): void {
    const time = time_global();

    if (this.last_update !== 0) {
      if (time - this.last_update < 50) {
        return;
      } else {
        this.last_update = time;
      }
    } else {
      this.last_update = time;
    }

    if (this.started) {
      this.started = true;

      if (this.state.mode === 1) {
        const particle = this.particles.get(1);

        particle.particle.load_path(this.state.path);
        particle.particle.start_path(this.state.looped);
        particle.particle.play();
        particle.played = true;

        this.first_played = true;
      }

      return;
    }

    if (this.state.mode === 1) {
      this.update_mode_1();
    } else {
      this.update_mode_2();
    }

    this.is_end();

    get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, getActor());
  }

  public is_end(): boolean {
    if (this.state.looped === true || this.first_played) {
      return false;
    }

    const size = this.particles.length();

    if (size === 0) {
      return true;
    }

    for (const a of $range(1, size)) {
      const particle = this.particles.get(a).particle;

      if (particle && particle.playing() === true) {
        return false;
      }
    }

    this.state.signals["particle_end"] = true;

    return true;
  }

  public update_mode_1(): void {
    if (this.particles.get(1).particle.playing() === false && this.state.looped === true) {
      this.particles.get(1).particle.play();
    }
  }

  public update_mode_2(): void {
    const size = this.particles.length();

    if (size === 0) {
      return;
    }

    const time: number = time_global();

    for (const it of $range(1, size)) {
      const particle = this.particles.get(it);

      if (time - particle.time > particle.delay && particle.particle.playing() === false) {
        if (particle.played === false) {
          particle.particle.play_at_pos(this.path!.point(it - 1));
          if (particle.snd !== null) {
            particle.snd.play_at_pos(this.object, this.path!.point(it - 1), 0);
          }

          particle.played = true;
          this.first_played = true;
        } else {
          if (this.state.looped === true) {
            particle.particle.play_at_pos(this.path!.point(it - 1));
            if (particle.snd !== null) {
              particle.snd.play_at_pos(this.object, this.path!.point(it - 1), 0);
            }
          }
        }
      }
    }
  }

  public deactivate(): void {
    const size = this.particles.length();

    for (const it of $range(1, size)) {
      const particle = this.particles.get(it);

      if (particle.particle.playing() === true) {
        particle.particle.stop();
      }

      particle.particle = null;

      if (particle.snd !== null && particle.snd.playing() === true) {
        particle.snd.stop();
      }

      particle.snd = null;
    }
  }
}
