import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { isBlackScreen } from "@/engine/core/utils/game";
import { callXrCondition } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/game");
beforeAll(() => {
  require("@/engine/declarations/conditions/game/black_screen");
});

describe("black_screen", () => {
  it("should check if black screen is active", () => {
    replaceFunctionMock(isBlackScreen, () => false);
    expect(callXrCondition("black_screen", MockGameObject.mock(), MockGameObject.mock())).toBe(false);

    replaceFunctionMock(isBlackScreen, () => true);
    expect(callXrCondition("black_screen", MockGameObject.mock(), MockGameObject.mock())).toBe(true);
  });
});
