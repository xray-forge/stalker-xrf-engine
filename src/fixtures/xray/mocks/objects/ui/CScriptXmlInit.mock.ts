import { jest } from "@jest/globals";
import type { CScriptXmlInit } from "xray16";

import { MockCServerList } from "@/fixtures/xray/mocks/objects/ui/CServerList.mock";
import { MockCUI3tButton } from "@/fixtures/xray/mocks/objects/ui/CUI3tButton.mock";
import { MockCUICheckButton } from "@/fixtures/xray/mocks/objects/ui/CUICheckButton.mock";
import { MockCUIComboBox } from "@/fixtures/xray/mocks/objects/ui/CUIComboBox.mock";
import { MockCUIEditBox } from "@/fixtures/xray/mocks/objects/ui/CUIEditBox.mock";
import { MockCUIListBox } from "@/fixtures/xray/mocks/objects/ui/CUIListBox.mock";
import { MockCUIMapInfo } from "@/fixtures/xray/mocks/objects/ui/CUIMapInfo.mock";
import { MockCUIMapList } from "@/fixtures/xray/mocks/objects/ui/CUIMapList.mock";
import { MockCUIScrollView } from "@/fixtures/xray/mocks/objects/ui/CUIScrollView.mock";
import { MockCUISpinFlt } from "@/fixtures/xray/mocks/objects/ui/CUISpinFlt.mock";
import { MockCUISpinNum } from "@/fixtures/xray/mocks/objects/ui/CUISpinNum.mock";
import { MockCUISpinText } from "@/fixtures/xray/mocks/objects/ui/CUISpinText.mock";
import { MockCUIStatic } from "@/fixtures/xray/mocks/objects/ui/CUIStatic.mock";
import { MockCUITabControl } from "@/fixtures/xray/mocks/objects/ui/CUITabControl.mock";
import { MockCUITextWnd } from "@/fixtures/xray/mocks/objects/ui/CUITextWnd.mock";
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
  public InitComboBox = jest.fn(() => MockCUIComboBox.mock());
  public InitListBox = jest.fn(() => MockCUIListBox.mock());
  public InitEditBox = jest.fn(() => MockCUIEditBox.mock());
  public InitLabel = jest.fn();
  public InitScrollView = jest.fn(() => MockCUIScrollView.mock());
  public InitSpinNum = jest.fn(() => MockCUISpinNum.mock());
  public InitSpinText = jest.fn(() => MockCUISpinText.mock());
  public InitMapList = jest.fn(() => MockCUIMapList.mock());
  public InitMapInfo = jest.fn(() => MockCUIMapInfo.mock());
  public InitTrackBar = jest.fn();
  public InitFrame = jest.fn();
  public InitFrameLine = jest.fn();
  public InitKeyBinding = jest.fn();
  public InitProgressBar = jest.fn();
  public InitTextWnd = jest.fn(() => MockCUITextWnd.mock());
  public InitMPPlayerName = jest.fn(() => MockCUIEditBox.mock());
  public InitCDkey = jest.fn(() => MockCUIEditBox.mock());
  public InitMMShniaga = jest.fn();
  public InitSpinFlt = jest.fn(() => MockCUISpinFlt.mock());
  public InitServerList = jest.fn(() => MockCServerList.mock());
}
