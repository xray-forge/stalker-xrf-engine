import { beforeAll, describe, expect, it } from "@jest/globals";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { setPortableStoreValue } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/game/counter_equal");
});

describe("counter_equal", () => {
  it("should check counter value", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrCondition("counter_equal", actorGameObject, MockGameObject.mock())).toThrow(
      "Invalid parameters supplied for condition 'counter_equal'."
    );

    setPortableStoreValue(ACTOR_ID, "test_one", 1);
    setPortableStoreValue(ACTOR_ID, "test_two", 2);

    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_one", 1)).toBe(true);
    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_one", 2)).toBe(false);

    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_two", 1)).toBe(false);
    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_two", 2)).toBe(true);

    expect(callXrCondition("counter_equal", actorGameObject, MockGameObject.mock(), "test_three", 10)).toBe(false);
  });
});
