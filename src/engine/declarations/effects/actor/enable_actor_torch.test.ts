import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/enable_actor_torch");
});

beforeEach(() => {
  resetRegistry();
});

describe("enable_actor_torch", () => {
  it("should correctly call manager methods", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "enableActorTorch").mockImplementation(jest.fn());

    callXrEffect("enable_actor_torch", MockGameObject.mockActor(), MockGameObject.mock());
    expect(manager.enableActorTorch).toHaveBeenCalledTimes(1);
  });
});
