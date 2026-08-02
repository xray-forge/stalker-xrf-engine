import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/disable_ui");
});

beforeEach(() => {
  resetRegistry();
});

describe("disable_ui", () => {
  it("should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableGameUi").mockImplementation(jest.fn());

    callXrEffect("disable_ui", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableGameUi).toHaveBeenCalledWith(true);

    callXrEffect("disable_ui", MockGameObject.mockActor(), MockGameObject.mock(), TRUE);
    expect(manager.disableGameUi).toHaveBeenCalledWith(false);
  });
});
