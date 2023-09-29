import { CUITabControl } from "xray16";

import { Optional } from "@/engine/lib/types";
import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock generic tabs.
 */
export class MockCUITabControl extends MockCUIWindow {
  public static override mock(): CUITabControl {
    return new MockCUITabControl() as unknown as CUITabControl;
  }

  public activeTab: Optional<string> = null;

  public SetActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
