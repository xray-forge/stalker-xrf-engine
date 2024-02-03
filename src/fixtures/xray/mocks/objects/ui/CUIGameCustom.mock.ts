import { jest } from "@jest/globals";

import { MockStaticDrawableWrapper } from "@/fixtures/xray/mocks/objects/ui/StaticDrawableWrapper.mock";

/**
 * Mock game hud UI element.
 */
export class MockCUIGameCustom {
  public customStatic: Record<string, MockStaticDrawableWrapper> = {};

  public AddCustomStatic = jest.fn((id: string) => {
    this.customStatic[id] = new MockStaticDrawableWrapper(id);
  });
  public RemoveCustomStatic = jest.fn((id: string) => {
    delete this.customStatic[id];
  });

  public AddDialogToRender = jest.fn(() => null);
  public CurrentItemAtCell = jest.fn(() => null);
  public GetCustomStatic = jest.fn((id: string) => {
    return this.customStatic[id] || null;
  });
  public HideActorMenu = jest.fn(() => {});
  public HidePdaMenu = jest.fn(() => {});
  public RemoveDialogToRender = jest.fn(() => {});
  public UpdateActorMenu = jest.fn(() => {});
  public enable_fake_indicators = jest.fn(() => {});
  public hide_messages = jest.fn(() => {});
  public show_messages = jest.fn(() => {});
  public update_fake_indicators = jest.fn(() => {});
}
