import {
  get_hud,
  hit,
  level,
  sound_object,
  time_global,
  TXR_net_processor,
  TXR_sound_object_type,
  vector,
  XR_CUIGameCustom,
  XR_game_object,
  XR_net_packet,
  XR_sound_object,
  XR_StaticDrawableWrapper,
} from "xray16";

import { registry } from "@/engine/core/database";
import { getWeakManagerInstance, isManagerInitialized } from "@/engine/core/database/managers";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { PhantomManager } from "@/engine/core/managers/PhantomManager";
import { abort } from "@/engine/core/utils/assertion";
import { isLevelChanging } from "@/engine/core/utils/check/check";
import { setLoadMarker, setSaveMarker } from "@/engine/core/utils/game_save";
import { clampNumber } from "@/engine/core/utils/number";
import { vectorRotateY } from "@/engine/core/utils/vector";
import { sounds } from "@/engine/lib/constants/sound/sounds";
import { Optional, TDuration } from "@/engine/lib/types";

export interface IPsyPostProcessDescriptor {
  intensity_base: number;
  intensity: number;
  idx: number;
}

/**
 * todo;
 */
export class PsyAntennaManager extends AbstractCoreManager {
  /**
   * todo: Description.
   */
  public static load(reader: TXR_net_processor): void {
    setLoadMarker(reader, false, PsyAntennaManager.name + "_static");

    if (reader.r_bool()) {
      if (isManagerInitialized(PsyAntennaManager)) {
        abort("PsyAntennaManager already exists!");
      }

      PsyAntennaManager.getInstance().load(reader);
    }

    setLoadMarker(reader, true, PsyAntennaManager.name + "_static");
  }

