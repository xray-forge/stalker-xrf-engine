import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { getPortableStoreValue } from "@/engine/core/database";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/game/inc_counter");
});

beforeEach(() => {
  resetRegistry();
});

describe("inc_counter", () => {
  it("should correctly increment portable store count", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("inc_counter", actorGameObject, MockGameObject.mock())).not.toThrow();

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBeNull();

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(1);

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore");

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(2);

    callXrEffect("inc_counter", actorGameObject, MockGameObject.mock(), "test-pstore", 4);

    expect(getPortableStoreValue(ACTOR_ID, "test-pstore")).toBe(6);
  });
});
