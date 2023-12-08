import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManager } from "@/engine/core/database";
import { GameSettingsManager } from "@/engine/core/managers/settings/GameSettingsManager";
import { EGameDifficulty, gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { Console } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockConsole } from "@/fixtures/xray";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("GameSettingsManager class", () => {
  beforeEach(() => {
    resetRegistry();
    MockConsole.reset();
  });

  it("should correctly save and load data", () => {
    const console: Console = MockConsole.getInstanceMock();
    const gameSettingsManager: GameSettingsManager = getManager(GameSettingsManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    replaceFunctionMock(level.get_game_difficulty, () => EGameDifficulty.STALKER);

    gameSettingsManager.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U8, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([EGameDifficulty.STALKER, 1]);

    disposeManager(GameSettingsManager);

    const newActorInputManager: GameSettingsManager = getManager(GameSettingsManager);

    newActorInputManager.load(mockNetProcessor(netProcessor));

    expect(console.execute).toHaveBeenCalledWith("g_game_difficulty " + gameDifficulties.gd_stalker);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });
});
