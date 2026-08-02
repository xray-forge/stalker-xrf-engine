import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/save_actor_position");
});

beforeEach(() => {
  resetRegistry();
});

describe("save_actor_position", () => {
  it("should save actor position", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("save_actor_position", actorGameObject, MockGameObject.mock())).not.toThrow();
  });
});
