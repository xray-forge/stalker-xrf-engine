import { StaticDrawableWrapper } from "xray16";

import { TStringId } from "@/engine/lib/types";
import { MockCUIStatic } from "@/fixtures/xray/mocks/objects/ui/CUIStatic.mock";

/**
 * Mock StaticDrawableWrapper.
 */
export class MockStaticDrawableWrapper {
  public static mock(id: string): StaticDrawableWrapper {
    return new MockStaticDrawableWrapper(id) as unknown as StaticDrawableWrapper;
  }

  public readonly id: TStringId;
  public readonly uiStatic: MockCUIStatic = new MockCUIStatic();

  public constructor(id: string) {
    this.id = id;
  }

  public wnd(): MockCUIStatic {
    return this.uiStatic;
  }
}
