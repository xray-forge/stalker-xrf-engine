import type { CUISpinText } from "xray16";

export class MockCUISpinText {
  public static mock(): CUISpinText {
    return new MockCUISpinText() as unknown as CUISpinText;
  }
}
