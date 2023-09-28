import { CUICheckButton } from "xray16";

/**
 * Mock check button.
 */
export class MockCUICheckButton {
  public static mock(): CUICheckButton {
    return new MockCUICheckButton() as unknown as CUICheckButton;
  }
  public SetCheck(): void {}
}
