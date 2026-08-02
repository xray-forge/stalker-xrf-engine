import { beforeAll, describe, expect, it } from "@jest/globals";
import { CConsole, get_console } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/on_tutor_gameover_stop");
});

describe("on_tutor_gameover_stop", () => {
  it("should handle game over scenario stop", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("on_tutor_gameover_stop", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu on");
  });
});
