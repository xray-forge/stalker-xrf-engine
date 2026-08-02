import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/oasis_heal");
});

beforeEach(() => {
  resetRegistry();
});

describe("oasis_heal", () => {
  it("should send vanilla condition deltas to xray actor properties", () => {
    const { actorGameObject: actor } = mockRegisteredActor({
      bleeding: 0.25,
      health: 0.5,
      power: 0.5,
      radiation: 0.25,
      satiety: 0.5,
    });

    callXrEffect("oasis_heal", MockGameObject.mockActor(), MockGameObject.mock());

    expect(actor.health).toBe(0.505);
    expect(actor.power).toBe(0.51);
    expect(actor.radiation).toBe(0.2);
    expect(actor.bleeding).toBe(0.2);
    expect(actor.satiety).toBe(0.51);
  });
  it("should not send health, power, radiation or bleeding deltas when thresholds are not met", () => {
    const { actorGameObject: actor } = mockRegisteredActor({
      bleeding: 0,
      health: 1,
      power: 1,
      radiation: 0,
      satiety: 0.5,
    });

    callXrEffect("oasis_heal", MockGameObject.mockActor(), MockGameObject.mock());

    expect(actor.health).toBe(1);
    expect(actor.power).toBe(1);
    expect(actor.radiation).toBe(0);
    expect(actor.bleeding).toBe(0);
    expect(actor.satiety).toBe(0.51);
  });
});
