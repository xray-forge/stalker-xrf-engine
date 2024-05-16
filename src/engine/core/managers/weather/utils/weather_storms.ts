import { level, particles_object, sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { IThunderDescriptor, WeatherManager } from "@/engine/core/managers/weather";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { hoursToWeatherPeriod } from "@/engine/core/utils/time";
import { createVector } from "@/engine/core/utils/vector";
import { ParticlesObject, SoundObject, TDistance, TDuration, TTimestamp, Vector } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * todo;
 *
 * @param manager
 */
export function updateDistantStorm(manager: WeatherManager): void {
  const timeMinutes: TTimestamp = level.get_time_minutes();

  // Check if distant storm should be turned on:
  // - Next weather should be cloudy section
  // - Next weather should be close (<30 minutes to next check)
  if (manager.isDistantStormOn === null && timeMinutes >= 30 && manager.nextWeatherSection === "cloudy") {
    if (math.random() <= weatherConfig.DISTANT_STORM_PROBABILITY) {
      manager.isDistantStormOn = true;
      manager.thunders = new LuaTable();
      manager.thunderIndex = 1;
    } else {
      manager.isDistantStormOn = false;
    }
  }

  // If distant storm is turned on, play it for 30 minutes before cloudy and 30 minutes after start.
  if (
    manager.isDistantStormOn &&
    ((manager.currentWeatherSection === "cloudy" && timeMinutes <= 30) ||
      (manager.nextWeatherSection === "cloudy" && timeMinutes >= 30)) &&
    !level.is_wfx_playing()
  ) {
    if (!manager.nextThunderAt) {
      manager.nextThunderAt = manager.lastUpdatedAtSecond + math.random(5, 10);
    }

    if (manager.nextThunderAt <= manager.lastUpdatedAtSecond) {
      generateDistantStormLightning(manager);
      manager.nextThunderAt = manager.lastUpdatedAtSecond + math.random(5, 10);
    }
  }

  // Reset distant storms after 30th minute of another weather section.
  if (manager.isDistantStormOn !== null && manager.nextWeatherSection !== "cloudy" && timeMinutes >= 30) {
    manager.isDistantStormOn = null;
    manager.nextThunderAt = null;
  }

  for (const [key, thunder] of manager.thunders) {
    const lifetime: TDuration = manager.lastUpdatedAtSecond - thunder.createdAt;

    if (lifetime >= 30) {
      if (thunder.sound && thunder.sound.playing()) {
        thunder.sound.stop();
      }

      manager.thunders.delete(key);
    }

    if (lifetime >= 4 && lifetime < 30 && !thunder.isHit) {
      if (thunder.sound.playing()) {
        thunder.sound.stop();
      }

      thunder.sound.play_at_pos(registry.actor, thunder.soundPosition);
      thunder.sound.volume = 0.5;

      thunder.isHit = true;
    }
  }
}

/**
 * todo;
 * todo;
 * todo;
 *
 * @param x
 * @param y
 */
export function isInsideBoundaries(x: TDistance, y: TDistance): boolean {
  let isInside: boolean = false;

  if (weatherConfig.DISTANT_STORM_BOUNDARIES[level.name()]) {
    const vert = weatherConfig.DISTANT_STORM_BOUNDARIES[level.name()];
    let j = vert.length();

    for (const i of $range(1, vert.length())) {
      if ((vert.get(i)[1] < y && vert.get(j)[1] >= y) || (vert.get(j)[1] < y && vert.get(i)[1] >= y)) {
        if (
          vert.get(i)[0] +
            ((y - vert.get(i)[1]) / (vert.get(j)[1] - vert.get(i)[1])) * (vert.get(j)[0] - vert.get(i)[0]) <
          x
        ) {
          isInside = !isInside;
        }
      }

      j = i;
    }
  }

  return isInside;
}

/**
 * todo;
 * todo;
 * todo;
 *
 * @param manager
 */
export function generateDistantStormLightning(manager: WeatherManager): void {
  const effect: ParticlesObject = new particles_object(weatherConfig.DISTANT_STORM_PARTICLE);
  const sound: SoundObject = new sound_object(
    weatherConfig.DISTANT_STORM_SOUNDS.get(math.random(1, weatherConfig.DISTANT_STORM_SOUNDS.length()))
  );

  const hours = (level.get_time_minutes() < 30 ? level.get_time_hours() : level.get_time_hours() + 1) % 24;
  const direction = weatherConfig.DISTANT_STORM_DIRECTIONS.get(hours + 1);

  const angle_dec = math.random(direction[0], direction[1]);
  const angle_rad = math.rad(angle_dec);
  const last_hour_str = hoursToWeatherPeriod(manager.lastUpdatedAtHour);
  const next_hour_str = hoursToWeatherPeriod((manager.lastUpdatedAtHour + 1) % 24);
  const last_dist = weatherConfig.FOG_DISTANCES.get(manager.currentWeatherSection as any).get(last_hour_str);
  const next_dist = weatherConfig.FOG_DISTANCES.get(manager.nextWeatherSection as any).get(next_hour_str);
  const m = level.get_time_minutes();
  const current_far_distance = math.ceil(((next_dist - last_dist) * m) / 60 + last_dist);

  const distance = current_far_distance - 50;
  const safe_distance = current_far_distance;
  const sound_distance = 100;
  const pos_x = math.sin(angle_rad) * distance;
  const pos_z = math.cos(angle_rad) * distance;
  const safe_pos_x = math.sin(angle_rad) * safe_distance;
  const safe_pos_z = math.cos(angle_rad) * safe_distance;
  const sound_pos_x = math.sin(angle_rad) * sound_distance;
  const sound_pos_z = math.cos(angle_rad) * sound_distance;
  const actorPosition: Vector = registry.actor.position();

  if (isInsideBoundaries(actorPosition.x + safe_pos_x, actorPosition.z + safe_pos_z)) {
    const thunder: IThunderDescriptor = {
      effect: effect,
      particlePosition: createVector(actorPosition.x + pos_x, actorPosition.y + 10, actorPosition.z + pos_z),
      sound: sound,
      soundPosition: createVector(actorPosition.x + sound_pos_x, actorPosition.y, actorPosition.z + sound_pos_z),
      createdAt: manager.lastUpdatedAtSecond,
      isHit: false,
    };

    manager.thunders.set(manager.thunderIndex, thunder);
    manager.thunderIndex += 1;

    thunder.effect.play_at_pos(manager.thunders.get(manager.thunderIndex).particlePosition);
  }
}
