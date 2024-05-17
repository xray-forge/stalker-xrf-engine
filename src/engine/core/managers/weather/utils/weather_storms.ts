import { level, particles_object, sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { IThunderDescriptor, WeatherManager } from "@/engine/core/managers/weather";
import { weatherConfig } from "@/engine/core/managers/weather/WeatherConfig";
import { hoursToWeatherPeriod } from "@/engine/core/utils/time";
import { createVector } from "@/engine/core/utils/vector";
import {
  LuaArray,
  TCoordinate,
  TDistance,
  TDuration,
  TIndex,
  TRate,
  TSection,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

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
export function isInsideBoundaries(x: TCoordinate, y: TCoordinate): boolean {
  let isInside: boolean = false;

  if (weatherConfig.DISTANT_STORM_BOUNDARIES[level.name()]) {
    const boundaries: LuaArray<[number, number]> = weatherConfig.DISTANT_STORM_BOUNDARIES[level.name()];
    let j: TIndex = boundaries.length();

    for (const i of $range(1, boundaries.length())) {
      if (
        (boundaries.get(i)[1] < y && boundaries.get(j)[1] >= y) ||
        (boundaries.get(j)[1] < y && boundaries.get(i)[1] >= y)
      ) {
        if (
          boundaries.get(i)[0] +
            ((y - boundaries.get(i)[1]) / (boundaries.get(j)[1] - boundaries.get(i)[1])) *
              (boundaries.get(j)[0] - boundaries.get(i)[0]) <
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
  const hours: TTimestamp = (level.get_time_minutes() < 30 ? level.get_time_hours() : level.get_time_hours() + 1) % 24;
  const [directionMin, directionMax] = weatherConfig.DISTANT_STORM_DIRECTIONS.get(hours + 1);

  const lastHourCycle: TSection = hoursToWeatherPeriod(manager.lastUpdatedAtHour);
  const nextHourCycle: TSection = hoursToWeatherPeriod((manager.lastUpdatedAtHour + 1) % 24);

  const lastDistance: TDistance = weatherConfig.FOG_DISTANCES.get(manager.currentWeatherSection as TSection).get(
    lastHourCycle
  );
  const nextDistance: TDistance = weatherConfig.FOG_DISTANCES.get(manager.nextWeatherSection as TSection).get(
    nextHourCycle
  );
  const safeDistance: TDistance = math.ceil(
    ((nextDistance - lastDistance) * level.get_time_minutes()) / 60 + lastDistance
  );

  const actorPosition: Vector = registry.actor.position();
  const angleDec: TRate = math.random(directionMin, directionMax);
  const angleRad: TRate = math.rad(angleDec);

  if (
    isInsideBoundaries(
      actorPosition.x + math.sin(angleRad) * safeDistance,
      actorPosition.z + math.cos(angleRad) * safeDistance
    )
  ) {
    const distance: TDistance = safeDistance - 50;
    const soundDistance: TDistance = 100;

    const thunder: IThunderDescriptor = {
      effect: new particles_object(weatherConfig.DISTANT_STORM_PARTICLE),
      particlePosition: createVector(
        actorPosition.x + math.sin(angleRad) * distance,
        actorPosition.y + 10,
        actorPosition.z + math.cos(angleRad) * distance
      ),
      sound: new sound_object(
        weatherConfig.DISTANT_STORM_SOUNDS.get(math.random(1, weatherConfig.DISTANT_STORM_SOUNDS.length()))
      ),
      soundPosition: createVector(
        actorPosition.x + math.sin(angleRad) * soundDistance,
        actorPosition.y,
        actorPosition.z + math.cos(angleRad) * soundDistance
      ),
      createdAt: manager.lastUpdatedAtSecond,
      isHit: false,
    };

    manager.thunders.set(manager.thunderIndex, thunder);
    manager.thunderIndex += 1;

    thunder.effect.play_at_pos(manager.thunders.get(manager.thunderIndex).particlePosition);
  }
}
