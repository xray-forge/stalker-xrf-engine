import { particles_object, patrol, time_global, XR_patrol } from "xray16";

import { Optional, TCount, TTimestamp } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeParticleState } from "@/mod/scripts/core/schemes/sr_particle/ISchemeParticleState";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { parsePathWaypoints } from "@/mod/scripts/utils/parse";

/**
 * todo;
 */
export class ParticleManager extends AbstractSchemeManager<ISchemeParticleState> {
  public particles: LuaTable = new LuaTable();
  public path: Optional<XR_patrol> = null;
  public last_update: number = 0;
  public started: boolean = false;
  public first_played: boolean = false;

  /**
   * todo;
   */
  public override resetScheme(): void {
    if (this.state.mode === 2) {
      this.path = new patrol(this.state.path);

      const flags = parsePathWaypoints(this.state.path)!;
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
   * todo;
   */
  public override update(delta: number): void {
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
   * todo;
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
   * todo;
   */
  public update_mode_1(): void {
    if (this.particles.get(1).particle.playing() === false && this.state.looped === true) {
      this.particles.get(1).particle.play();
    }
  }

  /**
   * todo;
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
   * todo;
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
