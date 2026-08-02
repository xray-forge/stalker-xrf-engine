import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pas_b400_play_particle");
});

beforeEach(() => {
  resetRegistry();
});

describe("pas_b400_play_particle", () => {
  it("should start acidic particles on the registered actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    callXrEffect("pas_b400_play_particle", actorGameObject, MockGameObject.mock());

    expect(actorGameObject.start_particles).toHaveBeenCalledWith("zones\\zone_acidic_idle", "bip01_head");
  });
});
