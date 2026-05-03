import { jest } from "@jest/globals";

/**
 * Mock XRF lua logger for simpler handling of logs that are used everywhere.
 */
export class MockNodeLogger {
  public static forFile = jest.fn((prefix: string) => new MockNodeLogger(prefix));

  public constructor(public readonly prefix?: string) {}

  public error = jest.fn();
  public warn = jest.fn();
  public info = jest.fn();
}
