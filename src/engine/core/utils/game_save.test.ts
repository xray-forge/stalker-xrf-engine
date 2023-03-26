import { beforeEach, describe, expect, it } from "@jest/globals";

import { createAutoSave, createSave } from "@/engine/core/utils/game_save";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";
import { mocksConfig } from "@/fixtures/xray/mocks/MocksConfig";
import { resetMethodMock } from "@/fixtures/xray/mocks/utils.mock";

describe("'game_save' utils", () => {
  beforeEach(() => {
    resetMethodMock(gameConsole.execute);
    resetMethodMock(gameConsole.get_float);
  });

  it("'createSave' should correctly generate commands", () => {
    createSave("test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - test");

    resetMethodMock(gameConsole.execute);
    createSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_st_another_test");

    resetMethodMock(gameConsole.execute);
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
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - test");

    resetMethodMock(gameConsole.execute);
    createAutoSave("st_another_test");
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - translated_st_another_test");

    resetMethodMock(gameConsole.execute);
    createAutoSave("st_another_test", false);
    expect(gameConsole.execute).toHaveBeenCalledWith("save os_user_name - st_another_test");

    expect(() => createSave(null)).toThrow();
  });
});
