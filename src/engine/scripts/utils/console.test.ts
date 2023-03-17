import { describe, expect, it, jest } from "@jest/globals";

import { console_commands } from "@/engine/lib/constants/console_commands";
import { game_difficulties } from "@/engine/lib/constants/game_difficulties";
import { executeConsoleCommand } from "@/engine/scripts/utils/console";
import { gameConsole } from "@/fixtures/xray/console.mock";
import { resetMethodMock } from "@/fixtures/xray/utils.mock";

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
