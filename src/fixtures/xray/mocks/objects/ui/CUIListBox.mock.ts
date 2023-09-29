import type { CUIListBox } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock CUI list box.
 */
export class MockCUIListBox extends MockCUIWindow {
  public static override mock(): CUIListBox {
    return new MockCUIListBox() as unknown as CUIListBox;
  }

  public ShowSelectedItem(): void {}

  public RemoveAll(): void {}
}
