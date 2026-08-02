import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { getPortableStoreValue } from "@/engine/core/database";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/dec_counter");
  require("@/engine/declarations/effects/game/inc_counter");
});

beforeEach(() => {
  resetRegistry();
});

describe("dec_counter", () => {
  it("should correctly decrement portable store count", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("dec_counter", actorGameObject, MockGameObject.mock())).not.toThrow();

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 6);
    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(5);

    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(4);

    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 4);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(0);

    callXrEffect("dec_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 1000);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(0);
  });
});
