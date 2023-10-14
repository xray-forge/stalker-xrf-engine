import type { CUISpinNum } from "xray16";

export class MockCUISpinNum {
  public static mock(): CUISpinNum {
    return new MockCUISpinNum() as unknown as CUISpinNum;
  }
}
