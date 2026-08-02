import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

/**
 * Re-register the actor carrying the provided sections, dropping any previously given info portions.
 *
 * Inventory keys are index-suffixed so repeating the same section registers separate items, while
 * `object(section)` lookups still resolve by section.
 */
function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b220/hunts");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

describe("jupiter_b220_all_hunted", () => {
  it("should report pending hunts until every one is told", () => {
    const portions = [
      infoPortions.jup_b220_trapper_bloodsucker_lair_hunted_told,
      infoPortions.jup_b220_trapper_zaton_chimera_hunted_told,
      infoPortions.jup_b211_swamp_bloodsuckers_hunt_done,
      infoPortions.jup_b208_burers_hunt_done,
      infoPortions.jup_b212_jupiter_chimera_hunt_done,
    ];

    for (const portion of portions) {
      expect(callDialogsBinding("jupiter_b220_all_hunted")).toBe(true);
      giveInfoPortion(portion);
    }

    expect(callDialogsBinding("jupiter_b220_all_hunted")).toBe(false);
  });
});

describe("jupiter_b220_no_one_hunted", () => {
  it("should report nothing to tell by default", () => {
    expect(callDialogsBinding("jupiter_b220_no_one_hunted")).toBe(true);
  });

  it("should report a pending report for every completed but untold hunt", () => {
    const pending: Array<Array<TName>> = [
      [
        infoPortions.jup_b220_trapper_about_himself_told,
        infoPortions.zat_b57_den_of_the_bloodsucker_tell_stalkers_about_destroy_lair_give,
      ],
      [infoPortions.zat_b106_chimera_dead],
      [infoPortions.jup_b6_all_hunters_are_dead],
      [infoPortions.jup_b208_burers_dead],
      [infoPortions.jup_b212_jupiter_chimera_dead],
    ];

    for (const portions of pending) {
      mockActorWith([]);

      for (const portion of portions) {
        giveInfoPortion(portion);
      }

      expect(callDialogsBinding("jupiter_b220_no_one_hunted")).toBe(false);
    }
  });
});
