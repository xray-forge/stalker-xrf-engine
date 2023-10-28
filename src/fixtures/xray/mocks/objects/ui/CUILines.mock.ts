import { jest } from "@jest/globals";
import { CUILines } from "xray16";

/**
 * Mock CUILines.
 */
export class MockCUILines {
  public static mock(): CUILines {
    return new MockCUILines() as unknown as CUILines;
  }

  public text: string = "";

  public GetText = jest.fn(() => {
    return this.text;
  });

  public SetText = jest.fn((text: string) => {
    this.text = text;
  });

  public SetTextST = jest.fn((text: string) => {
    this.text = text;
  });
}
