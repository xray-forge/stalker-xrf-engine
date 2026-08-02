import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/friend_of_stalkers_functor");
});

describe("friend_of_stalkers_functor", () => {
  it("should check friend of stalkers achievement", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("friend_of_stalkers_functor", actorGameObject, MockGameObject.mock())).toBe(false);

    giveInfoPortion("sim_stalker_help_harder");

    expect(callXrCondition("friend_of_stalkers_functor", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
