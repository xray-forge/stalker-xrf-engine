import { CUICheckButton } from "xray16";

/**
 * Mock check button.
 */
export class MockCUICheckButton {
  public static mock(): CUICheckButton {
    return new MockCUICheckButton() as unknown as CUICheckButton;
  }

  public isChecked: boolean = false;

  public SetCheck(isChecked: boolean): void {
    this.isChecked = isChecked;
  }

  public GetCheck(): boolean {
    return this.isChecked;
  }
}
