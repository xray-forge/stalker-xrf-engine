import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameClassId, TGameClassId } from "@/engine/lib/constants/class_ids";
import { EGameType } from "@/engine/lib/constants/game_types";
import type { Maybe } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @param gameType - type of the game
 * @returns mapped game class ID matching game type
 */
export function getUiClassId(gameType: EGameType): Maybe<TGameClassId> {
  switch (gameType) {
    case EGameType.SINGLE:
      return gameClassId.UI_SINGL;

    case EGameType.DEATH_MATCH:
      return gameClassId.UI_DM;

    case EGameType.TEAM_DEATH_MATCH:
      return gameClassId.UI_TDM;

    case EGameType.ARTEFACT_HUNT:
      return gameClassId.UI_AHUNT;

    case EGameType.CAPTURE_THE_ARTEFACT:
      return gameClassId.UI_CTA;

    default:
      abort("Unknown game type provided: '%s'", gameType);
  }
}
