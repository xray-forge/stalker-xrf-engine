import { jest } from "@jest/globals";
import { type AnyArgs } from "xray16/lib";

/**
 * Mock XRF lua logger for simpler handling of logs that are used everywhere.
 */
export class MockLuaLogger {
  public static countFormatArguments(format: string): number {
    let count: number = 0;

    for (let index: number = 0; index < format.length; index += 1) {
      if (format[index] !== "%") {
        continue;
      }

      if (format[index + 1] === "%") {
        index += 1;
        continue;
      }

      count += 1;
    }

    return count;
  }

  public getFullPrefix = jest.fn(() => "[]");

  public info = jest.fn((format: string, ...args: AnyArgs): void => {
    const expectedArguments: number = MockLuaLogger.countFormatArguments(format);

    if (expectedArguments !== args.length) {
      throw new Error(
        `Logger format expects ${expectedArguments} argument(s), but received ${args.length}: "${format}"`
      );
    }

    string.format(format, ...args);
  });

  public printStack = jest.fn();

  public pushSeparator = jest.fn();
}
