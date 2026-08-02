import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { FS } from "xray16";
import { FSFileList } from "xray16/alias";
import { LuaArray, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockFileSystem, MockFileSystemList } from "xray16/mocks";

import { roots } from "@/engine/constants/roots";
import {
  declarationPathToModuleId,
  discoverDeclarationModules,
  isDeclarationPayload,
  loadDeclarationModules,
} from "@/engine/scripts/register/declaration_modules";

function mockNativeFileList(paths: Array<string>, onFree: () => void = (): void => {}): MockFileSystemList {
  const list: MockFileSystemList = new MockFileSystemList();

  list.Free = onFree;
  list.GetAt = (index: number) => paths[index] as unknown as ReturnType<FSFileList["GetAt"]>;
  list.Size = () => paths.length;

  return list;
}

describe("declaration module discovery", () => {
  beforeEach(() => {
    const fs: MockFileSystem = MockFileSystem.getInstance();

    fs.file_list_open.mockReset();
    fs.setMock(roots.gameData, "declarations\\", false);
  });

  it("filters non-payload scripts and normalizes module IDs", () => {
    expect(isDeclarationPayload("effects.world.is_rain.script")).toBe(true);
    expect(isDeclarationPayload("effects.world.index.script")).toBe(false);
    expect(isDeclarationPayload("index.script")).toBe(false);
    expect(isDeclarationPayload("effects.actor.shared.script")).toBe(false);
    expect(isDeclarationPayload("shared.script")).toBe(false);
    expect(isDeclarationPayload("effects.world.test.script")).toBe(false);
    expect(isDeclarationPayload("effects.world.spec.script")).toBe(false);
    expect(isDeclarationPayload("effects.world.script.map")).toBe(false);

    expect(declarationPathToModuleId("Dialogs/Zaton/ZAT_B29/advanced_artefacts.script")).toBe(
      "declarations.dialogs.zaton.zat_b29.advanced_artefacts"
    );
  });

  it("discovers recursively, sorts deterministically, and frees the native list", () => {
    const fs: MockFileSystem = MockFileSystem.getInstance();
    const free: jest.Mock = jest.fn();

    fs.setMock(roots.gameData, "declarations\\", true);
    fs.file_list_open.mockReturnValue(
      mockNativeFileList(
        [
          "effects\\world\\is_rain.script",
          "conditions\\object\\index.script",
          "dialogs/zaton/zat_b29/advanced_artefacts.script",
          "effects/actor/shared.script",
          "effects/world.test.script",
          "README.md",
          "callbacks\\actor.script",
        ],
        free
      )
    );

    expect(discoverDeclarationModules()).toEqualLuaArrays([
      "declarations.callbacks.actor",
      "declarations.dialogs.zaton.zat_b29.advanced_artefacts",
      "declarations.effects.world.is_rain",
    ]);
    expect(fs.file_list_open).toHaveBeenCalledWith(roots.gameData, "declarations\\", FS.FS_ListFiles);
    expect(free).toHaveBeenCalledTimes(1);
  });

  it("returns an empty list without opening a missing directory", () => {
    const fs: MockFileSystem = MockFileSystem.getInstance();

    expect(discoverDeclarationModules()).toEqualLuaArrays([]);
    expect(fs.file_list_open).not.toHaveBeenCalled();
  });

  it("frees the native list if enumeration fails", () => {
    const fs: MockFileSystem = MockFileSystem.getInstance();
    const free: jest.Mock = jest.fn();
    const list: MockFileSystemList = mockNativeFileList(["effects\\world\\is_rain.script"], free);

    list.GetAt = (): ReturnType<FSFileList["GetAt"]> => {
      throw new Error("enumeration failed");
    };

    fs.setMock(roots.gameData, "declarations\\", true);
    fs.file_list_open.mockReturnValue(list);

    expect(() => discoverDeclarationModules()).toThrow("enumeration failed");
    expect(free).toHaveBeenCalledTimes(1);
  });

  it("loads every discovered module in order", () => {
    const loaded: Array<TName> = [];
    const modules: LuaArray<TName> = $fromArray(["first", "second", "third"]);

    loadDeclarationModules(modules, (moduleId: TName): void => {
      loaded.push(moduleId);
    });

    expect(loaded).toEqual(["first", "second", "third"]);
  });
});
