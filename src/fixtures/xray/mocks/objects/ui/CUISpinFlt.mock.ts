import { CUISpinFlt } from "xray16";

import { MockCUICustomSpin } from "@/fixtures/xray/mocks/objects/ui/CUICustomSpin.mock";

export class MockCUISpinFlt extends MockCUICustomSpin {
  public static override mock(): CUISpinFlt {
    return new MockCUISpinFlt() as unknown as CUISpinFlt;
  }
}
