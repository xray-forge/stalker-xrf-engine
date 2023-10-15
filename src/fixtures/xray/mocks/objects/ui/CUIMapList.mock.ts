import { jest } from "@jest/globals";
import type { CUIMapList } from "xray16";

export class MockCUIMapList {
  public static mock(): CUIMapList {
    return new MockCUIMapList() as unknown as CUIMapList;
  }

  public SetWeatherSelector = jest.fn();

  public SetModeSelector = jest.fn();

  public SetMapPic = jest.fn();

  public SetMapInfo = jest.fn();

  public OnModeChange = jest.fn();

  public GetCurGameType = jest.fn();
}
