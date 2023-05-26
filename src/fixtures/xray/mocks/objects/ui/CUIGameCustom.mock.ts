import { jest } from "@jest/globals";
import { CUIWindow } from "xray16";

/**
 * Mock game hud UI element.
 */
export class MockCUIGameCustom {
  public AddCustomStatic = jest.fn((id: string, b: boolean, n: number) => null);
  public AddDialogToRender = jest.fn((window: CUIWindow) => null);
  public CurrentItemAtCell = jest.fn(() => null);
  public GetCustomStatic = jest.fn((value: string) => null);
  public HideActorMenu = jest.fn(() => {});
  public HidePdaMenu = jest.fn(() => {});
  public RemoveCustomStatic = jest.fn((id: string) => {});
  public RemoveDialogToRender = jest.fn((window: CUIWindow) => {});
  public UpdateActorMenu = jest.fn(() => {});
  public enable_fake_indicators = jest.fn((enabled: boolean) => {});
  public hide_messages = jest.fn(() => {});
  public show_messages = jest.fn(() => {});
  public update_fake_indicators = jest.fn((u8: number, enabled: boolean | number) => {});
}
