import { beforeAll, describe, expect, it } from "@jest/globals";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { setPortableStoreValue } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/game/counter_greater");
});

describe("counter_greater", () => {
  it("should check counter value", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrCondition("counter_greater", actorGameObject, MockGameObject.mock())).toThrow(
      "Invalid parameters supplied for condition 'counter_greater'."
    );

    setPortableStoreValue(ACTOR_ID, "test_greater", 10);

    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_greater", 9)).toBe(true);
    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_greater", 10)).toBe(false);
    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_greater", 11)).toBe(false);

    expect(callXrCondition("counter_greater", actorGameObject, MockGameObject.mock(), "test_unknown", 11)).toBe(false);
  });
});
