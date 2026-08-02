import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { registerStoryLink } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/relocate_item_b29");
});

beforeEach(() => {
  resetRegistry();
});

describe("relocate_item_b29", () => {
  it("should transfer the active artefact between resolved story objects", () => {
    const { actorGameObject } = mockRegisteredActor();
    const artefact: GameObject = MockGameObject.mock({ section: artefacts.af_gravi });
    const from: GameObject = MockGameObject.mock({ inventory: [[artefacts.af_gravi, artefact]] });
    const to: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.zat_b29_bring_af_16);
    registerStoryLink(from.id(), "from-story");
    registerStoryLink(to.id(), "to-story");

    callXrEffect("relocate_item_b29", actorGameObject, MockGameObject.mock(), "from-story", "to-story");

    expect(from.transfer_item).toHaveBeenCalledWith(artefact, to);
  });
});
