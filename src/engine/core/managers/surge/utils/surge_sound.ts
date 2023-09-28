import { level } from "xray16";

import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import { hasAlifeInfo } from "@/engine/core/utils/object";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { levels } from "@/engine/lib/constants/levels";
import { TName } from "@/engine/lib/types";

/**
 * todo;
 */
export function playSurgeStartingSound(): void {
  if (level === null) {
    return;
  }

  const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();
  const levelName: TName = level.name();

  switch (levelName) {
    case levels.zaton:
      globalSoundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_1");
      break;

    case levels.jupiter:
      globalSoundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_phase_1");
      break;

    case levels.pripyat:
      // After game end no one is on radio.
      if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
        globalSoundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_surge_phase_1");
      }

      break;
  }
}

/**
 * todo;
 */
export function playSurgeWillHappenSoonSound(): void {
  if (level === null) {
    return;
  }

  const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();
  const levelName: TName = level.name();

  switch (levelName) {
    case levels.zaton:
      globalSoundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_2");
      break;

    case levels.jupiter:
      globalSoundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_phase_2");
      break;

    case levels.pripyat:
      // After game end no one is on radio.
      if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
        globalSoundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_surge_phase_2");
      }

      break;
  }
}

/**
 * todo;
 */
export function playSurgeEndedSound(): void {
  if (level === null) {
    return;
  }

  const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();
  const levelName: TName = level.name();

  switch (levelName) {
    case levels.zaton:
      globalSoundManager.playSound(ACTOR_ID, "zat_a2_stalker_barmen_after_surge");
      break;

    case levels.jupiter:
      globalSoundManager.playSound(ACTOR_ID, "jup_a6_stalker_medik_after_surge");
      break;

    case levels.pripyat:
      // After game end no one is on radio.
      if (!hasAlifeInfo(infoPortions.pri_b305_fifth_cam_end)) {
        globalSoundManager.playSound(ACTOR_ID, "pri_a17_kovalsky_after_surge");
      }

      break;
  }
}
