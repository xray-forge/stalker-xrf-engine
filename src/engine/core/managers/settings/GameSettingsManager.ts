import { level } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { EGameDifficulty, gameDifficultiesByNumber } from "@/engine/lib/constants/game_difficulties";
import { NetPacket, NetProcessor } from "@/engine/lib/types";

/**
 * Manage game settings and options.
 */
export class GameSettingsManager extends AbstractManager {
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, GameSettingsManager.name);

    packet.w_u8(level.get_game_difficulty());

    closeSaveMarker(packet, GameSettingsManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, GameSettingsManager.name);

    executeConsoleCommand(
      consoleCommands.g_game_difficulty,
      gameDifficultiesByNumber[reader.r_u8() as EGameDifficulty]
    );

    closeLoadMarker(reader, GameSettingsManager.name);
  }
}
