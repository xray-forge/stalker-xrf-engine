import { get_hud, level, sound_object, XR_net_packet } from "xray16";

import { sounds } from "@/mod/globals/sound/sounds";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";

export interface IPsyPostProcessDescriptor {
  intensity_base: number;
  intensity: number;
  idx: number;
}

export class PsyAntenna {
  public sound_obj_right = new sound_object(sounds.anomaly_psy_voices_1_r);
  public sound_obj_left = new sound_object(sounds.anomaly_psy_voices_1_l);

  public phantom_max = 8;
  public phantom_spawn_probability = 0;
  public phantom_spawn_radius = 30.0;
  public phantom_spawn_height = 2.5;
  public phantom_fov = 45;

  public hit_amplitude = 1.0;
  public eff_time = 0;

  public hit_time = 0;
  public phantom_time = 0;
  public intensity_inertion = 0.05;
  public hit_intensity = 0;
  public sound_intensity = 0;
  public sound_intensity_base = 0;

  public postprocess_count = 0;
  public postprocess: LuaTable<number, IPsyPostProcessDescriptor> = new LuaTable();

  public sound_initialized = false;

  public snd_volume = level.get_snd_volume();
  public mute_sound_threshold = 0;
  public max_mumble_volume = 10;

  public no_static = false;
  public no_mumble = false;
  public hit_type = "wound";
  public hit_freq = 5000;

  public constructor() {
    this.sound_obj_left.volume = 0;
    this.sound_obj_right.volume = 0;
  }

  public destroy(): void {
    this.sound_obj_right.stop();
    this.sound_obj_left.stop();
    level.set_snd_volume(this.snd_volume);
    get_hud().enable_fake_indicators(false);
  }

  public update_psy_hit(dt: number): void {
    /**
     *   const hud = get_hud()
     *   const custom_static = hud:GetCustomStatic("cs_psy_danger")
     *   if (this.hit_intensity > 0.0001) {
     *     if custom_static == nil and !this.no_static {
     *       hud:AddCustomStatic("cs_psy_danger", true)
     *       hud:GetCustomStatic("cs_psy_danger"):wnd():TextControl():SetTextST("st_psy_danger")
     *     }
     *   } else {
     *     if custom_static ~= nil {
     *       hud:RemoveCustomStatic("cs_psy_danger")
     *     }
     *   }
     *
     *   if time_global() - this.hit_time > this.hit_freq {
     *     this.hit_time = time_global()
     *
     *     const power = this.hit_amplitude * this.hit_intensity
     *
     *     --printf("HIT: power = %s", tostring(power))
     *
     *     if power > 0.0001 {
     *
     *       const psy_hit = hit()
     *       psy_hit.power = power
     *       psy_hit.direction = vector():set(0, 0, 0)
     *       psy_hit.impulse = 0
     *       psy_hit.draftsman = db.actor
     *       const hit_value = ((power <= 1) and power) or 1
     *       if this.hit_type == "chemical" {
     *         get_hud():update_fake_indicators(2, hit_value)
     *         psy_hit.type = hit.chemical_burn
     *       } else {
     *         get_hud():update_fake_indicators(3, hit_value)
     *         psy_hit.type = hit.telepatic
     *       }
     *
     *       db.actor:hit(psy_hit)
     *
     *       if db.actor.health < 0.0001 and db.actor:alive() {
     *         db.actor:kill(db.actor)
     *       }
     *     }
     *   }
     */
  }

  public generate_phantoms(): void {
    /**
     *   if this.phantom_idle == nil {
     *     this.phantom_idle = math.random(2000, 5000)
     *   }
     *   if time_global() - this.phantom_time > this.phantom_idle {
     *     this.phantom_time = time_global()
     *     this.phantom_idle = math.random(5000, 10000)
     *     if math.random() < this.phantom_spawn_probability {
     *       if PhantomManager:getInstance().phantom_count < this.phantom_max {
     *         const radius = this.phantom_spawn_radius * (math.random() / 2.0 + 0.5)
     *         const ang = this.phantom_fov * math.random() - this.phantom_fov * 0.5
     *         const dir = vector_rotate_y(db.actor:direction(), ang)
     *
     *         PhantomManager:getInstance():spawn_phantom(db.actor:position():add(dir:mul(radius)))
     *       }
     *     }
     *   }
     */
  }

