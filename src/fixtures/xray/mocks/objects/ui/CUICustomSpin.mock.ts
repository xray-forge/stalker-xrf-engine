import { jest } from "@jest/globals";
import { CUICustomSpin } from "xray16";

import { MockCUIWindow } from "@/fixtures/xray/mocks/objects/ui/CUIWindow.mock";

export class MockCUICustomSpin extends MockCUIWindow {
  public static override mock(): CUICustomSpin {
    return new MockCUICustomSpin() as unknown as CUICustomSpin;
  }

  public text: string = "test-cs";

  public GetText = jest.fn(() => this.text);
}
