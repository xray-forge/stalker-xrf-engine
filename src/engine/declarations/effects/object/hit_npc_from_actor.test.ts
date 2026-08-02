import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/hit_npc_from_actor");
});

beforeEach(() => {
  resetRegistry();
});

describe("hit_npc_from_actor", () => {
  it("should hit object from actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const target: GameObject = MockGameObject.mock();

    callXrEffect("hit_npc_from_actor", actor, target);

    expect(target.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bip01_spine", draftsman: actor, impulse: 0.001, power: 0.001 })
    );
  });

  it("should hit the story object when one is named", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "hit-target-sid");

    callXrEffect("hit_npc_from_actor", MockGameObject.mockActor(), MockGameObject.mock(), "hit-target-sid");

    expect(target.hit).toHaveBeenCalledTimes(1);
  });
});
