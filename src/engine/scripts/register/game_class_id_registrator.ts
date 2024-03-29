import { abort, assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameClassId, TGameClassId } from "@/engine/lib/constants/class_ids";
import { EGameType } from "@/engine/lib/constants/game_types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @param gameType - current game type
 * @param isServer - whether it is single game or server
 * @returns currently active game mode class id
 */
export function getGameClassId(gameType: EGameType, isServer: boolean): TGameClassId {
  assert(type(isServer) === "boolean", "Expected boolean value for game class getter as parameter.");

  logger.info("Return game class id: %s %s", gameType, isServer);

  switch (gameType) {
    case EGameType.SINGLE:
      return isServer ? gameClassId.SV_SINGL : gameClassId.CL_SINGL;

    case EGameType.DEATH_MATCH:
      return isServer ? gameClassId.SV_DM : gameClassId.CL_DM;

    case EGameType.TEAM_DEATH_MATCH:
      return isServer ? gameClassId.SV_TDM : gameClassId.CL_TDM;

    case EGameType.ARTEFACT_HUNT:
      return isServer ? gameClassId.SV_AHUNT : gameClassId.CL_AHUNT;

    case EGameType.CAPTURE_THE_ARTEFACT:
      return isServer ? gameClassId.SV_CTA : gameClassId.CL_CTA;

    default:
      abort("Unknown game type provided: '%s'.", gameType);
  }
}
