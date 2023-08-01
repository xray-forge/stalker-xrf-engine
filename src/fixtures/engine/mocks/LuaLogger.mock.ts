import { jest } from "@jest/globals";

/**
 * todo;
 */
export class MockLuaLogger {
  public error = jest.fn();
  public warn = jest.fn();
  public info = jest.fn();
  public format = jest.fn();
  public printStack = jest.fn();
}
