import type { CUIStatic } from "xray16";

import { MockCUILines } from "@/fixtures/xray/mocks/objects/ui/CUILines.mock";
import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock CUI static.
 */
export class MockCUIStatic extends MockCUIWindow {
  public static override mock(): CUIStatic {
    return new MockCUIStatic() as unknown as CUIStatic;
  }

  public textControl: MockCUILines = new MockCUILines();

  public TextControl() {
    return this.textControl;
  }
}
