import { jest } from "@jest/globals";
import { CUIScriptWnd } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mocking script window for testing.
 */
export class MockCUIScriptWnd extends MockCUIWindow {
  public static override mock(): CUIScriptWnd {
    return new MockCUIScriptWnd() as unknown as CUIScriptWnd;
  }

  public Register = jest.fn();
  public AddCallback = jest.fn();
}
