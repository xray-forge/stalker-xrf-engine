import { jest } from "@jest/globals";
import { CUICheckButton } from "xray16";

/**
 * Mock check button.
 */
export class MockCUICheckButton {
  public static mock(): CUICheckButton {
    return new MockCUICheckButton() as unknown as CUICheckButton;
  }

  public isChecked: boolean = false;

  public SetCheck = jest.fn((isChecked: boolean) => {
    this.isChecked = isChecked;
  });

  public GetCheck = jest.fn(() => this.isChecked);

  public SetDependControl = jest.fn();
}
