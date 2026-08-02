import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/disable_ui_only");
});

beforeEach(() => {
  resetRegistry();
});

describe("disable_ui_only", () => {
  it("should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableGameUiOnly").mockImplementation(jest.fn());

    callXrEffect("disable_ui_only", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableGameUiOnly).toHaveBeenCalledTimes(1);
  });
});
