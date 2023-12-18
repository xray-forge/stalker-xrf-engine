import { level } from "xray16";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { levels } from "@/engine/lib/constants/levels";
import { TName } from "@/engine/lib/types";

/**
 * Play surge starting sound.
 * In original game some stalker from main location base does announcement.
 */
export function playSurgeStartingSound(): void {
  if (level === null) {
    return;
  }

  const soundManager: SoundManager = getManager(SoundManager);
  const levelName: TName = level.name();

  switch (levelName) {
    case levels.zaton:
      soundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_1");
      break;

    case levels.jupiter:
      soundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_phase_1");
      break;

    case levels.pripyat:
      // After game end no one is on radio.
      if (!hasInfoPortion(infoPortions.pri_b305_fifth_cam_end)) {
        soundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_surge_phase_1");
      }

      break;
  }
}

/**
 * Play surge will happen in a minute sound.
 * In original game some stalker from main location base does announcement.
 */
export function playSurgeWillHappenSoonSound(): void {
  if (level === null) {
    return;
  }

  const soundManager: SoundManager = getManager(SoundManager);
  const levelName: TName = level.name();

  switch (levelName) {
    case levels.zaton:
      soundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_2");
      break;

    case levels.jupiter:
      soundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_phase_2");
      break;

    case levels.pripyat:
      // After game end no one is on radio.
      if (!hasInfoPortion(infoPortions.pri_b305_fifth_cam_end)) {
        soundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_surge_phase_2");
      }

      break;
  }
}

/**
 * Play surge just ended.
 * In original game some stalker from main location base does announcement.
 */
export function playSurgeEndedSound(): void {
  if (level === null) {
    return;
  }

  const soundManager: SoundManager = getManager(SoundManager);
  const levelName: TName = level.name();

  switch (levelName) {
    case levels.zaton:
      soundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_after_surge");
      break;

    case levels.jupiter:
      soundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_after_surge");
      break;

    case levels.pripyat:
      // After game end no one is on radio.
      if (!hasInfoPortion(infoPortions.pri_b305_fifth_cam_end)) {
        soundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_after_surge");
      }

      break;
  }
}
