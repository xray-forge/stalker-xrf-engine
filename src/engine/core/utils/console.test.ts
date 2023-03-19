import { describe, expect, it } from "@jest/globals";

import { executeConsoleCommand } from "@/engine/core/utils/console";
import { console_commands } from "@/engine/lib/constants/console_commands";
import { game_difficulties } from "@/engine/lib/constants/game_difficulties";
import { gameConsole } from "@/fixtures/xray/mocks/console.mock";
import { resetMethodMock } from "@/fixtures/xray/mocks/utils.mock";

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
