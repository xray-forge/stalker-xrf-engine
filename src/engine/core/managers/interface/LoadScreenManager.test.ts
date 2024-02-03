import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { resetRegistry } from "@/fixtures/engine";

describe("LoadScreenManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly generate tips for single player", () => {
    const loadScreenManager: LoadScreenManager = getManager(LoadScreenManager);

    expect(typeof loadScreenManager.getRandomTipIndex("test")).toBe("number");
    expect(typeof loadScreenManager.getRandomTipIndex("test")).toBe("number");
    expect(loadScreenManager.getRandomTipIndex("test")).toBeGreaterThanOrEqual(0);
    expect(loadScreenManager.getRandomTipIndex("test")).toBeGreaterThanOrEqual(0);
  });

  it("should correctly generate tips for multiplayer", () => {
    const loadScreenManager: LoadScreenManager = getManager(LoadScreenManager);

    expect(typeof loadScreenManager.getRandomMultiplayerTipIndex("test")).toBe("number");
    expect(typeof loadScreenManager.getRandomMultiplayerTipIndex("test")).toBe("number");
    expect(loadScreenManager.getRandomMultiplayerTipIndex("test")).toBeGreaterThanOrEqual(0);
    expect(loadScreenManager.getRandomMultiplayerTipIndex("test")).toBeGreaterThanOrEqual(0);
  });
});