  public update_sound(): void {
    /**
     *   if !this.sound_initialized {
     *     this.sound_obj_left:play_at_pos(db.actor, vector():set(-1, 0, 1), 0, sound_object.s2d + sound_object.looped)
     *     this.sound_obj_right:play_at_pos(db.actor, vector():set(1, 0, 1), 0, sound_object.s2d + sound_object.looped)
     *
     *     this.sound_initialized = true
     *   }
     *
     *   const vol = 1 - (this.sound_intensity ^ 3) * 0.9
     *
     *   if vol < this.mute_sound_threshold {
     *     level.set_snd_volume(this.mute_sound_threshold)
     *   } else {
     *     level.set_snd_volume(vol)
     *   }
     *
     *   this.sound_obj_left.volume = 1 / vol - 1
     *   this.sound_obj_right.volume = 1 / vol - 1
     */
  }

  public update_postprocess(pp): boolean {
    /**
     *   if pp.intensity == 0 {
     *     this.postprocess_count = this.postprocess_count - 1
     *     level.remove_pp_effector(pp.idx)
     *     return false
     *   }
     *
     *   level.set_pp_effector_factor(pp.idx, pp.intensity, 0.3)
     *   return true
     */
  }

  public update(dt: number): void {
    /**
     *   this.eff_time = this.eff_time + dt
     *
     *   function update_intensity(intensity_base, intensity)
     *     const di = this.intensity_inertion * dt * 0.01
     *     const ii = intensity_base
     *     if math.abs(intensity_base - intensity) >= di {
     *       if intensity_base < intensity {
     *         ii = intensity - di
     *       } else {
     *         ii = intensity + di
     *       }
     *     }
     *
     *     if ii < 0.0 {
     *       ii = 0.0
     *     elseif ii > 1.0 {
     *       ii = 1.0
     *     }
     *     return ii
     *   }
     *
     *   this:generate_phantoms()
     *
     *   if !this.no_mumble {
     *     this.sound_intensity = update_intensity(this.sound_intensity_base, this.sound_intensity)
     *     this:update_sound()
     *   }
     *
     *   for k, v in pairs(this.postprocess) do
     *     v.intensity = update_intensity(v.intensity_base, v.intensity)
     *     const exist = this:update_postprocess(v)
     *
     *     if exist == false {
     *       this.postprocess[k] = nil
     *     }
     *   }
     *
     *   this:update_psy_hit(dt)
     */
  }

  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, PsyAntenna.name);

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

    setSaveMarker(packet, true, PsyAntenna.name);
  }

  public load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, PsyAntenna.name);
    this.hit_intensity = packet.r_float();
    this.sound_intensity = packet.r_float();
    this.sound_intensity_base = packet.r_float();
    this.mute_sound_threshold = packet.r_float();
    this.no_static = packet.r_bool();
    this.no_mumble = packet.r_bool();
    this.hit_type = packet.r_stringZ();
    this.hit_freq = packet.r_u32();

    this.postprocess_count = packet.r_u8();

    this.postprocess = new LuaTable();
    for (const i of $range(1, this.postprocess_count)) {
      const k = packet.r_stringZ();
      const ii = packet.r_float();
      const ib = packet.r_float();
      const idx = packet.r_u16();

      this.postprocess.set(k, { intensity_base: ib, intensity: ii, idx: idx });
      level.add_pp_effector(k, idx, true);
      level.set_pp_effector_factor(idx, ii);
    }

    setLoadMarker(packet, true, PsyAntenna.name);
  }
}
