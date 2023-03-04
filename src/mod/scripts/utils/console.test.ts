import { describe, expect, it, jest } from "@jest/globals";

import { gameConsole } from "@/fixtures/console";
import { resetMethodMock } from "@/fixtures/utils";
import { console_commands } from "@/mod/globals/console_commands";
import { game_difficulties } from "@/mod/globals/game_difficulties";
import { executeConsoleCommand } from "@/mod/scripts/utils/console";

describe("'console' utils", () => {
  it("'executeConsoleCommand' should correctly generate commands", () => {
    resetMethodMock(gameConsole.execute);
    executeConsoleCommand(console_commands.g_game_difficulty, game_difficulties.gd_master);
    expect(gameConsole.execute).toHaveBeenCalledWith("g_game_difficulty gd_master");

    resetMethodMock(gameConsole.execute);
    executeConsoleCommand(console_commands.disconnect);
    expect(gameConsole.execute).toHaveBeenCalledWith("disconnect");

    resetMethodMock(gameConsole.execute);
    executeConsoleCommand(console_commands.start, "server(all/single/alife/new)", "client(localhost)");
    expect(gameConsole.execute).toHaveBeenCalledWith("start server(all/single/alife/new) client(localhost)");
  });
});
