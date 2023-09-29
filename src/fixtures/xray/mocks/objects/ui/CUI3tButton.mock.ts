import type { CUI3tButton } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock CUI button.
 */
export class MockCUI3tButton extends MockCUIWindow {
  public static override mock(): CUI3tButton {
    return new MockCUI3tButton() as unknown as CUI3tButton;
  }
}
