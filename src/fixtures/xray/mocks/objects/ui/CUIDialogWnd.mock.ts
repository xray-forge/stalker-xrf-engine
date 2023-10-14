import { jest } from "@jest/globals";
import type { CUIDialogWnd } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

export class MockCUIDialogWnd extends MockCUIWindow {
  public static override mock(): CUIDialogWnd {
    return new MockCUIDialogWnd() as unknown as CUIDialogWnd;
  }

  public HideDialog = jest.fn();

  public ShowDialog = jest.fn();
}
