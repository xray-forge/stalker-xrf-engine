import { describe, expect, it, jest } from "@jest/globals";
import { CUIMessageBox, CUIMessageBoxEx, CUIScriptWnd, CUIStatic, CUIWindow, ui_events } from "xray16";
import { XmlInit } from "xray16/alias";
import { MockCScriptXmlInit, MockCUIScriptWnd, MockCUIWindow } from "xray16/mocks";

import { EElementType, initializeElement, initializeStatic, initializeStatics } from "@/engine/core/utils/ui/forms";

describe("initializeStatic util", () => {
  it("should correctly create static as shortcut", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    expect(initializeStatic(xml, base, "test_selector")).toBeInstanceOf(CUIStatic);
    expect(xml.InitStatic).toHaveBeenCalledWith("test_selector", base);
  });
});

describe("initializeStatics util", () => {
  it("should correctly create statics as shortcut", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    initializeStatics(xml, base, "test_selector");
    expect(xml.InitStatic).toHaveBeenCalledWith("test_selector", base);
  });
});

describe("initElement util", () => {
  it("should correctly register elements", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    initializeElement(xml, EElementType.BUTTON, "test_selector", base);
    expect(xml.Init3tButton).toHaveBeenCalledWith("test_selector", base);

    initializeElement(xml, EElementType.STATIC, "test_selector", base);
    expect(xml.InitStatic).toHaveBeenCalledWith("test_selector", base);

    initializeElement(xml, EElementType.LIST_BOX, "test_selector", base);
    expect(xml.InitListBox).toHaveBeenCalledWith("test_selector", base);
  });

  it("should dispatch every supported XML-backed element type to its initializer", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    initializeElement(xml, EElementType.CD_KEY, "cd_key", base);
    initializeElement(xml, EElementType.CHECK_BUTTON, "check", base);
    initializeElement(xml, EElementType.COMBO_BOX, "combo", base);
    initializeElement(xml, EElementType.EDIT_BOX, "edit", base);
    initializeElement(xml, EElementType.FRAME, "frame", base);
    initializeElement(xml, EElementType.FRAME_LINE, "frame_line", base);
    initializeElement(xml, EElementType.LABEL, "label", base);
    initializeElement(xml, EElementType.MAP_INFO, "map_info", base);
    initializeElement(xml, EElementType.MAP_LIST, "map_list", base);
    initializeElement(xml, EElementType.MP_PLAYER_NAME, "player", base);
    initializeElement(xml, EElementType.SCROLL_VIEW, "scroll", base);
    initializeElement(xml, EElementType.SPIN_NUM, "spin", base);
    initializeElement(xml, EElementType.TAB, "tab", base);
    initializeElement(xml, EElementType.TEXT_WINDOW, "text", base);
    initializeElement(xml, EElementType.TRACK_BAR, "track", base);

    expect(xml.InitCDkey).toHaveBeenCalledWith("cd_key", base);
    expect(xml.InitCheck).toHaveBeenCalledWith("check", base);
    expect(xml.InitComboBox).toHaveBeenCalledWith("combo", base);
    expect(xml.InitEditBox).toHaveBeenCalledWith("edit", base);
    expect(xml.InitFrame).toHaveBeenCalledWith("frame", base);
    expect(xml.InitFrameLine).toHaveBeenCalledWith("frame_line", base);
    expect(xml.InitLabel).toHaveBeenCalledWith("label", base);
    expect(xml.InitMapInfo).toHaveBeenCalledWith("map_info", base);
    expect(xml.InitMapList).toHaveBeenCalledWith("map_list", base);
    expect(xml.InitMPPlayerName).toHaveBeenCalledWith("player", base);
    expect(xml.InitScrollView).toHaveBeenCalledWith("scroll", base);
    expect(xml.InitSpinNum).toHaveBeenCalledWith("spin", base);
    expect(xml.InitTab).toHaveBeenCalledWith("tab", base);
    expect(xml.InitTextWnd).toHaveBeenCalledWith("text", base);
    expect(xml.InitTrackBar).toHaveBeenCalledWith("track", base);
  });

  it("should construct window and message-box elements", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const window: CUIWindow = initializeElement(xml, EElementType.WINDOW, "window", base);

    expect(window).toBeInstanceOf(CUIWindow);
    expect(xml.InitWindow).toHaveBeenCalledWith("window", 0, window);
    expect(initializeElement(xml, EElementType.MESSAGE_BOX, "message", base)).toBeInstanceOf(CUIMessageBox);
    expect(initializeElement(xml, EElementType.MESSAGE_BOX_EX, "message_ex", base)).toBeInstanceOf(CUIMessageBoxEx);
  });
});

describe("registerUiElement util", () => {
  it("should correctly register elements with callbacks", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    const first = jest.fn();
    const second = jest.fn();

    const element = initializeElement(xml, EElementType.EDIT_BOX, "edit_box_example", base, {
      context,
      [ui_events.BUTTON_CLICKED]: first,
      [ui_events.EDIT_TEXT_COMMIT]: second,
    });

    expect(xml.InitEditBox).toHaveBeenCalledWith("edit_box_example", base);
    expect(context.Register).toHaveBeenCalledWith(element, "edit_box_example");

    expect(context.AddCallback).toHaveBeenNthCalledWith(
      1,
      "edit_box_example",
      ui_events.BUTTON_CLICKED,
      first,
      context
    );
    expect(context.AddCallback).toHaveBeenNthCalledWith(
      2,
      "edit_box_example",
      ui_events.EDIT_TEXT_COMMIT,
      second,
      context
    );
  });

  it("should correctly not register elements without callbacks", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    initializeElement(xml, EElementType.CHECK_BUTTON, "check_box_example", base, {});

    expect(xml.InitCheck).toHaveBeenCalledWith("check_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, EElementType.EDIT_BOX, "edit_box_example", base);

    expect(xml.InitEditBox).toHaveBeenCalledWith("edit_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, EElementType.COMBO_BOX, "combo_box_example", base);

    expect(xml.InitComboBox).toHaveBeenCalledWith("combo_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, EElementType.FRAME, "frame_example", base);

    expect(xml.InitFrame).toHaveBeenCalledWith("frame_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, EElementType.LABEL, "label_example", base);

    expect(xml.InitLabel).toHaveBeenCalledWith("label_example", base);
    expect(context.Register).not.toHaveBeenCalled();
  });

  it("should use the base script window as callback context when no explicit context is provided", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIScriptWnd = MockCUIScriptWnd.mock();
    const callback = jest.fn();
    const element = initializeElement(xml, EElementType.BUTTON, "button", base, {
      [ui_events.BUTTON_CLICKED]: callback,
    });

    expect(base.Register).toHaveBeenCalledWith(element, "button");
    expect(base.AddCallback).toHaveBeenCalledWith("button", ui_events.BUTTON_CLICKED, callback, base);
  });

  it("should throw on unexpected", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    expect(() => {
      initializeElement(xml, "unexpected" as unknown as EElementType, "example", base, {
        context,
      });
    }).toThrow();
  });
});
