import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/scenario_autosave");
});

jest.mock("@/engine/core/utils/game_save");

beforeEach(() => {
  resetFunctionMock(createGameAutoSave);
});

describe("scenario_autosave", () => {
  it("should create autosaves", () => {
    expect(createGameAutoSave).toHaveBeenCalledTimes(0);

    callXrEffect("scenario_autosave", MockGameObject.mockActor(), MockGameObject.mock());

    expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  });
});
