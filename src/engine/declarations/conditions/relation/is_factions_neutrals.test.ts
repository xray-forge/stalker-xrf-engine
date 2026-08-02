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
  require("@/engine/declarations/conditions/relation/is_factions_neutrals");
});

describe("is_factions_neutrals", () => {
  it("should check actor and faction state", () => {
    expect(callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
    expect(callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), null)).toBe(true);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.bandit)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.stalker)
    ).toBe(true);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.army)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.monolith)
    ).toBe(false);

    expect(
      callXrCondition("is_factions_neutrals", MockGameObject.mockActor(), MockGameObject.mock(), communities.monster)
    ).toBe(false);
  });
});
