import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CConsole, CUICheckButton, get_console, ui_events } from "xray16";
import { MockCUICheckButton, MockCUIScriptWnd } from "xray16/mocks";

import { onOffCommands, zeroOneCommands } from "@/engine/constants/console_commands";
import { DebugCommandsSection } from "@/engine/core/ui/debug/sections/DebugCommandsSection";
import { resetRegistry } from "@/fixtures/engine";

/**
 * Controls are assigned by the base constructor before subclass field declarations are defined, so initialization
 * has to be repeated to observe the resulting UI state.
 */
function createSection(): DebugCommandsSection {
  const section: DebugCommandsSection = new DebugCommandsSection(MockCUIScriptWnd.mock(), "test-name");

  // Reset owner registrations recorded by the base constructor so a single initialization pass can be asserted.
  jest.mocked(section.owner.Register).mockClear();
  jest.mocked(section.owner.AddCallback).mockClear();
  section.initializeControls();

  return section;
}

describe("DebugCommandsSection", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should register an entry for every known command", () => {
    const section: DebugCommandsSection = createSection();
    const total: number = zeroOneCommands.length + onOffCommands.length;

    expect(section.uiCommandsList).toBeDefined();
    expect(section.owner.Register).toHaveBeenCalledTimes(total);
    expect(section.owner.AddCallback).toHaveBeenCalledTimes(total * 2);

    expect(section.owner.Register).toHaveBeenCalledWith(expect.anything(), zeroOneCommands[0]);
    expect(section.owner.AddCallback).toHaveBeenCalledWith(
      zeroOneCommands[0],
      ui_events.CHECK_BUTTON_SET,
      expect.any(Function),
      section
    );
  });

  it("should read initial command value from console", () => {
    const console: CConsole = get_console();

    jest.spyOn(console, "get_bool").mockImplementation(() => true);

    const section: DebugCommandsSection = createSection();

    expect(section).not.toBeNull();
    expect(console.get_bool).toHaveBeenCalledWith(zeroOneCommands[0]);
  });

  it("should execute numeric command on checkbox change", () => {
    const section: DebugCommandsSection = createSection();
    const check: CUICheckButton = MockCUICheckButton.mock();

    jest.spyOn(check, "GetCheck").mockImplementation(() => true);
    section.onCheckboxChange(check, "hud_draw", "numeric");

    expect(get_console().execute).toHaveBeenCalledWith("hud_draw 1");

    jest.spyOn(check, "GetCheck").mockImplementation(() => false);
    section.onCheckboxChange(check, "hud_draw", "numeric");

    expect(get_console().execute).toHaveBeenCalledWith("hud_draw 0");
  });

  it("should execute boolean command on checkbox change", () => {
    const section: DebugCommandsSection = createSection();
    const check: CUICheckButton = MockCUICheckButton.mock();

    jest.spyOn(check, "GetCheck").mockImplementation(() => true);
    section.onCheckboxChange(check, "hud_draw", "boolean");

    expect(get_console().execute).toHaveBeenCalledWith("hud_draw on");

    jest.spyOn(check, "GetCheck").mockImplementation(() => false);
    section.onCheckboxChange(check, "hud_draw", "boolean");

    expect(get_console().execute).toHaveBeenCalledWith("hud_draw off");
  });
});
