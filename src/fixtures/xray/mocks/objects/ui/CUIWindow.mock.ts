import type { CUIWindow } from "xray16";

import { TName } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * Mock base window class.
 */
export class MockCUIWindow extends MockLuabindClass {
  public static mock(): CUIWindow {
    return new MockCUIWindow() as unknown as CUIWindow;
  }

  public SetWindowName(name: TName): void {}
}
