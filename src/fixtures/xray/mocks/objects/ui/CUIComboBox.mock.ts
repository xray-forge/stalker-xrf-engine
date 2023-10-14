import type { CUIComboBox } from "xray16";

export class MockCUIComboBox {
  public static mock(): CUIComboBox {
    return new MockCUIComboBox() as unknown as CUIComboBox;
  }
}
