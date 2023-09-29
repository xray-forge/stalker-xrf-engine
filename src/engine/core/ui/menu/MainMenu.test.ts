import { describe, expect, it } from "@jest/globals";

import { MainMenu } from "@/engine/core/ui/menu/MainMenu";

describe("MainMenu component", () => {
  it("should correctly create", () => {
    const menu: MainMenu = new MainMenu();

    expect(menu.uiMultiplayerMenuDialog).toBeNull();
    expect(menu.uiGameOptionsDialog).toBeNull();
    expect(menu.uiGameSavesSaveDialog).toBeNull();
    expect(menu.uiGameSavesLoadDialog).toBeNull();
    expect(menu.uiLocalnetDialog).toBeNull();
    expect(menu.uiGamespyDialog).toBeNull();
    expect(menu.uiGameDebugDialog).toBeNull();
    expect(menu.uiGameExtensionsDialog).toBeNull();
  });

  it.todo("should correctly initialize");

  it.todo("should correctly change active modes");

  it.todo("should correctly handle keyboard events");
});
