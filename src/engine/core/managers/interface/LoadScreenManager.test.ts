import { beforeEach, describe, expect, it } from "@jest/globals";

import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";
import { resetRegistry } from "@/fixtures/engine";

describe("LoadScreenManager class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly generate tips", () => {
    const loadScreenManager: LoadScreenManager = LoadScreenManager.getInstance();

    expect(typeof loadScreenManager.getRandomTipIndex("test")).toBe("number");
    expect(typeof loadScreenManager.getRandomTipIndex("test")).toBe("number");
    expect(loadScreenManager.getRandomTipIndex("test")).toBeGreaterThanOrEqual(0);
    expect(loadScreenManager.getRandomTipIndex("test")).toBeGreaterThanOrEqual(0);

    expect(typeof loadScreenManager.getRandomMultiplayerTipIndex("test")).toBe("number");
    expect(typeof loadScreenManager.getRandomMultiplayerTipIndex("test")).toBe("number");
    expect(loadScreenManager.getRandomMultiplayerTipIndex("test")).toBeGreaterThanOrEqual(0);
    expect(loadScreenManager.getRandomMultiplayerTipIndex("test")).toBeGreaterThanOrEqual(0);
  });
});
