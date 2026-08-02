import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { ERelation, setSquadRelationWithObject } from "@/engine/core/utils/relation";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/set_squad_goodwill_to_npc");
});

jest.mock("@/engine/core/utils/relation");

beforeEach(() => {
  resetFunctionMock(setSquadRelationWithObject);
});

describe("set_squad_goodwill_to_npc", () => {
  it("should change relation to an object", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("set_squad_goodwill_to_npc", MockGameObject.mockActor(), object, "test-sid", ERelation.FRIEND);

    expect(setSquadRelationWithObject).toHaveBeenCalledTimes(1);
    expect(setSquadRelationWithObject).toHaveBeenCalledWith("test-sid", object, ERelation.FRIEND);
  });
});
