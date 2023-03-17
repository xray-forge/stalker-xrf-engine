import { jest } from "@jest/globals";

/**
 * todo;
 */
export class LuaLoggerMock {
  public error = jest.fn();
  public info = jest.fn();
  public printStack = jest.fn();
}
