import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { LoadScreenManager } from "@/engine/core/managers/interface/LoadScreenManager";

describe("LoadScreenManager class", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
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
