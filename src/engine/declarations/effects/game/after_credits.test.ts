import { beforeAll, describe, expect, it } from "@jest/globals";
import { CConsole, get_console } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/after_credits");
});

describe("after_credits", () => {
  it("should show menu after credits", () => {
    const console: CConsole = get_console();

    expect(console.execute).toHaveBeenCalledTimes(0);

    callXrEffect("after_credits", MockGameObject.mockActor(), MockGameObject.mock());

    expect(console.execute).toHaveBeenCalledTimes(1);
    expect(console.execute).toHaveBeenCalledWith("main_menu on");
  });
});
