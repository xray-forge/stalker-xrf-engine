import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { boxConfig } from "@/engine/core/managers/box/BoxConfig";
import { BoxManager } from "@/engine/core/managers/box/BoxManager";
import { resetRegistry } from "@/fixtures/engine";

describe("BoxManager.test.ts class", () => {
  beforeEach(() => {
    resetRegistry();

    boxConfig.ITEMS_BY_BOX_SECTION = new LuaTable();
    boxConfig.DROP_RATE_BY_LEVEL = new LuaTable();
    boxConfig.DROP_COUNT_BY_LEVEL = new LuaTable();
  });

  it("should correctly initialize", () => {
    expect(boxConfig.ITEMS_BY_BOX_SECTION.length()).toBe(0);
    expect(boxConfig.DROP_RATE_BY_LEVEL.length()).toBe(0);
    expect(boxConfig.DROP_COUNT_BY_LEVEL.length()).toBe(0);

    const manager: BoxManager = getManager(BoxManager);

    expect(boxConfig.ITEMS_BY_BOX_SECTION.length()).toBe(9);
    expect(boxConfig.DROP_RATE_BY_LEVEL.length()).toBe(0);
    expect(boxConfig.DROP_COUNT_BY_LEVEL.length()).toBe(0);
  });
});
