import type { CUIEditBox } from "xray16";

/**
 * Mocking edit box for testing.
 */
export class MockCUIEditBox {
  public static mock(): CUIEditBox {
    return new MockCUIEditBox() as unknown as CUIEditBox;
  }
}
