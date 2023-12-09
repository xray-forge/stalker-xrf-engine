import { particles_object, patrol, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import {
  EParticleBehaviour,
  IParticleDescriptor,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { IWaypointData, parseWaypointsData } from "@/engine/core/utils/ini";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { LuaArray, Optional, ParticlesObject, Patrol, TCount, TIndex, TTimestamp } from "@/engine/lib/types";

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
      const path: Patrol = new patrol(this.state.path);
      const flags: LuaArray<IWaypointData> = parseWaypointsData(this.state.path)!;

      this.path = path;

      // Make sure order is maintained with range loop.
      for (const it of $range(1, path.count())) {
        const pointIndex: TIndex = it - 1;

        this.particles.set(it, {
          particle: new particles_object(this.state.name),
          sound: null,
          delay: flags.get(pointIndex)["d"] ? tonumber(flags.get(pointIndex)["d"]) ?? 0 : 0,
          time: now,
          played: false,
        });
      }
    } else {
      this.path = null;

      this.particles.set(1, {
        particle: new particles_object(this.state.name),
        sound: null,
        delay: 0,
        time: now,
        played: false,
      });
    }

    this.updatedAt = 0;
    this.isStarted = false;
    this.isFirstPlayed = false;
    this.state.signals = new LuaTable();
  }

  public override deactivate(): void {
    // Make sure order is maintained with range loop.
    for (const it of $range(1, this.particles.length())) {
      const descriptor: IParticleDescriptor = this.particles.get(it);

      if (descriptor.particle.playing()) {
        descriptor.particle.stop();
      }

      descriptor.particle = null as unknown as ParticlesObject;

      if (descriptor.sound?.playing()) {
        descriptor.sound.stop();
      }

      descriptor.sound = null;
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
      if (this.state.mode === EParticleBehaviour.FIRST) {
        this.updateMode1();
      } else {
        this.updateMode2();
      }

      this.isEnded();

      trySwitchToAnotherSection(this.object, this.state);
    } else {
      this.isStarted = true;

      if (this.state.mode === EParticleBehaviour.FIRST) {
        const descriptor: IParticleDescriptor = this.particles.get(1);

        descriptor.particle.load_path(this.state.path);
        descriptor.particle.start_path(this.state.looped);
        descriptor.particle.play();
        descriptor.played = true;

        this.isFirstPlayed = true;
      }

      return;
    }
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
      const descriptor: IParticleDescriptor = this.particles.get(it);

      if (now - descriptor.time > descriptor.delay && !descriptor.particle.playing()) {
        const pointIndex: TIndex = it - 1;

        if (!descriptor.played) {
          descriptor.particle.play_at_pos(this.path!.point(pointIndex));

          if (descriptor.sound) {
            descriptor.sound.play_at_pos(this.object, this.path!.point(pointIndex), 0);
          }

          descriptor.played = true;

          this.isFirstPlayed = true;
        } else if (this.state.looped) {
          descriptor.particle.play_at_pos(this.path!.point(pointIndex));

          if (descriptor.sound) {
            descriptor.sound.play_at_pos(this.object, this.path!.point(pointIndex), 0);
          }
        }
      }
    }
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
}
