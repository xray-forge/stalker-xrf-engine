import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/make_enemy");
});

beforeEach(() => {
  resetRegistry();
});

describe("make_enemy", () => {
  it("should make object enemy to actor", () => {
    const source: GameObject = MockGameObject.mock();
    const target: GameObject = MockGameObject.mock();

    registerObject(source);
    registerStoryLink(source.id(), "source");

    callXrEffect("make_enemy", MockGameObject.mockActor(), target, "source");

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bip01_spine", draftsman: source, impulse: 0.03, power: 0.03 })
    );
  });

  it("should hit the explicitly named target instead of the speaker", () => {
    const from: GameObject = MockGameObject.mock();
    const to: GameObject = MockGameObject.mock();

    registerObject(from);
    registerObject(to);
    registerStoryLink(from.id(), "enemy-from-sid");
    registerStoryLink(to.id(), "enemy-to-sid");

    callXrEffect("make_enemy", MockGameObject.mockActor(), MockGameObject.mock(), "enemy-from-sid", "enemy-to-sid");

    expect(to.hit).toHaveBeenCalledTimes(1);
  });
});
