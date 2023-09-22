import { jest } from "@jest/globals";
import type { CScriptXmlInit } from "xray16";

import { MockCUIEditBox } from "@/fixtures/xray/mocks/objects/ui/CUIEditBox.mock";

/**
 * Mock xml file with forms sources.
 */
export class MockCScriptXmlInit {
  public static mock(): CScriptXmlInit {
    return new MockCScriptXmlInit() as unknown as CScriptXmlInit;
  }

  public ParseFile = jest.fn();
  public Init3tButton = jest.fn();
  public InitCheck = jest.fn();
  public InitStatic = jest.fn();
  public InitComboBox = jest.fn();
  public InitFrame = jest.fn();
  public InitListBox = jest.fn();
  public InitEditBox = jest.fn(() => MockCUIEditBox.mock());
  public InitLabel = jest.fn();
}
