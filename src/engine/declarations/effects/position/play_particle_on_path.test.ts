import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { Patrol } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { MockGameObject, MockParticleObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/position/play_particle_on_path");
});

describe("play_particle_on_path", () => {
  it("should play particles", () => {
    jest.spyOn(math, "random").mockImplementation(() => 20);

    expect(() => {
      callXrEffect("play_particle_on_path", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();

    callXrEffect(
      "play_particle_on_path",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-particle",
      "test-wp",
      10
    );

    expect(MockParticleObject.REGISTRY.size).toBe(1);
    expect(MockParticleObject.REGISTRY.get("test-particle")).not.toBeNull();

    const first: Nillable<MockParticleObject> = MockParticleObject.REGISTRY.get("test-particle");
    const path: Patrol = new patrol("test-wp");

    expect(first?.play_at_pos).toHaveBeenCalledTimes(0);

    callXrEffect(
      "play_particle_on_path",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-particle",
      "test-wp",
      20
    );

    expect(MockParticleObject.REGISTRY.size).toBe(1);
    expect(MockParticleObject.REGISTRY.get("test-particle")).not.toBeNull();

    const second: Nillable<MockParticleObject> = MockParticleObject.REGISTRY.get("test-particle");

    expect(second?.play_at_pos).toHaveBeenCalledTimes(3);
    expect(second?.play_at_pos).toHaveBeenCalledWith(path.point(0));
    expect(second?.play_at_pos).toHaveBeenCalledWith(path.point(1));
    expect(second?.play_at_pos).toHaveBeenCalledWith(path.point(2));
  });
});
