import { jest } from "@jest/globals";
import type { CUIWindow } from "xray16";

import { Optional, TName } from "@/engine/lib/types";
import { MockVector2D } from "@/fixtures/xray";
import { MockFrect } from "@/fixtures/xray/mocks/frect.mock";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * Mock base window class.
 */
export class MockCUIWindow extends MockLuabindClass {
  public static mock(): CUIWindow {
    return new MockCUIWindow() as unknown as CUIWindow;
  }

  public isEnabled: boolean = false;
  public isShown: boolean = false;
  public isAutoDelete: boolean = false;

  public children: Array<MockCUIWindow> = [];

  public windowName: Optional<TName> = null;
  public windowRect: Optional<MockFrect> = null;
  public windowPosition: Optional<MockVector2D> = null;
  public windowSize: Optional<MockVector2D> = null;

  public Enable(isEnabled: boolean): void {
    this.isEnabled = isEnabled;
  }

  public Show(isShown: boolean): void {
    this.isShown = isShown;
  }

  public GetWidth(): number {
    return this.windowSize?.y ?? -1;
  }

  public GetHeight(): number {
    return this.windowSize?.x ?? -1;
  }

  public SetAutoDelete = jest.fn((isAutoDelete: boolean): void => {
    this.isAutoDelete = isAutoDelete;
  });

  public SetWndPos(position: MockVector2D): void {
    this.windowPosition = position;
  }

  public SetWndSize(size: MockVector2D): void {
    this.windowSize = size;
  }

  public SetWndRect(rect: MockFrect): void {
    this.windowRect = rect;
  }

  public SetWindowName(name: TName): void {
    this.windowName = name;
  }

  public AttachChild(window: MockCUIWindow): void {
    this.children.push(window);
  }

  public WindowName(): Optional<TName> {
    return this.windowName;
  }

  public OnKeyboard(): boolean {
    return true;
  }
}
