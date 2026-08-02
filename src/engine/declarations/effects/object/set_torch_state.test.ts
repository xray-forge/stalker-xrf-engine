import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { misc } from "@/engine/constants/items/misc";
import { registerObject, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/set_torch_state");
});

beforeEach(() => {
  resetRegistry();
});

describe("set_torch_state", () => {
  it("should switch actor torch state", () => {
    const torch: GameObject = MockGameObject.mock({ section: misc.device_torch });
    const object: GameObject = MockGameObject.mock({ inventory: [[misc.device_torch, torch]] });

    registerStoryLink(object.id(), "test-sid");

    expect(() => callXrEffect("set_torch_state", MockGameObject.mockActor(), object, "test-sid")).toThrow(
      "Not enough parameters in 'set_torch_state' function effect."
    );

    callXrEffect("set_torch_state", MockGameObject.mockActor(), object, "test-sid", "on");

    expect(torch.enable_attachable_item).toHaveBeenCalledTimes(1);
    expect(torch.enable_attachable_item).toHaveBeenCalledWith(true);

    callXrEffect("set_torch_state", MockGameObject.mockActor(), object, "test-sid", "off");

    expect(torch.enable_attachable_item).toHaveBeenCalledTimes(2);
    expect(torch.enable_attachable_item).toHaveBeenCalledWith(false);
  });

  it("should do nothing when the story object carries no torch", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    registerStoryLink(object.id(), "torchless-sid");

    expect(() =>
      callXrEffect("set_torch_state", MockGameObject.mockActor(), MockGameObject.mock(), "torchless-sid", "on")
    ).not.toThrow();
  });
});
