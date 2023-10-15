import type { CUISpinNum } from "xray16";

import { MockCUICustomSpin } from "@/fixtures/xray/mocks/objects/ui/CUICustomSpin.mock";

export class MockCUISpinNum extends MockCUICustomSpin {
  public static override mock(): CUISpinNum {
    return new MockCUISpinNum() as unknown as CUISpinNum;
  }
}
