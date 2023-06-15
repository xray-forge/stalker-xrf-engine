import { CUILines } from "xray16";

/**
 * Mock CUILines.
 */
export class MockCUILines {
  public static mock(): CUILines {
    return new MockCUILines() as unknown as CUILines;
  }

  public text: string = "";

  public GetText(): string {
    return this.text;
  }

  public SetText(text: string): void {
    this.text = text;
  }

  public SetTextST(text: string): void {
    this.text = text;
  }
}
