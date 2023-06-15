import { CUIStatic } from "xray16";

import { MockCUILines } from "@/fixtures/xray/mocks/objects/ui/CUILines.mock";

/**
 * Mock CUI static.
 */
export class MockCUIStatic {
  public static mock(): CUIStatic {
    return new MockCUIStatic() as unknown as CUIStatic;
  }

  public textControl: MockCUILines = new MockCUILines();

  public TextControl() {
    return this.textControl;
  }
}
