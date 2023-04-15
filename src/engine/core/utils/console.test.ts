import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { executeConsoleCommand, getConsoleFloatCommand } from "@/engine/core/utils/console";
import { consoleCommands } from "@/engine/lib/constants/console_commands";
import { gameDifficulties } from "@/engine/lib/constants/game_difficulties";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";
import { resetMethodMock } from "@/fixtures/xray/mocks/utils.mock";

describe("'console' utils", () => {
  beforeEach(() => {
    resetMethodMock(gameConsole.execute);
    resetMethodMock(gameConsole.get_float);
  });

  it("'executeConsoleCommand' should correctly generate commands", () => {
    executeConsoleCommand(consoleCommands.g_game_difficulty, gameDifficulties.gd_master);
    expect(gameConsole.execute).toHaveBeenCalledWith("g_game_difficulty gd_master");

    resetMethodMock(gameConsole.execute);
    executeConsoleCommand(consoleCommands.disconnect);
    expect(gameConsole.execute).toHaveBeenCalledWith("disconnect");

    resetMethodMock(gameConsole.execute);
    executeConsoleCommand(consoleCommands.start, "server(all/single/alife/new)", "client(localhost)");
    expect(gameConsole.execute).toHaveBeenCalledWith("start server(all/single/alife/new) client(localhost)");
  });

  it("'getConsoleFloatCommand' should correctly generate commands", () => {
    gameConsole.get_float = jest.fn((cmd: string) => (cmd === "snd_volume_eff" ? 50.4 : -1));

    expect(getConsoleFloatCommand(consoleCommands.snd_volume_eff)).toBe(50.4);
    expect(gameConsole.get_float).toHaveBeenCalledWith("snd_volume_eff");
  });
});
