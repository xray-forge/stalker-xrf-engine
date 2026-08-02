import { beforeAll, describe, expect, it } from "@jest/globals";
import { CConsole, get_console } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/game_over");
  require("@/engine/declarations/effects/game/game_credits");
});

describe("game_over", () => {
  it("should correctly trigger game over", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("game_over", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("game_credits", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("game_over", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu on");
  });
});
