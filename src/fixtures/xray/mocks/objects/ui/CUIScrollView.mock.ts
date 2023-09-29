import { CUIScrollView } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock generic scroll view.
 */
export class MockCUIScrollView extends MockCUIWindow {
  public static override mock(): CUIScrollView {
    return new MockCUIScrollView() as unknown as CUIScrollView;
  }

  public AddWindow(window: MockCUIWindow, flag: boolean): void {
    // Mock.
  }
}
