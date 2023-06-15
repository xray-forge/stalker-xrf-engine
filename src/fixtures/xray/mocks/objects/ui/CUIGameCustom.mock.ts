import { jest } from "@jest/globals";
import { CUIWindow } from "xray16";

import { MockStaticDrawableWrapper } from "@/fixtures/xray/mocks/objects/ui/StaticDrawableWrapper.mock";

/**
 * Mock game hud UI element.
 */
export class MockCUIGameCustom {
  public customStatic: Record<string, MockStaticDrawableWrapper> = {};

  public AddCustomStatic = jest.fn((id: string, b: boolean, n: number) => {
    this.customStatic[id] = new MockStaticDrawableWrapper(id);
  });
  public RemoveCustomStatic = jest.fn((id: string) => {
    delete this.customStatic[id];
  });

  public AddDialogToRender = jest.fn((window: CUIWindow) => null);
  public CurrentItemAtCell = jest.fn(() => null);
  public GetCustomStatic = jest.fn((id: string) => {
    return this.customStatic[id] || null;
  });
  public HideActorMenu = jest.fn(() => {});
  public HidePdaMenu = jest.fn(() => {});
  public RemoveDialogToRender = jest.fn((window: CUIWindow) => {});
  public UpdateActorMenu = jest.fn(() => {});
  public enable_fake_indicators = jest.fn((enabled: boolean) => {});
  public hide_messages = jest.fn(() => {});
  public show_messages = jest.fn(() => {});
  public update_fake_indicators = jest.fn((u8: number, enabled: boolean | number) => {});
}
