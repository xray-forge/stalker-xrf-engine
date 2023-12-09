import { jest } from "@jest/globals";

/**
 * Mock XRF lua logger for simpler handling of logs that are used everywhere.
 */
export class MockLuaLogger {
  public getFullPrefix = jest.fn(() => "[]");
  public error = jest.fn();
  public warn = jest.fn();
  public info = jest.fn();
  public format = jest.fn();
  public printStack = jest.fn();
  public pushSeparator = jest.fn();
}
