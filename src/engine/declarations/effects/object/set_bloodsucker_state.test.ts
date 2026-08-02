import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/set_bloodsucker_state");
});

beforeEach(() => {
  resetRegistry();
});

describe("set_bloodsucker_state", () => {
  it("should switch bloodsuckers", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object)).toThrow(
      "Wrong parameters in function 'set_bloodsucker_state'"
    );

    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object, "1");
    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), object, "default");

    expect(object.force_visibility_state).toHaveBeenNthCalledWith(1, 1);
    expect(object.force_visibility_state).toHaveBeenNthCalledWith(2, -1);
  });

  it("should resolve the target from the story id and take the state from the second parameter", () => {
    const target: GameObject = MockGameObject.mock();

    registerObject(target);
    registerStoryLink(target.id(), "bloodsucker-sid");

    callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), MockGameObject.mock(), "bloodsucker-sid", "1");
    expect(target.force_visibility_state).toHaveBeenCalledWith(1);

    callXrEffect(
      "set_bloodsucker_state",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "bloodsucker-sid",
      "default"
    );
    expect(target.force_visibility_state).toHaveBeenCalledWith(-1);
  });

  it("should do nothing when neither the speaker nor the story id resolves an object", () => {
    expect(() =>
      callXrEffect("set_bloodsucker_state", MockGameObject.mockActor(), null as unknown as GameObject, "missing", "1")
    ).not.toThrow();
  });
});
