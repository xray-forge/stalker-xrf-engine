import { level, TXR_net_processor, XR_net_packet } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers";
import { executeConsoleCommand } from "@/engine/core/utils/console";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { EGameDifficulty, gameDifficultiesByNumber } from "@/engine/lib/constants/game_difficulties";

/**
 * Manage game settings and options.
 */
export class GameSettingsManager extends AbstractCoreManager {
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, GameSettingsManager.name);

    packet.w_u8(level.get_game_difficulty());

    closeSaveMarker(packet, GameSettingsManager.name);
  }

  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, GameSettingsManager.name);

    executeConsoleCommand(
      consoleCommands.g_game_difficulty,
      gameDifficultiesByNumber[reader.r_u8() as EGameDifficulty]
    );

    closeLoadMarker(reader, GameSettingsManager.name);
  }
}
