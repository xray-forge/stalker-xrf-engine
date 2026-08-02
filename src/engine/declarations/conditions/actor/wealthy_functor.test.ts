import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/wealthy_functor");
});

describe("wealthy_functor", () => {
  it("should check wealth of the actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("wealthy_functor", actorGameObject, MockGameObject.mock())).toBe(false);

    giveInfoPortion("actor_wealthy");

    expect(callXrCondition("wealthy_functor", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
