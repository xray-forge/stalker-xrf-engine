import type { CUIComboBox } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

export class MockCUIComboBox extends MockCUIWindow {
  public static override mock(): CUIComboBox {
    return new MockCUIComboBox() as unknown as CUIComboBox;
  }
}
