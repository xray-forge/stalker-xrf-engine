import { describe, expect, it, jest } from "@jest/globals";
import { CUIScriptWnd, CUIWindow, ui_events } from "xray16";

import { EElementType, initializeElement, initializeStatics } from "@/engine/core/utils/ui/forms";
import { XmlInit } from "@/engine/lib/types";
import { MockCScriptXmlInit, MockCUIScriptWnd, MockCUIWindow } from "@/fixtures/xray";

describe("forms_registration utils", () => {
  it("registerStatics should correctly create statics as shortcut", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    initializeStatics(xml, base, "test_selector");
    expect(xml.InitStatic).toHaveBeenCalledWith("test_selector", base);
  });

  it("initElement should correctly register elements", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    initializeElement(xml, "test_selector", EElementType.BUTTON, base);
    expect(xml.Init3tButton).toHaveBeenCalledWith("test_selector", base);

    initializeElement(xml, "test_selector", EElementType.STATIC, base);
    expect(xml.InitStatic).toHaveBeenCalledWith("test_selector", base);

    initializeElement(xml, "test_selector", EElementType.LIST_BOX, base);
    expect(xml.InitListBox).toHaveBeenCalledWith("test_selector", base);
  });

  it("registerUiElement should correctly register elements with callbacks", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    const first = jest.fn();
    const second = jest.fn();

    const element = initializeElement(xml, "edit_box_example", EElementType.EDIT_BOX, base, {
      context,
      handlers: {
        [ui_events.BUTTON_CLICKED]: first,
        [ui_events.EDIT_TEXT_COMMIT]: second,
      },
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

  it("registerUiElement should correctly not register elements without callbacks", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    initializeElement(xml, "check_box_example", EElementType.CHECK_BUTTON, base, {
      context,
    });

    expect(xml.InitCheck).toHaveBeenCalledWith("check_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, "edit_box_example", EElementType.EDIT_BOX, base, {
      context,
    });

    expect(xml.InitEditBox).toHaveBeenCalledWith("edit_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, "combo_box_example", EElementType.COMBO_BOX, base, {
      context,
    });

    expect(xml.InitComboBox).toHaveBeenCalledWith("combo_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, "frame_example", EElementType.FRAME, base, {
      context,
    });

    expect(xml.InitFrame).toHaveBeenCalledWith("frame_example", base);
    expect(context.Register).not.toHaveBeenCalled();

    initializeElement(xml, "label_example", EElementType.LABEL, base, {
      context,
    });

    expect(xml.InitLabel).toHaveBeenCalledWith("label_example", base);
    expect(context.Register).not.toHaveBeenCalled();
  });

  it("registerUiElement should throw on unexpected", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    expect(() => {
      initializeElement(xml, "example", "unexpected" as unknown as EElementType, base, {
        context,
      });
    }).toThrow();
  });
});
