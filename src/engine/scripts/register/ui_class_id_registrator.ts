import { abort } from "@/engine/core/utils/assertion";
import { gameClassId, TGameClassId } from "@/engine/lib/constants/class_ids";
import { EGameType } from "@/engine/lib/constants/game_types";
import { Nillable } from "@/engine/lib/types";

/**
 * @param gameType - Type of the game.
 * @returns Mapped game class ID matching game type.
 */
export function getUiClassId(gameType: EGameType): Nillable<TGameClassId> {
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
