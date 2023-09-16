import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { alife, device } from "xray16";

import {
  createGameAutoSave,
  createGameSave,
  deleteGameSave,
  getFileDataForGameSave,
  isGameSaveFileExist,
  loadDynamicGameSave,
  loadGameSave,
  loadLastGameSave,
  saveDynamicGameSave,
  startNewGame,
} from "@/engine/core/utils/game/game_save";
import { gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { MockIoFile } from "@/fixtures/lua";
import { replaceFunctionMockOnce, resetFunctionMock } from "@/fixtures/utils";
import { gameConsole, MockFileSystem, MockFileSystemList, mocksConfig } from "@/fixtures/xray";

describe("'game_save' utils", () => {
  beforeEach(() => {
    resetFunctionMock(gameConsole.execute);
    resetFunctionMock(gameConsole.get_float);
    resetFunctionMock(io.open);
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
    expect(fileSystem.file_delete).toHaveBeenNthCalledWith(2, "$game_saves$", "another.scopx");
    expect(fileSystem.file_delete).toHaveBeenNthCalledWith(3, "$game_saves$", "another.dds");
  });

  it("'createSave' should correctly generate commands", () => {
    createGameSave("test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save test");

    resetFunctionMock(gameConsole.execute);
    createGameSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save st_another_test");

    resetFunctionMock(gameConsole.execute);
    createGameSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save st_another_test");

    expect(() => createGameSave(null)).toThrow();
  });

  it("'createAutoSave' should correctly generate commands", () => {
    // When auto-save disabled.
    mocksConfig.isAutoSavingEnabled = false;

    createGameAutoSave("test");
    createGameAutoSave("st_test");
    createGameAutoSave("st_test", false);

    expect(gameConsole.execute).not.toHaveBeenCalled();

    // When auto-save enabled.
    mocksConfig.isAutoSavingEnabled = true;

    createGameAutoSave("test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_test");

    resetFunctionMock(gameConsole.execute);
    createGameAutoSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_st_another_test");

    resetFunctionMock(gameConsole.execute);
    createGameAutoSave("st_another_test", false);
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - st_another_test");

    expect(() => createGameSave(null)).toThrow();
  });

  it("'saveDynamicGameSave' should correctly create dynamic file saves", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    saveDynamicGameSave("example.scop", { a: 1, b: 2, c: 3 });

    expect(lfs.mkdir).toHaveBeenCalledTimes(1);
    expect(io.open).toHaveBeenCalledWith("$game_saves$\\example.scopx", "wb");
    expect(file.write).toHaveBeenCalledWith(JSON.stringify({ a: 1, b: 2, c: 3 }));
    expect(file.close).toHaveBeenCalledTimes(1);

    expect(file.content).toBe(JSON.stringify({ a: 1, b: 2, c: 3 }));

    file.isOpen = false;
    saveDynamicGameSave("example.scop", { a: 1000 });

    expect(file.write).toHaveBeenCalledTimes(1);
    expect(file.content).toBe(JSON.stringify({ a: 1, b: 2, c: 3 }));
    expect(file.close).toHaveBeenCalledTimes(1);
  });

  it("'loadDynamicGameSave' should correctly load dynamic file saves", () => {
    const file: MockIoFile = new MockIoFile("test", "wb");

    file.content = JSON.stringify({ a: 1, b: 33 });

    jest.spyOn(io, "open").mockImplementation(() => $multi(file.asMock()));

    expect(loadDynamicGameSave("F:\\\\parent\\\\example.scop")).toEqual({ a: 1, b: 33 });

    expect(marshal.decode).toHaveBeenCalledWith(file.content);
    expect(io.open).toHaveBeenCalledWith("F:\\\\parent\\\\example.scopx", "rb");
    expect(file.read).toHaveBeenCalledTimes(1);
    expect(file.close).toHaveBeenCalledTimes(1);

    file.content = "";
    expect(loadDynamicGameSave("F:\\\\parent\\\\example.scop")).toBeNull();

    file.content = null;
    expect(loadDynamicGameSave("F:\\\\parent\\\\example.scop")).toBeNull();

    file.content = "{}";
    file.isOpen = false;
    expect(loadDynamicGameSave("F:\\\\parent\\\\example.scop")).toBeNull();
  });

  it("'loadLastGameSave' should correctly save last game and turn off menu", () => {
    loadLastGameSave();

    expect(gameConsole.execute).toHaveBeenCalledTimes(2);
    expect(gameConsole.execute).toHaveBeenNthCalledWith(1, "main_menu off");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(2, "load_last_save");
  });

  it("'startNewGame' should correctly create new server, set difficulty and disconnect from previous one", () => {
    startNewGame(gameDifficulties.gd_master);

    expect(gameConsole.execute).toHaveBeenCalledTimes(4);
    expect(gameConsole.execute).toHaveBeenNthCalledWith(1, "g_game_difficulty gd_master");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(2, "disconnect");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(3, "start server(all/single/alife/new) client(localhost)");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(4, "main_menu off");
    expect(device().pause).toHaveBeenCalledWith(false);
  });

  it("'startNewGame' should correctly be called when not started", () => {
    replaceFunctionMockOnce(alife, () => null);

    startNewGame();

    expect(gameConsole.execute).toHaveBeenCalledTimes(2);
    expect(gameConsole.execute).toHaveBeenNthCalledWith(1, "start server(all/single/alife/new) client(localhost)");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(2, "main_menu off");
    expect(device().pause).toHaveBeenCalledWith(false);
  });

  it("'loadGameSave' should correctly be called when started", () => {
    expect(() => loadGameSave(null)).toThrow();

    loadGameSave("text_example");

    expect(gameConsole.execute).toHaveBeenCalledTimes(1);
    expect(gameConsole.execute).toHaveBeenNthCalledWith(1, "load text_example");
  });

  it("'loadGameSave' should correctly be called when not started", () => {
    replaceFunctionMockOnce(alife, () => null);

    loadGameSave("text_example");

    expect(gameConsole.execute).toHaveBeenCalledTimes(2);
    expect(gameConsole.execute).toHaveBeenNthCalledWith(1, "disconnect");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(
      2,
      "start server(text_example/single/alife/load) client(localhost)"
    );
  });

  it.todo("getGameSavesList should correctly get list of save files in proper order");
});
