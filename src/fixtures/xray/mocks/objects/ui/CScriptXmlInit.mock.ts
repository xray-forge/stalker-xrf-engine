import { jest } from "@jest/globals";
import type { CScriptXmlInit } from "xray16";

import { MockCUI3tButton } from "@/fixtures/xray/mocks/objects/ui/CUI3tButton.mock";
import { MockCUICheckButton } from "@/fixtures/xray/mocks/objects/ui/CUICheckButton.mock";
import { MockCUIEditBox } from "@/fixtures/xray/mocks/objects/ui/CUIEditBox.mock";
import { MockCUIListBox } from "@/fixtures/xray/mocks/objects/ui/CUIListBox.mock";
import { MockCUIScrollView } from "@/fixtures/xray/mocks/objects/ui/CUIScrollView.mock";
import { MockCUIStatic } from "@/fixtures/xray/mocks/objects/ui/CUIStatic.mock";
import { MockCUITabControl } from "@/fixtures/xray/mocks/objects/ui/CUITabControl.mock";
import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock xml file with forms sources.
 */
export class MockCScriptXmlInit {
  public static mock(): CScriptXmlInit {
    return new MockCScriptXmlInit() as unknown as CScriptXmlInit;
  }

  public ParseFile = jest.fn();
  public InitWindow = jest.fn(() => MockCUIWindow.mock());
  public InitTab = jest.fn(() => MockCUITabControl.mock());
  public Init3tButton = jest.fn(() => MockCUI3tButton.mock());
  public InitCheck = jest.fn(() => MockCUICheckButton.mock());
  public InitStatic = jest.fn(() => MockCUIStatic.mock());
  public InitComboBox = jest.fn();
  public InitListBox = jest.fn(() => MockCUIListBox.mock());
  public InitEditBox = jest.fn(() => MockCUIEditBox.mock());
  public InitLabel = jest.fn();
  public InitScrollView = jest.fn(() => MockCUIScrollView.mock());
  public InitTrackBar = jest.fn();
  public InitFrame = jest.fn();
  public InitFrameLine = jest.fn();
  public InitKeyBinding = jest.fn();
  public InitProgressBar = jest.fn();
  public InitTextWnd = jest.fn();
  public InitMMShniaga = jest.fn();
}
