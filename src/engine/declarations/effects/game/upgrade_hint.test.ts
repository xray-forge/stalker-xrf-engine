import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/upgrade_hint");
});

beforeEach(() => {
  resetRegistry();
});

describe("upgrade_hint", () => {
  it("should update mechanic hints", () => {
    const manager: UpgradesManager = getManager(UpgradesManager);

    jest.spyOn(manager, "setCurrentHints").mockImplementation(jest.fn());

    callXrEffect("upgrade_hint", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.setCurrentHints).toHaveBeenCalledTimes(1);
    expect(manager.setCurrentHints).toHaveBeenCalledWith([]);

    callXrEffect("upgrade_hint", MockGameObject.mockActor(), MockGameObject.mock(), "a", "b", "c");

    expect(manager.setCurrentHints).toHaveBeenCalledTimes(2);
    expect(manager.setCurrentHints).toHaveBeenCalledWith(["a", "b", "c"]);
  });
});
