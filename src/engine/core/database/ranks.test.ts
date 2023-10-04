import { beforeEach, describe, expect, it } from "@jest/globals";

import { IRankDescriptor } from "@/engine/core/database/database_types";
import { registerRanks } from "@/engine/core/database/ranks";
import { registry } from "@/engine/core/database/registry";

describe("ranks", () => {
  beforeEach(() => {
    registry.ranks.isInitialized = false;
    registry.ranks.monster = new LuaTable();
    registry.ranks.stalker = new LuaTable();
    registry.ranks.maxMonsterRank = null as unknown as IRankDescriptor;
    registry.ranks.maxStalkerRank = null as unknown as IRankDescriptor;
  });

  it("registerRanks should correctly initialize data", () => {
    expect(registry.ranks.isInitialized).toBe(false);

    registerRanks();

    expect(registry.ranks.isInitialized).toBe(true);
    expect(registry.ranks.stalker.length()).toBe(4);
    expect(registry.ranks.monster.length()).toBe(3);
    expect(registry.ranks.maxStalkerRank).toEqual({
      max: 65535,
      min: 900,
      name: "master",
    });
    expect(registry.ranks.maxMonsterRank).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
  });
});
