import { beforeEach, describe, expect, it } from "@jest/globals";

import { createAutoSave, createSave } from "@/engine/core/utils/game/game_save";
import { resetFunctionMock } from "@/fixtures/utils/function_mock";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";
import { mocksConfig } from "@/fixtures/xray/mocks/MocksConfig";

describe("'game_save' utils", () => {
  beforeEach(() => {
    resetFunctionMock(gameConsole.execute);
    resetFunctionMock(gameConsole.get_float);
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
