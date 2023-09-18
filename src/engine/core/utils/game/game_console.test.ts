import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  executeConsoleCommand,
  executeConsoleCommandsFromSection,
  getConsoleFloatCommand,
} from "@/engine/core/utils/game/game_console";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockIniFile } from "@/fixtures/xray";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";

describe("'console' utils", () => {
  beforeEach(() => {
    resetFunctionMock(gameConsole.execute);
    resetFunctionMock(gameConsole.get_float);
  });

  it("'executeConsoleCommand' should correctly generate commands", () => {
    executeConsoleCommand(consoleCommands.g_game_difficulty, gameDifficulties.gd_master);
    expect(gameConsole.execute).toHaveBeenCalledWith("g_game_difficulty gd_master");

    resetFunctionMock(gameConsole.execute);
    executeConsoleCommand(consoleCommands.disconnect);
    expect(gameConsole.execute).toHaveBeenCalledWith("disconnect");

    resetFunctionMock(gameConsole.execute);
    executeConsoleCommand(consoleCommands.start, "server(all/single/alife/new)", "client(localhost)");
    expect(gameConsole.execute).toHaveBeenCalledWith("start server(all/single/alife/new) client(localhost)");
  });

  it("'executeConsoleCommandsFromSection' should correctly execute commands from ini section", () => {
    executeConsoleCommandsFromSection("test");
    expect(gameConsole.execute).not.toHaveBeenCalled();

    executeConsoleCommandsFromSection("test", mockIniFile("test.ltx", {}));
    expect(gameConsole.execute).not.toHaveBeenCalled();

    executeConsoleCommandsFromSection(
      "test",
      mockIniFile("test.ltx", {
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
      mockIniFile("test.ltx", {
        another: {
          c: "b a",
        },
      })
    );

    expect(gameConsole.execute).toHaveBeenCalledTimes(1);
    expect(gameConsole.execute).toHaveBeenCalledWith("c b a");
  });

  it("'getConsoleFloatCommand' should correctly generate commands", () => {
    gameConsole.get_float = jest.fn((cmd: string) => (cmd.startsWith("snd_volume_eff") ? 50.4 : -1));

    expect(getConsoleFloatCommand(consoleCommands.snd_volume_eff)).toBe(50.4);
    expect(gameConsole.get_float).toHaveBeenCalledWith("snd_volume_eff");

    expect(getConsoleFloatCommand(consoleCommands.snd_volume_eff, 1, 2)).toBe(50.4);
    expect(gameConsole.get_float).toHaveBeenNthCalledWith(2, "snd_volume_eff 1 2");
  });
});
