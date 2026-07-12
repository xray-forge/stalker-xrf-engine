import { describe, expect, it } from "@jest/globals";

import { MockLuaLogger } from "@/fixtures/engine/mocks/LuaLogger.mock";

describe("MockLuaLogger", () => {
  it("should accept matching arguments for %s", () => {
    const logger: MockLuaLogger = new MockLuaLogger();

    logger.info("Value: %s %%", "test");

    expect(logger.info).toHaveBeenCalledWith("Value: %s %%", "test");
  });

  it("should reject missing arguments for %s", () => {
    const logger: MockLuaLogger = new MockLuaLogger();

    expect(() => logger.info("Values: %s %s", "first")).toThrow(
      'Logger format expects 2 argument(s), but received 1: "Values: %s %s"'
    );
  });

  it("should reject extra arguments for %s", () => {
    const logger: MockLuaLogger = new MockLuaLogger();

    expect(() => logger.info("Value: %s", "first", "second")).toThrow(
      'Logger format expects 1 argument(s), but received 2: "Value: %s"'
    );
  });

  it("should reject incompatible arguments for %s", () => {
    const logger: MockLuaLogger = new MockLuaLogger();

    expect(() => logger.info("Value: %d", "not a number")).toThrow();
  });
});
