import { jest } from "@jest/globals";
import type { CUIScriptWnd } from "xray16";

import { MockCUIDialogWnd } from "@/fixtures/xray/mocks/objects/ui/CUIDialogWnd.mock";

/**
 * Mocking script window for testing.
 */
export class MockCUIScriptWnd extends MockCUIDialogWnd {
  public static override mock(): CUIScriptWnd {
    return new MockCUIScriptWnd() as unknown as CUIScriptWnd;
  }

  public Register = jest.fn();
  public AddCallback = jest.fn();

  public Update(): void {}
}
