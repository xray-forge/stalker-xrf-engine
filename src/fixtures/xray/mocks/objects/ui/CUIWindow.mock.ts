import { jest } from "@jest/globals";
import type { CUIWindow } from "xray16";

import { Optional, TName } from "@/engine/lib/types";
import { MockFrect } from "@/fixtures/xray/mocks/frect.mock";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";
import { MockVector2D } from "@/fixtures/xray/mocks/vector2.mock";

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
  public windowPosition: Optional<MockVector2D> = MockVector2D.create();
  public windowSize: Optional<MockVector2D> = null;

  public Enable = jest.fn((isEnabled: boolean) => {
    this.isEnabled = isEnabled;
  });

  public Show = jest.fn((isShown: boolean) => {
    this.isShown = isShown;
  });

  public GetWidth(): number {
    return this.windowSize?.y ?? -1;
  }

  public GetHeight(): number {
    return this.windowSize?.x ?? -1;
  }

  public SetAutoDelete = jest.fn((isAutoDelete: boolean) => {
    this.isAutoDelete = isAutoDelete;
  });

  public SetWndPos = jest.fn((position: MockVector2D) => {
    this.windowPosition = position;
  });

  public SetWndSize = jest.fn((size: MockVector2D) => {
    this.windowSize = size;
  });

  public GetWndPos = jest.fn(() => {
    return this.windowPosition;
  });

  public SetWndRect(rect: MockFrect): void {
    this.windowRect = rect;
  }

  public SetWindowName(name: TName): void {
    this.windowName = name;
  }

  public AttachChild(window: MockCUIWindow): void {
    this.children.push(window);
  }

  public WindowName = jest.fn(() => this.windowName);

  public SetFont = jest.fn();

  public OnKeyboard(): boolean {
    return true;
  }
}
