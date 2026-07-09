import { beforeEach, describe, expect, it } from "@jest/globals";
import { Console } from "xray16/alias";
import { MockConsole, MockIniFile } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { executeConsoleCommandsFromSection } from "@/engine/core/utils/console";

describe("executeConsoleCommandsFromSection", () => {
  const gameConsole: Console = MockConsole.getInstanceMock();

  beforeEach(() => {
    const gameConsole: Console = MockConsole.getInstanceMock();

    resetFunctionMock(gameConsole.execute);
    resetFunctionMock(gameConsole.get_float);
  });

  it("should correctly execute commands from ini section", () => {
    executeConsoleCommandsFromSection("test");
    expect(gameConsole.execute).not.toHaveBeenCalled();

    executeConsoleCommandsFromSection("test", MockIniFile.mock("test.ltx", {}));
    expect(gameConsole.execute).not.toHaveBeenCalled();

    executeConsoleCommandsFromSection(
      "test",
      MockIniFile.mock("test.ltx", {
        test: {
          a: 1,
          b: 2,
        },
      })
    );

    expect(gameConsole.execute).toHaveBeenCalledTimes(2);
    expect(gameConsole.execute).toHaveBeenNthCalledWith(1, "a 1");
    expect(gameConsole.execute).toHaveBeenNthCalledWith(2, "b 2");

    resetFunctionMock(gameConsole.execute);

    executeConsoleCommandsFromSection(
      "another",
      MockIniFile.mock("test.ltx", {
        another: {
          c: "b a",
        },
      })
    );

    expect(gameConsole.execute).toHaveBeenCalledTimes(1);
    expect(gameConsole.execute).toHaveBeenCalledWith("c b a");
  });
});
