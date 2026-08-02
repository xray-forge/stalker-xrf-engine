import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { setSquadPosition } from "@/engine/core/objects/squad/utils";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/position/teleport_squad");
});

jest.mock("@/engine/core/objects/squad/utils");

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

describe("teleport_squad", () => {
  it("should teleport squads", () => {
    expect(() => callXrEffect("teleport_squad", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_squad' effect."
    );

    expect(() => {
      callXrEffect("teleport_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", "test-wp");
    }).toThrow("There is no squad with story id 'test-sid'.");

    const squad: Squad = MockSquad.mock();

    registerStoryLink(squad.id, "test-sid-squad");

    callXrEffect("teleport_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-squad", "test-wp", 1);

    expect(setSquadPosition).toHaveBeenCalledWith(squad, new patrol("test-wp").point(1));
  });
});
