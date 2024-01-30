import { describe, expect, it, jest } from "@jest/globals";
import { FS, getFS } from "xray16";

import { getAvailableExtensions } from "@/engine/core/utils/extensions/extensions_list";

jest.mock("extensions.a.main", () => ({ name: "custom name", register: () => {} }), { virtual: true });
jest.mock("extensions.b.main", () => ({}), { virtual: true });
jest.mock("extensions.c.main", () => ({ enabled: false, register: () => {} }), { virtual: true });
jest.mock("extensions.d.main", () => ({ canToggle: false, register: () => {} }), { virtual: true });

describe("getAvailableExtensions util", () => {
  it("should correctly return list of available extensions", () => {
    jest.spyOn(getFS(), "exist").mockImplementation(() => null);

    expect(getAvailableExtensions()).toEqualLuaTables({});
    expect(getFS().exist).toHaveBeenCalledWith("$game_data$", "extensions", FS.FS_ListFolders);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);
    jest.spyOn(lfs, "attributes").mockImplementation(() => new LuaTable());
    jest.spyOn(lfs, "dir").mockImplementation(() => {
      const items = ["a", "b", "c", "d"];

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
        canToggle: true,
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
        canToggle: true,
        module: {
          enabled: false,
          register: expect.any(Function),
        },
        name: "c",
        path: "$game_data$\\extensions\\c",
      },
      {
        entry: "$game_data$\\extensions\\d\\main.script",
        isEnabled: true,
        canToggle: false,
        module: {
          canToggle: false,
          register: expect.any(Function),
        },
        name: "d",
        path: "$game_data$\\extensions\\d",
      },
    ]);
  });
});
