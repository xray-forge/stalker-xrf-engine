import { describe, expect, it, jest } from "@jest/globals";
import { FS, getFS } from "xray16";

import { getAvailableExtensions } from "@/engine/core/utils/extensions/extensions_list";

jest.mock("extensions.a.main", () => ({ name: "custom name", register: () => {} }), { virtual: true });
jest.mock("extensions.b.main", () => ({}), { virtual: true });
jest.mock("extensions.c.main", () => ({ enabled: false, register: () => {} }), { virtual: true });

describe("extensions_list utils", () => {
  it("getAvailableExtensions should correctly return list of available extensions", () => {
    jest.spyOn(getFS(), "exist").mockImplementation(() => null);

    expect(getAvailableExtensions()).toEqualLuaTables({});
    expect(getFS().exist).toHaveBeenCalledWith("$game_data$", "extensions", FS.FS_ListFolders);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);
    jest.spyOn(lfs, "attributes").mockImplementation(() => new LuaTable());
    jest.spyOn(lfs, "dir").mockImplementation(() => {
      const items = ["a", "b", "c"];

      return $multi([] as unknown as LuaIterable<string, unknown>, {
        next: () => {
          return items.shift() ?? null;
        },
      });
    });

    expect(getAvailableExtensions()).toEqualLuaArrays([
      {
        entry: "$game_data$\\extensions\\a\\main.script",
        isEnabled: true,
        module: {
          name: "custom name",
          register: expect.any(Function),
        },
        name: "custom name",
        path: "$game_data$\\extensions\\a",
      },
      {
        entry: "$game_data$\\extensions\\c\\main.script",
        isEnabled: false,
        module: {
          enabled: false,
          register: expect.any(Function),
        },
        name: "c",
        path: "$game_data$\\extensions\\c",
      },
    ]);
  });
});
