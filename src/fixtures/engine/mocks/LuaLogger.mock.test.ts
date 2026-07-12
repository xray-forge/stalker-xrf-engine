import { describe, expect, it } from "@jest/globals";

import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";

const loggerMethods = ["error", "warn", "info"] as const;

describe("MockLuaLogger", () => {
  it.each(loggerMethods)("should accept matching arguments for %s", (method) => {
    const logger: MockLuaLogger = new MockLuaLogger();

    logger[method]("Value: %s %%", "test");

    expect(logger[method]).toHaveBeenCalledWith("Value: %s %%", "test");
  });

  it.each(loggerMethods)("should reject missing arguments for %s", (method) => {
    const logger: MockLuaLogger = new MockLuaLogger();

    expect(() => logger[method]("Values: %s %s", "first")).toThrow(
      'Logger format expects 2 argument(s), but received 1: "Values: %s %s"',
    );
  });

  it.each(loggerMethods)("should reject extra arguments for %s", (method) => {
    const logger: MockLuaLogger = new MockLuaLogger();

    expect(() => logger[method]("Value: %s", "first", "second")).toThrow(
      'Logger format expects 1 argument(s), but received 2: "Value: %s"',
    );
  });

  it.each(loggerMethods)("should reject incompatible arguments for %s", (method) => {
    const logger: MockLuaLogger = new MockLuaLogger();

    expect(() => logger[method]("Value: %d", "not a number")).toThrow();
  });
});
