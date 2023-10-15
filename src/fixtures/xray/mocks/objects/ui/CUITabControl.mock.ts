import { jest } from "@jest/globals";
import { CUITabControl } from "xray16";

import { Optional } from "@/engine/lib/types";
import { MockCUI3tButton } from "@/fixtures/xray/mocks/objects/ui/CUI3tButton.mock";
import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock generic tabs.
 */
export class MockCUITabControl extends MockCUIWindow {
  public static override mock(): CUITabControl {
    return new MockCUITabControl() as unknown as CUITabControl;
  }

  public activeTab: Optional<string> = null;

  public SetActiveTab = jest.fn((tab: string) => {
    this.activeTab = tab;
  });

  public GetButtonById = jest.fn(() => MockCUI3tButton.mock());
}