  /**
   * todo: Description.
   */
  public static save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, PsyAntennaManager.name + "_static");

    const manager: Optional<PsyAntennaManager> = getWeakManagerInstance(PsyAntennaManager);

    if (manager && !isLevelChanging()) {
      packet.w_bool(true);

      manager.save(packet);
    } else {
      packet.w_bool(false);
    }

    setSaveMarker(packet, true, PsyAntennaManager.name + "_static");
  }

  public readonly sound_obj_right: XR_sound_object = new sound_object(sounds.anomaly_psy_voices_1_r);
  public readonly sound_obj_left: XR_sound_object = new sound_object(sounds.anomaly_psy_voices_1_l);

  public phantom_max: number = 8;
  public phantom_spawn_probability: number = 0;
  public phantom_spawn_radius: number = 30.0;
  public phantom_spawn_height: number = 2.5;
  public phantom_fov: number = 45;

  public hit_amplitude: number = 1.0;
  public eff_time: number = 0;

  public hit_time: number = 0;
  public phantom_time: number = 0;
  public phantom_idle: number = 0;
  public intensity_inertion: number = 0.05;
  public hit_intensity: number = 0;
  public sound_intensity: number = 0;
  public sound_intensity_base: number = 0;

  public postprocess_count: number = 0;
  public postprocess: LuaTable<string, IPsyPostProcessDescriptor> = new LuaTable();

  public sound_initialized: boolean = false;

  public snd_volume: number = level.get_snd_volume();
  public mute_sound_threshold: number = 0;
  public max_mumble_volume: number = 10;

  public no_static: boolean = false;
  public no_mumble: boolean = false;
  public hit_type: string = "wound";
  public hit_freq: number = 5000;

  /**
   * todo: Description.
   */
  public constructor() {
    super();

    this.sound_obj_left.volume = 0;
    this.sound_obj_right.volume = 0;
  }

  /**
   * todo: Description.
   */
  public override destroy(): void {
    this.sound_obj_right.stop();
    this.sound_obj_left.stop();
    level.set_snd_volume(this.snd_volume);
    get_hud().enable_fake_indicators(false);
  }

  /**
   * todo: Description.
   */
  public update_psy_hit(dt: number): void {
    const hud: XR_CUIGameCustom = get_hud();
    const custom_static: Optional<XR_StaticDrawableWrapper> = hud.GetCustomStatic("cs_psy_danger");

    if (this.hit_intensity > 0.0001) {
      if (custom_static === null && !this.no_static) {
        hud.AddCustomStatic("cs_psy_danger", true);
        hud.GetCustomStatic("cs_psy_danger")!.wnd().TextControl().SetTextST("st_psy_danger");
      }
    } else {
      if (custom_static !== null) {
        hud.RemoveCustomStatic("cs_psy_danger");
      }
    }

    if (time_global() - this.hit_time > this.hit_freq) {
      this.hit_time = time_global();

      const power: number = this.hit_amplitude * this.hit_intensity;

      if (power > 0.0001) {
        const actor: XR_game_object = registry.actor;
        const psy_hit = new hit();

        psy_hit.power = power;
        psy_hit.direction = new vector().set(0, 0, 0);
        psy_hit.impulse = 0;
        psy_hit.draftsman = actor;

        const hit_value: number = (power <= 1 && power) || 1;

        if (this.hit_type === "chemical") {
          get_hud().update_fake_indicators(2, hit_value);
          psy_hit.type = hit.chemical_burn;
        } else {
          get_hud().update_fake_indicators(3, hit_value);
          psy_hit.type = hit.telepatic;
        }

        actor.hit(psy_hit);

        if (actor.health < 0.0001 && actor.alive()) {
          actor.kill(actor);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public generate_phantoms(): void {
    if (this.phantom_idle === null) {
      this.phantom_idle = math.random(2000, 5000);
    }

    if (time_global() - this.phantom_time > this.phantom_idle) {
      this.phantom_time = time_global();
      this.phantom_idle = math.random(5000, 10000);

      if (math.random() < this.phantom_spawn_probability) {
        const actor = registry.actor;
        const phantomManager: PhantomManager = PhantomManager.getInstance();

        if (phantomManager.phantom_count < this.phantom_max) {
          const radius = this.phantom_spawn_radius * (math.random() / 2.0 + 0.5);
          const angle = this.phantom_fov * math.random() - this.phantom_fov * 0.5;
          const dir = vectorRotateY(actor.direction(), angle);

          phantomManager.spawn_phantom(actor.position().add(dir.mul(radius)));
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public update_sound(): void {
    if (!this.sound_initialized) {
      this.sound_obj_left.play_at_pos(
        registry.actor,
        new vector().set(-1, 0, 1),
        0,
        (sound_object.s2d + sound_object.looped) as TXR_sound_object_type
      );
      this.sound_obj_right.play_at_pos(
        registry.actor,
        new vector().set(1, 0, 1),
        0,
        (sound_object.s2d + sound_object.looped) as TXR_sound_object_type
      );

      this.sound_initialized = true;
    }

    const vol = 1 - (this.sound_intensity ^ 3) * 0.9;

    if (vol < this.mute_sound_threshold) {
      level.set_snd_volume(this.mute_sound_threshold);
    } else {
      level.set_snd_volume(vol);
    }

    this.sound_obj_left.volume = 1 / vol - 1;
    this.sound_obj_right.volume = 1 / vol - 1;
  }

  /**
   * todo: Description.
   */
  public update_postprocess(pp: IPsyPostProcessDescriptor): boolean {
    if (pp.intensity === 0) {
      this.postprocess_count = this.postprocess_count - 1;
      level.remove_pp_effector(pp.idx);

      return false;
    }

    level.set_pp_effector_factor(pp.idx, pp.intensity, 0.3);

    return true;
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    this.eff_time = this.eff_time + delta;

    const update_intensity = (intensity_base: number, intensity: number) => {
      const di = this.intensity_inertion * delta * 0.01;
      let ii = intensity_base;

      if (math.abs(intensity_base - intensity) >= di) {
        ii = intensity_base < intensity ? intensity - di : intensity + di;
      }

      return clampNumber(ii, 0.0, 1.0);
    };

    this.generate_phantoms();

    if (!this.no_mumble) {
      this.sound_intensity = update_intensity(this.sound_intensity_base, this.sound_intensity);
      this.update_sound();
    }

    for (const [k, v] of this.postprocess) {
      v.intensity = update_intensity(v.intensity_base, v.intensity);

      if (!this.update_postprocess(v)) {
        this.postprocess.delete(k);
      }
    }

    this.update_psy_hit(delta);
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, PsyAntennaManager.name);

    packet.w_float(this.hit_intensity);
    packet.w_float(this.sound_intensity);
    packet.w_float(this.sound_intensity_base);
    packet.w_float(this.mute_sound_threshold);
    packet.w_bool(this.no_static);
    packet.w_bool(this.no_mumble);
    packet.w_stringZ(this.hit_type);
    packet.w_u32(this.hit_freq);

    packet.w_u8(this.postprocess_count);
    for (const [k, v] of this.postprocess) {
      packet.w_stringZ(k);
      packet.w_float(v.intensity);
      packet.w_float(v.intensity_base);
      packet.w_u16(v.idx);
    }

    setSaveMarker(packet, true, PsyAntennaManager.name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: TXR_net_processor): void {
    setLoadMarker(reader, false, PsyAntennaManager.name);

    this.hit_intensity = reader.r_float();
    this.sound_intensity = reader.r_float();
    this.sound_intensity_base = reader.r_float();
    this.mute_sound_threshold = reader.r_float();
    this.no_static = reader.r_bool();
    this.no_mumble = reader.r_bool();
    this.hit_type = reader.r_stringZ();
    this.hit_freq = reader.r_u32();

    this.postprocess_count = reader.r_u8();

    this.postprocess = new LuaTable();
    for (const it of $range(1, this.postprocess_count)) {
      const k: string = reader.r_stringZ();
      const ii: number = reader.r_float();
      const ib: number = reader.r_float();
      const idx: number = reader.r_u16();

      this.postprocess.set(k, { intensity_base: ib, intensity: ii, idx: idx });
      level.add_pp_effector(k, idx, true);
      level.set_pp_effector_factor(idx, ii);
    }

    setLoadMarker(reader, true, PsyAntennaManager.name);
  }
}
