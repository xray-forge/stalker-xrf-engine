import { get_hud, hit, level, sound_object, StaticDrawableWrapper, time_global } from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry } from "@/engine/core/database";
import { getWeakManagerInstance, isManagerInitialized } from "@/engine/core/database/managers";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { IPsyPostProcessDescriptor } from "@/engine/core/managers/psy/psy_antenna_types";
import { abort } from "@/engine/core/utils/assertion";
import { isGameLevelChanging } from "@/engine/core/utils/game";
import { LuaLogger } from "@/engine/core/utils/logging";
import { clampNumber } from "@/engine/core/utils/number";
import { createEmptyVector, createVector, vectorRotateY } from "@/engine/core/utils/vector";
import {
  ClientObject,
  ESoundObjectType,
  GameHud,
  Hit,
  NetPacket,
  NetProcessor,
  Optional,
  SoundObject,
  TCount,
  TDistance,
  TDuration,
  TProbability,
  TRate,
  TSoundObjectType,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "psy" });

/**
 * todo;
 */
export class PsyAntennaManager extends AbstractManager {
  /**
   * todo: Description.
   */
  public static load(reader: NetProcessor): void {
    openLoadMarker(reader, PsyAntennaManager.name + "_static");

    if (reader.r_bool()) {
      if (isManagerInitialized(PsyAntennaManager)) {
        abort("PsyAntennaManager already exists!");
      }

      PsyAntennaManager.getInstance().load(reader);
    }

    closeLoadMarker(reader, PsyAntennaManager.name + "_static");
  }

  /**
   * todo: Description.
   */
  public static save(packet: NetPacket): void {
    openSaveMarker(packet, PsyAntennaManager.name + "_static");

    const manager: Optional<PsyAntennaManager> = getWeakManagerInstance(PsyAntennaManager);

    if (manager && !isGameLevelChanging()) {
      packet.w_bool(true);

      manager.save(packet);
    } else {
      packet.w_bool(false);
    }

    closeSaveMarker(packet, PsyAntennaManager.name + "_static");
  }

  public readonly soundObjectRight: SoundObject = new sound_object("anomaly\\psy_voices_1_r");
  public readonly soundObjectLeft: SoundObject = new sound_object("anomaly\\psy_voices_1_l");

  public phantomMax: TCount = 8;
  public phantomSpawnProbability: TProbability = 0;
  public phantomSpawnRadius: TDistance = 30.0;
  public phantomSpawnHeight: number = 2.5;
  public phantomFov: number = 45;

  public hitAmplitude: number = 1.0;

  public hitTime: TDuration = 0;
  public phantomTime: TDuration = 0;
  public phantomIdle: TDuration = math.random(2000, 5000);

  public intensityInertion: TRate = 0.05;
  public hitIntensity: TRate = 0;
  public soundIntensity: TRate = 0;
  public soundIntensityBase: TRate = 0;

  public postprocessCount: TCount = 0;
  public postprocess: LuaTable<string, IPsyPostProcessDescriptor> = new LuaTable();

  public soundInitialized: boolean = false;

  public sndVolume: TRate = level.get_snd_volume();
  public muteSoundThreshold: number = 0;

  public noStatic: boolean = false;
  public noMumble: boolean = false;
  public hitType: string = "wound";
  public hitFreq: number = 5000;

