import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManager } from "@/engine/core/database";
import { GameSettingsManager } from "@/engine/core/managers/settings/GameSettingsManager";
import { EGameDifficulty, gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { Console } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockConsole } from "@/fixtures/xray";
import { EPacketDataType, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("GameSettingsManager", () => {
  beforeEach(() => {
    resetRegistry();
    MockConsole.reset();
  });

  it("should correctly save and load data", () => {
    const console: Console = MockConsole.getInstanceMock();
    const gameSettingsManager: GameSettingsManager = getManager(GameSettingsManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    replaceFunctionMock(level.get_game_difficulty, () => EGameDifficulty.STALKER);

    gameSettingsManager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([EPacketDataType.U8, EPacketDataType.U16]);
    expect(processor.dataList).toEqual([EGameDifficulty.STALKER, 1]);

    disposeManager(GameSettingsManager);

    const newActorInputManager: GameSettingsManager = getManager(GameSettingsManager);

    newActorInputManager.load(processor.asNetReader());

    expect(console.execute).toHaveBeenCalledWith("g_game_difficulty " + gameDifficulties.gd_stalker);
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });
});
