import { beforeEach, describe, expect, it } from "@jest/globals";
import { CConsole, get_console } from "xray16";

import { disconnectFromGame } from "@/engine/core/utils/game/game_flow";
import { resetFunctionMock } from "@/fixtures/jest";

describe("disconnectFromGame", () => {
  beforeEach(() => {
    resetFunctionMock(get_console().execute);
  });

  it("should correctly execute console commands", () => {
    const console: CConsole = get_console();

    disconnectFromGame();

    expect(console.execute).toHaveBeenCalledWith("disconnect");
  });
});
