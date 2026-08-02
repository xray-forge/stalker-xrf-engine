import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/disable_actor_nightvision");
});

beforeEach(() => {
  resetRegistry();
});

describe("disable_actor_nightvision", () => {
  it("should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "disableActorNightVision").mockImplementation(jest.fn());

    callXrEffect("disable_actor_nightvision", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.disableActorNightVision).toHaveBeenCalledTimes(1);
  });
});
