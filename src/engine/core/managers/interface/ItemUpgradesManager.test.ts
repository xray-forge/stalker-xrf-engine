import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManagerInstance, registry } from "@/engine/core/database";
import { GameSettingsManager } from "@/engine/core/managers/settings/GameSettingsManager";
import { EGameDifficulty, gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";
import { EPacketDataType, mockNetPacket, mockNetProcessor, MockNetProcessor } from "@/fixtures/xray/mocks/save";

describe("ItemUpgradesManager class", () => {
  it.todo("should correctly initialize and destroy");

  it.todo("should correctly set hints");

  it.todo("should correctly get repair prices");

  it.todo("should correctly get repair payment");

  it.todo("should correctly get possibilities label");

  it.todo("should correctly check if item can be upgraded");

  it.todo("should correctly set price discounts");

  it.todo("should correctly check if able to repair item");

  it.todo("should correctly generate ask repair replics");

  it.todo("should correctly get pre-condition functor A");

  it.todo("should correctly get pre-requirement functor A");

  it.todo("should correctly handle effect A");

  it.todo("should correctly get property functor A");

  it.todo("should correctly get property functor B");

  it.todo("should correctly get property functor C");

  it.todo("should correctly issue properties");
});
