import { jest } from "@jest/globals";

import { MockCUIDialogWnd } from "@/fixtures/xray/mocks/objects/ui/CUIDialogWnd.mock";

/**
 * Mock generic message box.
 */
export class MockCUIMessageBoxEx extends MockCUIDialogWnd {
  public SetText = jest.fn();

  public InitMessageBox = jest.fn();
}
