import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { communities } from "@/engine/constants/communities";
import { registerSimulator } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/is_factions_enemies");
});

describe("is_factions_enemies", () => {
  it("should check actor and faction state", () => {
    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.bandit)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.stalker)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.monolith)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_enemies", MockGameObject.mockActor(), MockGameObject.mock(), communities.monster)
    ).toBe(true);
  });
});
