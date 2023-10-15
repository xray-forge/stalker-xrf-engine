import type { CUIMapInfo } from "xray16";

export class MockCUIMapInfo {
  public static mock(): CUIMapInfo {
    return new MockCUIMapInfo() as unknown as CUIMapInfo;
  }
}
