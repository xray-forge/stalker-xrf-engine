import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/give_item_b29");
});

beforeEach(() => {
  resetRegistry();
});

describe("give_item_b29", () => {
  it("should request the active artefact from the marked anomaly zone", () => {
    const { actorGameObject } = mockRegisteredActor();
    const pickArtefact = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").pick_artefact_from_anomaly = pickArtefact;
    giveInfoPortion(infoPortions.zat_b29_bring_af_16);
    giveInfoPortion("zat_b55_anomal_zone");

    callXrEffect("give_item_b29", actorGameObject, MockGameObject.mock(), "target-story");

    expect(pickArtefact).toHaveBeenCalledWith(actorGameObject, null, [
      "target-story",
      "zat_b55_anomal_zone",
      artefacts.af_gravi,
    ]);
    expect(hasInfoPortion("zat_b55_anomal_zone")).toBe(false);
  });
});
