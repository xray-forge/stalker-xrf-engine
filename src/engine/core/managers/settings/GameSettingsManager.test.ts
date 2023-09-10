import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { GameSettingsManager } from "@/engine/core/managers/settings/GameSettingsManager";
import { EGameDifficulty, gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("GameSettingsManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly save and load data", () => {
    const gameSettingsManager: GameSettingsManager = getManagerInstance(GameSettingsManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    replaceFunctionMock(level.get_game_difficulty, () => EGameDifficulty.STALKER);

    gameSettingsManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U8, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([EGameDifficulty.STALKER, 1]);

    disposeManager(GameSettingsManager);

    const newActorInputManager: GameSettingsManager = getManagerInstance(GameSettingsManager);

    newActorInputManager.load(mockNetProcessor(netProcessor));

    expect(gameConsole.execute).toHaveBeenCalledWith("g_game_difficulty " + gameDifficulties.gd_stalker);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });
});