  public constructor() {
    super();

    this.soundObjectLeft.volume = 0;
    this.soundObjectRight.volume = 0;
  }

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_GO_OFFLINE, this.dispose, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_GO_OFFLINE, this.dispose);

    this.soundObjectRight.stop();
    this.soundObjectLeft.stop();

    level.set_snd_volume(this.sndVolume);

    get_hud().enable_fake_indicators(false);
  }

  /**
   * Handle disposal of manager on actor destroy.
   */
  public dispose(): void {
    logger.info("Dispose psy antenna manager");
    PsyAntennaManager.dispose();
  }

  /**
   * todo: Description.
   */
  public generatePhantoms(): void {
    const now: TTimestamp = time_global();

    if (now - this.phantomTime > this.phantomIdle) {
      logger.info("Generate phantoms");

      this.phantomTime = now;
      this.phantomIdle = math.random(5000, 10000);

      if (math.random() < this.phantomSpawnProbability) {
        const actor: ClientObject = registry.actor;
        const phantomManager: PhantomManager = PhantomManager.getInstance();

        if (phantomManager.phantomsCount < this.phantomMax) {
          const radius: TDistance = this.phantomSpawnRadius * (math.random() * 0.5 + 0.5);
          const angle: TRate = this.phantomFov * math.random() - this.phantomFov * 0.5;
          const direction: Vector = vectorRotateY(actor.direction(), angle);

          phantomManager.spawnPhantom(actor.position().add(direction.mul(radius)));
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    logger.info("Updating psy antenna manager:", delta);

    const updateIntensity = (intensityBase: TRate, intensity: TRate) => {
      const di = this.intensityInertion * delta * 0.01;
      let ii = intensityBase;

      if (math.abs(intensityBase - intensity) >= di) {
        ii = intensityBase < intensity ? intensity - di : intensity + di;
      }

      return clampNumber(ii, 0.0, 1.0);
    };

    this.generatePhantoms();

    if (!this.noMumble) {
      this.soundIntensity = updateIntensity(this.soundIntensityBase, this.soundIntensity);
      this.updateSound();
    }

    for (const [k, v] of this.postprocess) {
      v.intensity = updateIntensity(v.intensityBase, v.intensity);

      if (!this.updatePostprocess(v)) {
        this.postprocess.delete(k);
      }
    }

    this.updatePsyHit(delta);
  }

  /**
   * todo: Description.
   */
  public updateSound(): void {
    if (!this.soundInitialized) {
      logger.info("Initialize sounds");

      this.soundInitialized = true;
      this.soundObjectLeft.play_at_pos(
        registry.actor,
        createVector(-1, 0, 1),
        0,
        (ESoundObjectType.S2D + ESoundObjectType.LOOPED) as TSoundObjectType
      );
      this.soundObjectRight.play_at_pos(
        registry.actor,
        createVector(1, 0, 1),
        0,
        (ESoundObjectType.S2D + ESoundObjectType.S3D) as TSoundObjectType
      );
    }

    const volume: TRate = 1 - Math.pow(this.soundIntensity, 3) * 0.9;
    const antennaVolume: TRate = 1 / volume - 1;

    level.set_snd_volume(volume < this.muteSoundThreshold ? this.muteSoundThreshold : volume);

    this.soundObjectLeft.volume = antennaVolume;
    this.soundObjectRight.volume = antennaVolume;
  }

  /**
   * todo: Description.
   */
  public updatePostprocess(pp: IPsyPostProcessDescriptor): boolean {
    if (pp.intensity === 0) {
      this.postprocessCount -= 1;
      level.remove_pp_effector(pp.idx);

      return false;
    } else {
      level.set_pp_effector_factor(pp.idx, pp.intensity, 0.3);

      return true;
    }
  }

  /**
   * todo: Description.
   */
  public updatePsyHit(delta: number): void {
    const hud: GameHud = get_hud();
    const customStatic: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("cs_psy_danger");

    if (this.hitIntensity > 0.0001) {
      if (customStatic === null && !this.noStatic) {
        hud.AddCustomStatic("cs_psy_danger", true);
        hud.GetCustomStatic("cs_psy_danger")!.wnd().TextControl().SetTextST("st_psy_danger");
      }
    } else {
      if (customStatic !== null) {
        hud.RemoveCustomStatic("cs_psy_danger");
      }
    }

    if (time_global() - this.hitTime > this.hitFreq) {
      this.hitTime = time_global();

      const power: number = this.hitAmplitude * this.hitIntensity;

      if (power > 0.0001) {
        const actor: ClientObject = registry.actor;
        const psyHit: Hit = new hit();

        psyHit.power = power;
        psyHit.direction = createEmptyVector();
        psyHit.impulse = 0;
        psyHit.draftsman = actor;

        const hitValue: TRate = (power <= 1 && power) || 1;

        if (this.hitType === "chemical") {
          get_hud().update_fake_indicators(2, hitValue);
          psyHit.type = hit.chemical_burn;
        } else {
          get_hud().update_fake_indicators(3, hitValue);
          psyHit.type = hit.telepatic;
        }

        actor.hit(psyHit);

        if (actor.health < 0.0001 && actor.alive()) {
          actor.kill(actor);
        }
      }
    }
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, PsyAntennaManager.name);

    packet.w_float(this.hitIntensity);
    packet.w_float(this.soundIntensity);
    packet.w_float(this.soundIntensityBase);
    packet.w_float(this.muteSoundThreshold);
    packet.w_bool(this.noStatic);
    packet.w_bool(this.noMumble);
    packet.w_stringZ(this.hitType);
    packet.w_u32(this.hitFreq);

    packet.w_u8(this.postprocessCount);

    for (const [k, v] of this.postprocess) {
      packet.w_stringZ(k);
      packet.w_float(v.intensity);
      packet.w_float(v.intensityBase);
      packet.w_u16(v.idx);
    }

    closeSaveMarker(packet, PsyAntennaManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, PsyAntennaManager.name);

    this.hitIntensity = reader.r_float();
    this.soundIntensity = reader.r_float();
    this.soundIntensityBase = reader.r_float();
    this.muteSoundThreshold = reader.r_float();
    this.noStatic = reader.r_bool();
    this.noMumble = reader.r_bool();
    this.hitType = reader.r_stringZ();
    this.hitFreq = reader.r_u32();

    this.postprocessCount = reader.r_u8();

    this.postprocess = new LuaTable();

    for (const it of $range(1, this.postprocessCount)) {
      const k: string = reader.r_stringZ();
      const ii: number = reader.r_float();
      const ib: number = reader.r_float();
      const idx: number = reader.r_u16();

      this.postprocess.set(k, { intensityBase: ib, intensity: ii, idx: idx });
      level.add_pp_effector(k, idx, true);
      level.set_pp_effector_factor(idx, ii);
    }

    closeLoadMarker(reader, PsyAntennaManager.name);
  }
}
