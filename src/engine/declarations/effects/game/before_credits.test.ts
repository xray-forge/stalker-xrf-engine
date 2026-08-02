import { beforeAll, describe, expect, it } from "@jest/globals";
import { CConsole, get_console } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/before_credits");
});

describe("before_credits", () => {
  it("should hide menu before credits", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("before_credits", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu off");
  });
});
