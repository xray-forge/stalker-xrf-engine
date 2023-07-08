import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  createAutoSave,
  createSave,
  deleteGameSave,
  getFileDataForGameSave,
  isGameSaveFileExist,
} from "@/engine/core/utils/game/game_save";
import { resetFunctionMock } from "@/fixtures/utils";
import { gameConsole, MockFileSystem, MockFileSystemList, mocksConfig } from "@/fixtures/xray";

describe("'game_save' utils", () => {
  beforeEach(() => {
    resetFunctionMock(gameConsole.execute);
    resetFunctionMock(gameConsole.get_float);
  });

  it("'getFileDataForGameSave' should correctly get save data", () => {
    expect(getFileDataForGameSave("test")).toBe("no file data");

    MockFileSystem.getInstance().file_list_open_ex.mockImplementation(() => new MockFileSystemList(["a"]));

    expect(getFileDataForGameSave("test")).toBe(
      "translated_st_level: translated_pripyat\\ntranslated_ui_inv_time: 09:30 06/12/2012\\n" +
        "translated_st_ui_health_sensor %d100"
    );
  });

  it("'isGameSaveFileExist' should correctly check if save file exists", () => {
    const fileSystem: MockFileSystem = MockFileSystem.getInstance();

    fileSystem.file_list_open_ex.mockImplementation(() => new MockFileSystemList());
    expect(isGameSaveFileExist("test")).toBe(false);

    fileSystem.file_list_open_ex.mockImplementation(() => new MockFileSystemList(["a"]));
    expect(isGameSaveFileExist("test")).toBe(true);
  });

  it("'deleteGameSave' should correctly delete file exists", () => {
    const fileSystem: MockFileSystem = MockFileSystem.getInstance();

    fileSystem.file_list_open_ex.mockImplementation(() => new MockFileSystemList());
    deleteGameSave("todelete");
    expect(fileSystem.file_delete).toHaveBeenCalledWith("$game_saves$", "todelete.scop");

    fileSystem.file_delete.mockReset();
    MockFileSystem.getInstance().file_list_open_ex.mockImplementation(() => new MockFileSystemList(["a"]));
    deleteGameSave("another");
    expect(fileSystem.file_delete).toHaveBeenNthCalledWith(1, "$game_saves$", "another.scop");
    expect(fileSystem.file_delete).toHaveBeenNthCalledWith(2, "$game_saves$", "another.dds");
  });

  it("'createSave' should correctly generate commands", () => {
    createSave("test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_test");

    resetFunctionMock(gameConsole.execute);
    createSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_st_another_test");

    resetFunctionMock(gameConsole.execute);
    createSave("st_another_test", false);
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - st_another_test");

    expect(() => createSave(null)).toThrow();
  });

  it("'createAutoSave' should correctly generate commands", () => {
    // When auto-save disabled.
    mocksConfig.isAutoSavingEnabled = false;

    createAutoSave("test");
    createAutoSave("st_test");
    createAutoSave("st_test", false);

    expect(gameConsole.execute).not.toHaveBeenCalled();

    // When auto-save enabled.
    mocksConfig.isAutoSavingEnabled = true;

    createAutoSave("test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_test");

    resetFunctionMock(gameConsole.execute);
    createAutoSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_st_another_test");

    resetFunctionMock(gameConsole.execute);
    createAutoSave("st_another_test", false);
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - st_another_test");

    expect(() => createSave(null)).toThrow();
  });
});
