import { particles_object, patrol, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import {
  EParticleBehaviour,
  IParticleDescriptor,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { parseWaypointsData } from "@/engine/core/utils/ini/ini_parse";
import { IWaypointData } from "@/engine/core/utils/ini/ini_types";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { LuaArray, Optional, ParticlesObject, Patrol, TCount, TDuration, TIndex, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class ParticleManager extends AbstractSchemeManager<ISchemeParticleState> {
  public isStarted: boolean = false;
  public isFirstPlayed: boolean = false;
  // todo: nextUpdateAt
  public updatedAt: TTimestamp = 0;
  public particles: LuaArray<IParticleDescriptor> = new LuaTable();
  public path: Optional<Patrol> = null;

  public override activate(): void {
    const now: TTimestamp = time_global();

    if (this.state.mode === EParticleBehaviour.SECOND) {
      this.path = new patrol(this.state.path);

      const flags: LuaArray<IWaypointData> = parseWaypointsData(this.state.path)!;

      // Make sure order is maintained with range loop.
      for (const it of $range(1, this.path.count())) {
        let delay: TDuration = 0;
        const pointIndex: TIndex = it - 1;

        if (flags.get(pointIndex)["d"]) {
          delay = tonumber(flags.get(pointIndex)["d"]) ?? 0;
        }

        this.particles.set(it, {
          particle: new particles_object(this.state.name),
          snd: null,
          delay: delay,
          time: now,
          played: false,
        });
      }
    } else {
      this.particles.set(1, {
        particle: new particles_object(this.state.name),
        snd: null,
        delay: 0,
        time: now,
        played: false,
      });

      this.path = null;
    }

    this.updatedAt = 0;
    this.isStarted = false;
    this.isFirstPlayed = false;
    this.state.signals = new LuaTable();
  }

  public override deactivate(): void {
    // Make sure order is maintained with range loop.
    for (const it of $range(1, this.particles.length())) {
      const particle: IParticleDescriptor = this.particles.get(it);

      if (particle.particle.playing()) {
        particle.particle.stop();
      }

      particle.particle = null as unknown as ParticlesObject;

      if (particle.snd && particle.snd.playing()) {
        particle.snd.stop();
      }

      particle.snd = null;
    }
  }

  public update(): void {
    const time: TTimestamp = time_global();

    if (this.updatedAt !== 0 && time - this.updatedAt < 50) {
      return;
    } else {
      this.updatedAt = time;
    }

    if (this.isStarted) {
      this.isStarted = true;

      if (this.state.mode === EParticleBehaviour.FIRST) {
        const particle: IParticleDescriptor = this.particles.get(1);

        particle.particle.load_path(this.state.path);
        particle.particle.start_path(this.state.looped);
        particle.particle.play();
        particle.played = true;

        this.isFirstPlayed = true;
      }

      return;
    }

    if (this.state.mode === EParticleBehaviour.FIRST) {
      this.updateMode1();
    } else {
      this.updateMode2();
    }

    this.isEnded();

    trySwitchToAnotherSection(this.object, this.state);
  }

  /**
   * Note: has side effect with signal set.
   * todo: Description.
   */
  public isEnded(): boolean {
    if (this.state.looped || this.isFirstPlayed) {
      return false;
    }

    const count: TCount = this.particles.length();

    if (count === 0) {
      return true;
    }

    // Make sure order is maintained with range loop.
    for (const it of $range(1, count)) {
      const particle: ParticlesObject = this.particles.get(it).particle;

      if (particle?.playing()) {
        return false;
      }
    }

    this.state.signals!.set("particle_end", true);

    return true;
  }

  /**
   * Handle loop playback scenario.
   * todo: Description.
   */
  public updateMode1(): void {
    if (this.state.looped) {
      const particle: ParticlesObject = this.particles.get(1).particle;

      if (!particle.playing()) {
        particle.play();
      }
    }
  }

  /**
   * todo: Description.
   */
  public updateMode2(): void {
    const now: TTimestamp = time_global();

    // Make sure order is maintained with range loop.
    for (const it of $range(1, this.particles.length())) {
      const particle: IParticleDescriptor = this.particles.get(it);

      if (now - particle.time > particle.delay && !particle.particle.playing()) {
        const pointIndex: TIndex = it - 1;

        if (!particle.played) {
          particle.particle.play_at_pos(this.path!.point(pointIndex));

          if (particle.snd) {
            particle.snd.play_at_pos(this.object, this.path!.point(pointIndex), 0);
          }

          particle.played = true;
          this.isFirstPlayed = true;
        } else if (this.state.looped) {
          particle.particle.play_at_pos(this.path!.point(pointIndex));

          if (particle.snd) {
            particle.snd.play_at_pos(this.object, this.path!.point(pointIndex), 0);
          }
        }
      }
    }
  }
}
