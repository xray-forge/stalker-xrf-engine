import { jest } from "@jest/globals";
import type { CUITextWnd } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

export class MockCUITextWnd extends MockCUIWindow {
  public static override mock(): CUITextWnd {
    return new MockCUITextWnd() as unknown as CUITextWnd;
  }

  public text: string = "";

  public SetText = jest.fn((text: string) => (this.text = text));

  public GetText = jest.fn(() => this.text);

  public SetTextAlignment = jest.fn();

  public SetEllipsis = jest.fn();
}
