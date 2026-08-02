import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { GameObject, ServerObject } from "xray16/alias";
import { MockAlifeObject, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, resetStalkerState } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker");

beforeAll(() => {
  require("@/engine/declarations/effects/position/teleport_npc_by_story_id");
});

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

describe("teleport_npc_by_story_id", () => {
  it("should teleport objects by story ids", () => {
    expect(() => callXrEffect("teleport_npc_by_story_id", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_npc_by_story_id' function."
    );

    expect(() => {
      callXrEffect(
        "teleport_npc_by_story_id",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid",
        "test-wp"
      );
    }).toThrow("There is no story object with id 'test-sid'.");

    const first: GameObject = MockGameObject.mock();
    const second: ServerObject = MockAlifeObject.mock();

    registerStoryLink(first.id(), "test-sid-1");
    registerStoryLink(second.id, "test-sid-2");

    callXrEffect(
      "teleport_npc_by_story_id",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-sid-1",
      "test-wp"
    );

    expect(resetStalkerState).toHaveBeenCalledWith(first);
    expect(first.set_npc_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));

    callXrEffect(
      "teleport_npc_by_story_id",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-sid-2",
      "test-wp",
      2
    );

    expect(second.position).toBe(new patrol("test-wp").point(2));
  });
});
