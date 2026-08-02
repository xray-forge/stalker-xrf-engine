import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ERelation, setSquadRelationToActor } from "@/engine/core/utils/relation";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/set_squad_neutral_to_actor");
});

jest.mock("@/engine/core/utils/relation");

beforeEach(() => {
  resetRegistry();
  resetFunctionMock(setSquadRelationToActor);
  registerSimulator();
});

describe("set_squad_neutral_to_actor", () => {
  it("should change relation", () => {
    const squad: Squad = MockSquad.mock();

    registerStoryLink(squad.id, "test-sid");

    expect(() => {
      callXrEffect(
        "set_squad_neutral_to_actor",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-not-existing"
      );
    }).not.toThrow();

    callXrEffect("set_squad_neutral_to_actor", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid");

    expect(setSquadRelationToActor).toHaveBeenCalledTimes(1);
    expect(setSquadRelationToActor).toHaveBeenCalledWith(squad, ERelation.NEUTRAL);
  });
});
