import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { increaseCommunityGoodwillToId } from "@/engine/core/utils/relation";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/inc_faction_goodwill_to_actor");
});

jest.mock("@/engine/core/utils/relation");

beforeEach(() => {
  resetFunctionMock(increaseCommunityGoodwillToId);
});

describe("inc_faction_goodwill_to_actor", () => {
  it("should increment faction goodwill", () => {
    expect(() => {
      callXrEffect("inc_faction_goodwill_to_actor", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow("Wrong parameters in effect 'inc_faction_goodwill_to_actor'.");

    callXrEffect(
      "inc_faction_goodwill_to_actor",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "community_test",
      400
    );

    expect(increaseCommunityGoodwillToId).toHaveBeenCalledTimes(1);
    expect(increaseCommunityGoodwillToId).toHaveBeenCalledWith("community_test", 0, 400);
  });
});
