import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { device, IsImportantSave } from "xray16";

import { registerSimulator, registry } from "@/engine/core/database";
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
} from "@/engine/core/utils/game_save";
import { gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { AlifeSimulator, Console } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockIoFile } from "@/fixtures/lua";
import { MockConsole, MockFileSystem, MockFileSystemList } from "@/fixtures/xray";

describe("getFileDataForGameSave utils", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("getFileDataForGameSave should correctly get save data", () => {
    expect(getFileDataForGameSave("test")).toBe("no file data");

    MockFileSystem.getInstance().file_list_open_ex.mockImplementation(() => new MockFileSystemList(["a"]));

    expect(getFileDataForGameSave("test")).toBe(
      "translated_st_level: translated_pripyat\\ntranslated_ui_inv_time: 09:30 06/12/2012\\n" +
        "translated_st_ui_health_sensor %d100"
    );
  });
});

describe("isGameSaveFileExist utils", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("isGameSaveFileExist should correctly check if save file exists", () => {
    const fileSystem: MockFileSystem = MockFileSystem.getInstance();

    fileSystem.file_list_open_ex.mockImplementation(() => new MockFileSystemList());
    expect(isGameSaveFileExist("test")).toBe(false);

    fileSystem.file_list_open_ex.mockImplementation(() => new MockFileSystemList(["a"]));
    expect(isGameSaveFileExist("test")).toBe(true);
  });
});

describe("game_save utils", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("deleteGameSave should correctly delete file exists", () => {
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
});

describe("createSave utils", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("should correctly generate commands", () => {
    const console: Console = MockConsole.getInstanceMock();

    createGameSave("test");
    expect(console.execute).toHaveBeenCalledWith("save test");

    resetFunctionMock(console.execute);
    createGameSave("st_another_test");
    expect(console.execute).toHaveBeenCalledWith("save st_another_test");

    resetFunctionMock(console.execute);
    createGameSave("st_another_test");
    expect(console.execute).toHaveBeenCalledWith("save st_another_test");

    expect(() => createGameSave(null)).toThrow();
  });
});

describe("createAutoSave util", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    replaceFunctionMock(IsImportantSave, () => true);

    MockConsole.reset();
  });

  it("createAutoSave should correctly generate commands", () => {
    const console: Console = MockConsole.getInstanceMock();

    // When auto-save disabled.
    replaceFunctionMock(IsImportantSave, () => false);

    createGameAutoSave("test");
    createGameAutoSave("st_test");
    createGameAutoSave("st_test", false);

    expect(console.execute).not.toHaveBeenCalled();

    // When auto-save enabled.
    replaceFunctionMock(IsImportantSave, () => true);

    createGameAutoSave("test");
    expect(console.execute).toHaveBeenCalledWith("save os_user_name - translated_test");

    resetFunctionMock(console.execute);
    createGameAutoSave("st_another_test");
    expect(console.execute).toHaveBeenCalledWith("save os_user_name - translated_st_another_test");

    resetFunctionMock(console.execute);
    createGameAutoSave("st_another_test", false);
    expect(console.execute).toHaveBeenCalledWith("save os_user_name - st_another_test");

    expect(() => createGameSave(null)).toThrow();
  });
});

describe("saveDynamicGameSave utils", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("should correctly create dynamic file saves", () => {
    const console: Console = MockConsole.getInstanceMock();
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

  it("should correctly load dynamic file saves", () => {
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
});

describe("loadLastGameSave utils", () => {
  beforeEach(() => {
    resetRegistry();

    MockConsole.reset();
  });

  it("should correctly save last game and turn off menu", () => {
    const console: Console = MockConsole.getInstanceMock();

    loadLastGameSave();

    expect(console.execute).toHaveBeenCalledTimes(2);
    expect(console.execute).toHaveBeenNthCalledWith(1, "main_menu off");
    expect(console.execute).toHaveBeenNthCalledWith(2, "load_last_save");
  });
});

describe("startNewGame util", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("should correctly create new server, set difficulty and disconnect from previous one", () => {
    const console: Console = MockConsole.getInstanceMock();

    startNewGame(gameDifficulties.gd_master);

    expect(console.execute).toHaveBeenCalledTimes(4);
    expect(console.execute).toHaveBeenNthCalledWith(1, "g_game_difficulty gd_master");
    expect(console.execute).toHaveBeenNthCalledWith(2, "disconnect");
    expect(console.execute).toHaveBeenNthCalledWith(3, "start server(all/single/alife/new) client(localhost)");
    expect(console.execute).toHaveBeenNthCalledWith(4, "main_menu off");
    expect(device().pause).toHaveBeenCalledWith(false);
  });

  it("should correctly be called when not started", () => {
    const console: Console = MockConsole.getInstanceMock();

    registry.simulator = null as unknown as AlifeSimulator;

    startNewGame();

    expect(console.execute).toHaveBeenCalledTimes(2);
    expect(console.execute).toHaveBeenNthCalledWith(1, "start server(all/single/alife/new) client(localhost)");
    expect(console.execute).toHaveBeenNthCalledWith(2, "main_menu off");
    expect(device().pause).toHaveBeenCalledWith(false);
  });
});

describe("loadGameSave util", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(io.open);
    registerSimulator();

    MockConsole.reset();
  });

  it("loadGameSave should correctly be called when started", () => {
    const console: Console = MockConsole.getInstanceMock();

    expect(() => loadGameSave(null)).toThrow();

    loadGameSave("text_example");

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenNthCalledWith(1, "load text_example");
  });

  it("should correctly be called when not started", () => {
    const console: Console = MockConsole.getInstanceMock();

    registry.simulator = null as unknown as AlifeSimulator;

    loadGameSave("text_example");

    expect(console.execute).toHaveBeenCalledTimes(2);
    expect(console.execute).toHaveBeenNthCalledWith(1, "disconnect");
    expect(console.execute).toHaveBeenNthCalledWith(
      2,
      "start server(text_example/single/alife/load) client(localhost)"
    );
  });
});

describe("getGameSavesList utils", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it.todo("should correctly get list of save files in proper order");
});
