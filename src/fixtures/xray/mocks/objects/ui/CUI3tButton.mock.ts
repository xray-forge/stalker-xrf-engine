import { jest } from "@jest/globals";
import type { CUI3tButton } from "xray16";

import { MockCUILines } from "@/fixtures/xray";
import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock CUI button.
 */
export class MockCUI3tButton extends MockCUIWindow {
  public static override mock(): CUI3tButton {
    return new MockCUI3tButton() as unknown as CUI3tButton;
  }

  public textControl = new MockCUILines();

  public SetText = jest.fn();

  public TextControl = jest.fn(() => this.textControl);
}
