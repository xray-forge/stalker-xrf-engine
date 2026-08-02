import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_b29_create_random_infop");
});

beforeEach(() => {
  resetRegistry();
});

describe("zat_b29_create_random_infop", () => {
  it("should retain exactly the requested number of candidate info portions", () => {
    const { actorGameObject } = mockRegisteredActor();

    getExtern<AnyCallablesModule>("xr_effects").zat_b29_create_random_infop(
      actorGameObject,
      MockGameObject.mock(),
      $fromArray([1, "test_infop_a", "test_infop_b"])
    );

    expect(hasInfoPortion("test_infop_a") === hasInfoPortion("test_infop_b")).toBe(false);
  });
});
