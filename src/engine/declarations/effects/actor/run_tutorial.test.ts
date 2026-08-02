import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { game } from "xray16";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/run_tutorial");
});

beforeEach(() => {
  resetFunctionMock(game.start_tutorial);
});

describe("run_tutorial", () => {
  it("should correctly run tutorials", () => {
    callXrEffect("run_tutorial", MockGameObject.mockActor(), MockGameObject.mock(), "custom_tutorial");
    expect(game.start_tutorial).toHaveBeenCalledTimes(1);
    expect(game.start_tutorial).toHaveBeenCalledWith("custom_tutorial");
  });
});
