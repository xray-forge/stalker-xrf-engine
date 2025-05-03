import { jest } from "@jest/globals";

/**
 * Mock XRF lua logger for simpler handling of logs that are used everywhere.
 */
export class MockNodeLogger {
  public static forFile = jest.fn((prefix) => new MockNodeLogger(prefix));
  public error = jest.fn();
  public warn = jest.fn();
  public info = jest.fn();
}
