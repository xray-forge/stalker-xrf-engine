import { describe, expect, it, jest } from "@jest/globals";
import { log, print_stack, time_global } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging/LuaLogger";
import { toJSON } from "@/engine/core/utils/transform/json";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";

describe("LuaLogger class", () => {
  const logging: { LuaLogger: typeof LuaLogger } = jest.requireActual("@/engine/core/utils/logging/LuaLogger");
  const Logger: typeof LuaLogger = logging.LuaLogger;

  it("LuaLogger should correctly initialize", () => {
    const logger: LuaLogger = new Logger("tst");

    expect(logger.prefix).toBe("[tst]");
    expect(logger.isEnabled).toBe(true);

    expect(new Logger("another", { isEnabled: false }).isEnabled).toBe(false);
  });

  it("LuaLogger should correctly handle enabled-disabled state", () => {
    const logger: LuaLogger = new Logger("tst");

    jest.spyOn(logger, "logAs").mockImplementation(() => {});

    logger.isEnabled = false;
    gameConfig.DEBUG.IS_LOG_ENABLED = false;

    logger.info("test");
    expect(logger.logAs).not.toHaveBeenCalled();

    logger.isEnabled = true;

    logger.info("test");
    expect(logger.logAs).not.toHaveBeenCalled();

    gameConfig.DEBUG.IS_LOG_ENABLED = true;

    logger.info("test");
    expect(logger.logAs).toHaveBeenCalled();
  });

  it("LuaLogger should correctly call log", () => {
    const logger: LuaLogger = new Logger("tst");

    resetFunctionMock(log);
    replaceFunctionMock(time_global, () => 1000);

    logger.warn("test");
    logger.info("test");
    logger.error("test");
    logger.pushEmptyLine();
    logger.pushSeparator();

    expect(log).toHaveBeenCalledTimes(5);
    expect(log).toHaveBeenNthCalledWith(1, "[1000][tst][warn] test");
    expect(log).toHaveBeenNthCalledWith(2, "[1000][tst][info] test");
    expect(log).toHaveBeenNthCalledWith(3, "[1000][tst][error] test");
    expect(log).toHaveBeenNthCalledWith(4, "[1000][tst][info]  ");
    expect(log).toHaveBeenNthCalledWith(5, "[1000][tst][info] =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
  });

  it("LuaLogger should correctly generate prefix", () => {
    replaceFunctionMock(time_global, () => 1000);

    expect(new Logger("tst").getFullPrefix()).toBe("[1000][tst]");
    expect(new Logger("another").getFullPrefix()).toBe("[1000][another]");
  });

  it("LuaLogger should correctly print stack", () => {
    new Logger("tst").printStack();
    expect(print_stack).toHaveBeenCalledTimes(1);
  });

  it("LuaLogger should correctly print table", () => {
    const logger: LuaLogger = new Logger("tst");

    jest.spyOn(logger, "logAs").mockImplementation(() => {});

    logger.table({ test: true, another: 10 });

    expect(logger.logAs).toHaveBeenCalledWith("[table]", "[tst]", $fromArray([toJSON({ test: true, another: 10 })]));
  });

  it("LuaLogger should correctly print with logAs", () => {
    resetFunctionMock(log);

    const logger: LuaLogger = new Logger("tst");

    logger.logAs("[info]", "[prfx]", $fromArray(["a", "b", "c"]));

    expect(log).toHaveBeenCalledWith("[1000][prfx][info] a b c");
  });
});
