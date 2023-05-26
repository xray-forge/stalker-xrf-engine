import { particles_object, patrol, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils";
import { ISchemeParticleState } from "@/engine/core/schemes/sr_particle/ISchemeParticleState";
import { parsePathWaypoints } from "@/engine/core/utils/parse";
import { Optional, TCount, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class ParticleManager extends AbstractSchemeManager<ISchemeParticleState> {
  public particles: LuaTable = new LuaTable();
  public path: Optional<patrol> = null;
  public last_update: number = 0;
  public started: boolean = false;
  public first_played: boolean = false;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    if (this.state.mode === 2) {
      this.path = new patrol(this.state.path);

      const flags = parsePathWaypoints(this.state.path)!;
      const count = this.path.count();

      for (const a of $range(1, count)) {
        let d = 0;

        if (flags.get(a - 1)["d"]) {
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
          played: false,
        });
      }
    } else {
      this.particles.set(1, {
        particle: new particles_object(this.state.name),
        snd: null,
        delay: 0,
        time: time_global(),
        played: false,
      });
      this.path = null;
    }

    this.state.signals = new LuaTable();
    this.last_update = 0;
    this.started = false;
    this.first_played = false;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const time: number = time_global();

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

    trySwitchToAnotherSection(this.object, this.state, registry.actor);
  }

  /**
   * todo: Description.
   */
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

    this.state.signals!.set("particle_end", true);

    return true;
  }

  /**
   * todo: Description.
   */
  public update_mode_1(): void {
    if (this.particles.get(1).particle.playing() === false && this.state.looped === true) {
      this.particles.get(1).particle.play();
    }
  }

  /**
   * todo: Description.
   */
  public update_mode_2(): void {
    const size = this.particles.length();

    if (size === 0) {
      return;
    }

    const time: TTimestamp = time_global();

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

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    const size: TCount = this.particles.length();

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
