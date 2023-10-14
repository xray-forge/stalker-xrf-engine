import { jest } from "@jest/globals";
import type { CUIEditBox } from "xray16";

/**
 * Mocking edit box for testing.
 */
export class MockCUIEditBox {
  public static mock(): CUIEditBox {
    return new MockCUIEditBox() as unknown as CUIEditBox;
  }

  public text: string = "";

  public GetText = jest.fn(() => this.text);

  public SetText = jest.fn((text: string) => (this.text = text));

  public CaptureFocus = jest.fn();
}
