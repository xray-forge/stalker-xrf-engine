import { jest } from "@jest/globals";
import { CUITrackBar } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

/**
 * Mock generic trackbar.
 */
export class MockCUITrackBar extends MockCUIWindow {
  public static override mock(): CUITrackBar {
    return new MockCUITrackBar() as unknown as CUITrackBar;
  }

  public id: number = 1;

  public GetIValue = jest.fn(() => this.id);
  public SetCurrentValue = jest.fn(() => {});
}
