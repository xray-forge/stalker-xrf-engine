import { describe, expect, it, jest } from "@jest/globals";
import { CUIScriptWnd, CUIWindow, ui_events } from "xray16";

import { EElementType, registerUiElement } from "@/engine/core/utils/ui/forms";
import { XmlInit } from "@/engine/lib/types";
import { MockCScriptXmlInit, MockCUIScriptWnd, MockCUIWindow } from "@/fixtures/xray";

describe("'forms_registration' utils", () => {
  it("'registerUiElement' should correctly register elements", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();

    registerUiElement(xml, "test_selector", { type: EElementType.BUTTON, base });
    expect(xml.Init3tButton).toHaveBeenCalledWith("test_selector", base);

    registerUiElement(xml, "test_selector", { type: EElementType.STATIC, base });
    expect(xml.InitStatic).toHaveBeenCalledWith("test_selector", base);

    registerUiElement(xml, "test_selector", { type: EElementType.LIST_BOX, base });
    expect(xml.InitListBox).toHaveBeenCalledWith("test_selector", base);
  });

  it("'registerUiElement' should correctly register elements with callbacks", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    const first = jest.fn();
    const second = jest.fn();

    const element = registerUiElement(xml, "edit_box_example", {
      type: EElementType.EDIT_BOX,
      base,
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

  it("'registerUiElement' should correctly not register elements without callbacks", () => {
    const xml: XmlInit = MockCScriptXmlInit.mock();
    const base: CUIWindow = MockCUIWindow.mock();
    const context: CUIScriptWnd = MockCUIScriptWnd.mock();

    registerUiElement(xml, "edit_box_example", {
      type: EElementType.EDIT_BOX,
      base,
      context,
    });

    expect(xml.InitEditBox).toHaveBeenCalledWith("edit_box_example", base);
    expect(context.Register).not.toHaveBeenCalled();
  });
});
