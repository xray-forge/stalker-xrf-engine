import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { FALSE, TRUE } from "xray16/lib";
import { MockGameObject, MockPatrol } from "xray16/mocks";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/hit_npc");
});

beforeEach(() => {
  resetRegistry();
});

describe("hit_npc", () => {
  it("should correctly hit objects", () => {
    const object: GameObject = MockGameObject.mock();
    const hitter: GameObject = MockGameObject.mock();

    registerObject(hitter);
    registerStoryLink(hitter.id(), "hitter");

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "hitter", null, "bone", 0.25, 10, FALSE);

    expect(object.hit).toHaveBeenCalledWith(
      expect.objectContaining({ boneName: "bone", draftsman: object, impulse: 10, power: 0.25 })
    );
  });

  it("should do nothing when the named hitter does not exist", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "missing-hitter", "bone", "1", 1, 1);

    expect(object.hit).not.toHaveBeenCalled();
  });

  it("should swap the draftsman and direction when reversed", () => {
    const object: GameObject = MockGameObject.mock();
    const hitter: GameObject = MockGameObject.mock();

    registerObject(hitter);
    registerStoryLink(hitter.id(), "hitter-sid");

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "hitter-sid", "bone", "1", 1, 1, TRUE);

    expect(object.hit).toHaveBeenCalledTimes(1);
  });

  it("should hit from a patrol point for the self variant in both directions", () => {
    const object: GameObject = MockGameObject.mock();

    MockPatrol.setup({
      "hit-path": {
        points: [{ flag: 0, gvid: 1, lvid: 2, name: "point", position: object.position() as never }],
      },
    });

    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "self", "hit-path", "bone", 1, 1);
    callXrEffect("hit_npc", MockGameObject.mockActor(), object, "self", "hit-path", "bone", 1, 1, TRUE);

    expect(object.hit).toHaveBeenCalledTimes(2);
  });
});
