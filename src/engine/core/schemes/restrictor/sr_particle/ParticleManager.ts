import { particles_object, patrol, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import {
  EParticleBehaviour,
  IParticleDescriptor,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { IWaypointData, parseWaypointsData } from "@/engine/core/utils/ini";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { LuaArray, Optional, ParticlesObject, Patrol, TCount, TName, TTimestamp, Vector } from "@/engine/lib/types";

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

    if (this.state.mode === EParticleBehaviour.COMPLEX) {
      const path: Patrol = new patrol(this.state.path);
      const flags: LuaArray<IWaypointData> = parseWaypointsData(this.state.path)!;

      this.path = path;

      // Make sure order is maintained with range loop.
      for (const it of $range(1, path.count())) {
        const waypointData: IWaypointData = flags.get(it - 1);
        const soundName: Optional<TName> = waypointData.s as Optional<TName>;
        const delay: TCount = waypointData["d"] ? tonumber(waypointData["d"]) ?? 0 : 0;

        /**
         *     local sound_name = nil
         *            if flags[a - 1]["s"] ~= nil then
         *               sound_name = flags[a - 1]["s"]
         *            end
         *            local snd_obj = nil
         *            if sound_name ~= nil and sound_name ~= "" then
         *               snd_obj = xr_sound.get_sound_object(sound_name, "random")
         *            end
         */

        this.particles.set(it, {
          particle: new particles_object(this.state.name),
          sound: null,
          delay,
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
      if (this.state.mode === EParticleBehaviour.SIMPLE) {
        this.updateSimple();
      } else {
        this.updateComplex();
      }

      this.isEnded();

      trySwitchToAnotherSection(this.object, this.state);
    } else {
      this.isStarted = true;

      if (this.state.mode === EParticleBehaviour.SIMPLE) {
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
  public updateSimple(): void {
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
  public updateComplex(): void {
    const now: TTimestamp = time_global();

    // Make sure order is maintained with range loop.
    for (const it of $range(1, this.particles.length())) {
      const descriptor: IParticleDescriptor = this.particles.get(it);

      if (now - descriptor.time > descriptor.delay && !descriptor.particle.playing()) {
        const position: Vector = this.path!.point(it - 1);

        if (!descriptor.played) {
          descriptor.particle.play_at_pos(position);

          if (descriptor.sound) {
            descriptor.sound.play_at_pos(this.object, position, 0);
          }

          descriptor.played = true;

          this.isFirstPlayed = true;
        } else if (this.state.looped) {
          descriptor.particle.play_at_pos(position);

          if (descriptor.sound) {
            descriptor.sound.play_at_pos(this.object, position, 0);
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
    if (this.state.looped || !this.isFirstPlayed) {
      return false;
    }

    const count: TCount = this.particles.length();

    if (count === 0) {
      return true;
    }

    // Make sure order is maintained with range loop.
    for (const it of $range(1, count)) {
      if (this.particles.get(it).particle.playing()) {
        return false;
      }
    }

    this.state.signals!.set("particle_end", true);

    return true;
  }
}

/*
 * todo: implement
 *
 *
-- modified by Alundaio (original: ????)
--' ������� ��� �������� ��������� ����� ��������.
--' type = [random|seq|looped]
local ltx = ini_file("plugins\\radio_music.ltx")
function get_sound_object(theme, t_type)
	if not (ph_snd_themes) then
		ph_snd_themes = {}
		ph_snd_themes[theme] = alun_utils.collect_section(ltx,theme)
		--printf("collect theme=%s",theme)
	end

	if (not ph_snd_themes or not ph_snd_themes[theme]) then
		--printf("no ph_snd_themes theme=%s",theme)
		return
	end

	if not (sound_object_by_theme) then
		sound_object_by_theme = {}
	end

	if (not sound_object_by_theme[theme])then
		sound_object_by_theme[theme] = {}
	end

	if t_type == nil then
		t_type = "random"
	end

	--' ����� ���������� ���������
	local play_id = -1

	local table_size = #ph_snd_themes[theme]

	if (table_size == 0) then
		return
	end

	--printf("tablesize = %s theme=%s",table_size,theme)
	if sound_object_by_theme[theme].last_id == nil then
		if t_type == "random" then
			if table_size >= 2 then
				play_id = math.random(1, table_size)
			else
				play_id = 1
			end
		else
			play_id = 1
		end
	else
		if t_type == "random" then
			if table_size >= 2 then
				play_id = math.random(1, table_size - 1)
				if play_id >= sound_object_by_theme[theme].last_id then play_id = play_id + 1 end
			else
				play_id = 1
			end
		else
			if sound_object_by_theme[theme].last_id < table_size then
				play_id = sound_object_by_theme[theme].last_id + 1
			else
				if type == "looped" then
					play_id = 1
				end
			end
		end
	end

	if play_id == -1 then
		return
	end

	--' ��������� ������ �� � ��� ��������������� ����� ������ ��� ��� ���� �������
	if sound_object_by_theme[theme][play_id] == nil then
		if type(ph_snd_themes[theme][play_id]) == "table" then
			sound_object_by_theme[theme][play_id.."_r"] = get_safe_sound_object(ph_snd_themes[theme][play_id][1].."_r")
			sound_object_by_theme[theme][play_id.."_l"] = get_safe_sound_object(ph_snd_themes[theme][play_id][1].."_l")
		else
			sound_object_by_theme[theme][play_id] = get_safe_sound_object(ph_snd_themes[theme][play_id])
		end
	end

	sound_object_by_theme[theme].last_id = play_id

	--' ���������� ����� ������
	if type(ph_snd_themes[theme][play_id]) == "table" then
		return sound_object_by_theme[theme][play_id.."_r"], sound_object_by_theme[theme][play_id.."_l"]
	else
		return sound_object_by_theme[theme][play_id]
	end
end

 */
