import { describe, expect, it, jest } from "@jest/globals";
import { getFS } from "xray16";
import { Nullable } from "xray16/lib";

import { getAvailableExtensions } from "@/engine/core/utils/extensions/extensions_list";

jest.mock("extensions.a.main", () => ({ name: "custom name", register: () => {} }), { virtual: true });
jest.mock("extensions.b.main", () => ({}), { virtual: true });
jest.mock("extensions.c.main", () => ({ enabled: false, register: () => {} }), { virtual: true });
jest.mock("extensions.d.main", () => ({ canToggle: false, register: () => {} }), { virtual: true });

describe("getAvailableExtensions util", () => {
  it("should correctly return list of available extensions", () => {
    jest.spyOn(getFS(), "exist");
    jest.spyOn(lfs, "attributes").mockImplementation(() => null);

    expect(getAvailableExtensions()).toEqualLuaTables({});

    jest.spyOn(lfs, "attributes").mockImplementation((path: string) => {
      const attributes: LuaTable<string, string> = new LuaTable();

      attributes.set("mode", path.endsWith("main.script") ? "file" : "directory");

      return attributes as unknown as Nullable<LuaTable>;
    });
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
        isAvailable: true,
        availabilityReason: null,
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
        isAvailable: true,
        availabilityReason: null,
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
        isAvailable: true,
        availabilityReason: null,
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
