import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pas_b400_stop_particle");
});

beforeEach(() => {
  resetRegistry();
});

describe("pas_b400_stop_particle", () => {
  it("should stop acidic particles on the registered actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    callXrEffect("pas_b400_stop_particle", actorGameObject, MockGameObject.mock());

    expect(actorGameObject.stop_particles).toHaveBeenCalledWith("zones\\zone_acidic_idle", "bip01_head");
  });
});
