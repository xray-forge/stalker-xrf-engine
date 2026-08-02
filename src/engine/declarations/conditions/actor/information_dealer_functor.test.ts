import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/information_dealer_functor");
});

describe("information_dealer_functor", () => {
  it("should check info dealer achievement", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("information_dealer_functor", actorGameObject, MockGameObject.mock())).toBe(false);

    giveInfoPortion("actor_information_dealer");

    expect(callXrCondition("information_dealer_functor", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
