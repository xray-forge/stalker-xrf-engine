import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { ERelation, updateSquadIdRelationToActor } from "@/engine/core/utils/relation";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/set_squad_goodwill");
});

jest.mock("@/engine/core/utils/relation");

beforeEach(() => {
  resetFunctionMock(updateSquadIdRelationToActor);
});

describe("set_squad_goodwill", () => {
  it("should change squad relation to actor", () => {
    callXrEffect("set_squad_goodwill", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", ERelation.FRIEND);

    expect(updateSquadIdRelationToActor).toHaveBeenCalledTimes(1);
    expect(updateSquadIdRelationToActor).toHaveBeenCalledWith("test-sid", ERelation.FRIEND);
  });
});
