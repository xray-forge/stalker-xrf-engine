import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { openLogFile } from "@/engine/core/utils/logging/logging_files";
import { loggingRegistry } from "@/engine/core/utils/logging/logging_registry";

describe("openLogFile util", () => {
  beforeEach(() => {
    for (const [key] of loggingRegistry) {
      loggingRegistry.delete(key);
    }
  });

  it("should correctly open new files for logging", () => {
    expect(loggingRegistry.length()).toBe(0);

    const first: LuaFile = openLogFile("test");

    expect(loggingRegistry.length()).toBe(1);
    expect(loggingRegistry.get("test")).not.toBeNull();

    const second: LuaFile = openLogFile("test");

    expect(loggingRegistry.length()).toBe(1);
    expect(first).toBe(second);

    expect(first.setvbuf).toHaveBeenCalledTimes(1);
    expect(first.setvbuf).toHaveBeenCalledWith("line");
    expect(io.open).toHaveBeenCalledWith("$logs$\\xrf_test.log", "w");
  });

  it("should handle exception if file is not open", () => {
    jest.spyOn(io, "open").mockImplementationOnce(() => $multi(undefined, "", 0));

    expect(() => openLogFile("failing")).toThrow("Could not open file for logging: '$logs$\\xrf_failing.log'.");
  });
});
