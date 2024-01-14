import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { boxConfig } from "@/engine/core/managers/box";
import { initializeDropBoxesLootTables } from "@/engine/core/managers/box/utils/box_loot_utils";
import { resetRegistry } from "@/fixtures/engine";

describe("initializeDropBoxesLootTables util", () => {
  beforeEach(() => {
    resetRegistry();

    boxConfig.DROP_ITEMS_BY_SECTION = new LuaTable();
    boxConfig.DROP_RATE_BY_LEVEL = new LuaTable();
    boxConfig.DROP_COUNT_BY_LEVEL = new LuaTable();
  });

  it("should correctly read ini data based on level/difficulty", () => {
    jest.spyOn(level, "name").mockImplementationOnce(() => "zaton");
    jest.spyOn(level, "get_game_difficulty").mockImplementationOnce(() => 3);

    initializeDropBoxesLootTables();

    expect(boxConfig.DROP_ITEMS_BY_SECTION).toEqualLuaTables({
      big_box_arsenal: {},
      big_box_dungeons: {},
      big_box_generic: {},
      def_box: {
        ammo_9x18_fmj: 100,
        ammo_9x18_pmm: 100,
        ammo_9x19_pbp: 100,
      },
      small_box_army: {},
      small_box_generic: {},
      small_box_nato: {},
      small_box_science: {},
      small_box_ussr: {},
    });
    expect(boxConfig.DROP_COUNT_BY_LEVEL).toEqualLuaTables({
      ammo_9x18_fmj: {
        max: 8,
        min: 6,
      },
      ammo_9x18_pmm: {
        max: 9,
        min: 6,
      },
      ammo_9x19_pbp: {
        max: 8,
        min: 4,
      },
    });
    expect(boxConfig.DROP_RATE_BY_LEVEL).toEqualLuaTables({
      ammo_9x18_fmj: 2,
      ammo_9x18_pmm: 3,
      ammo_9x19_pbp: 4,
      wpn_pm: 1,
    });

    jest.spyOn(level, "name").mockImplementationOnce(() => "jupiter");
    jest.spyOn(level, "get_game_difficulty").mockImplementationOnce(() => 0);

    initializeDropBoxesLootTables();

    expect(boxConfig.DROP_ITEMS_BY_SECTION).toEqualLuaTables({
      big_box_arsenal: {},
      big_box_dungeons: {},
      big_box_generic: {},
      def_box: {
        ammo_9x18_fmj: 100,
        ammo_9x18_pmm: 100,
        ammo_9x19_pbp: 100,
      },
      small_box_army: {},
      small_box_generic: {},
      small_box_nato: {},
      small_box_science: {},
      small_box_ussr: {},
    });
    expect(boxConfig.DROP_COUNT_BY_LEVEL).toEqualLuaTables({
      ammo_9x18_fmj: {
        max: 0,
        min: 0,
      },
      ammo_9x18_pmm: {
        max: 9,
        min: 6,
      },
      ammo_9x19_pbp: {
        max: 8,
        min: 4,
      },
    });
    expect(boxConfig.DROP_RATE_BY_LEVEL).toEqualLuaTables({
      ammo_9x18_fmj: 0,
      ammo_9x18_pmm: 1,
      ammo_9x19_pbp: 1,
      wpn_pm: 1,
    });
  });
});
