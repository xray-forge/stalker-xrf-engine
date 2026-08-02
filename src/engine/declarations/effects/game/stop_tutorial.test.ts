import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { game } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/stop_tutorial");
});

beforeEach(() => {
  resetFunctionMock(game.stop_tutorial);
});

describe("stop_tutorial", () => {
  it("should handle stop tutorial", () => {
    expect(game.stop_tutorial).toHaveBeenCalledTimes(0);

    callXrEffect("stop_tutorial", MockGameObject.mockActor(), MockGameObject.mock());

    expect(game.stop_tutorial).toHaveBeenCalledTimes(1);
  });
});
