import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { disconnectFromGame } from "@/engine/core/utils/game";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/game_disconnect");
});

jest.mock("@/engine/core/utils/game");

beforeEach(() => {
  resetFunctionMock(disconnectFromGame);
});

describe("game_disconnect", () => {
  it("should correctly disconnect from game", () => {
    expect(disconnectFromGame).toHaveBeenCalledTimes(0);

    callXrEffect("game_disconnect", MockGameObject.mockActor(), MockGameObject.mock());

    expect(disconnectFromGame).toHaveBeenCalledTimes(1);
  });
});
