import { describe, expect, it, jest } from "@jest/globals";
import { CUIScriptWnd, CUIStatic, CUIWindow, ui_events } from "xray16";

import { EElementType, initializeElement, initializeStatic, initializeStatics } from "@/engine/core/utils/ui/forms";
import { XmlInit } from "@/engine/lib/types";
import { MockCScriptXmlInit, MockCUIScriptWnd, MockCUIWindow } from "@/fixtures/xray";

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
