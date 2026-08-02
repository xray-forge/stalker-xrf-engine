import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/enable_ui");
});

beforeEach(() => {
  resetRegistry();
});

describe("enable_ui", () => {
  it("should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "enableGameUi").mockImplementation(jest.fn());

    callXrEffect("enable_ui", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.enableGameUi).toHaveBeenCalledWith(true);

    callXrEffect("enable_ui", MockGameObject.mockActor(), MockGameObject.mock(), TRUE);
    expect(manager.enableGameUi).toHaveBeenCalledWith(false);
  });
});
