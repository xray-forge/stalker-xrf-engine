import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { getManager, registry } from "@/engine/core/database";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
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

/**
 * Verify a predicate flips once the provided section is in the actor inventory.
 */
function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

/**
 * Verify an action transfers the expected section from the NPC speaker to the actor.
 */
function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_a12/ransom");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("jup_a12_actor_has_15000_money", () => {
  it("should check the ransom money threshold", () => {
    mockActorWith([], { money: 14999 });
    expect(callDialogsBinding("jup_a12_actor_has_15000_money")).toBe(false);

    mockActorWith([], { money: 15000 });
    expect(callDialogsBinding("jup_a12_actor_has_15000_money")).toBe(true);
  });
});

describe("jup_a12_actor_do_not_has_15000_money", () => {
  it("should invert the ransom money threshold", () => {
    mockActorWith([], { money: 14999 });
    expect(callDialogsBinding("jup_a12_actor_do_not_has_15000_money")).toBe(true);

    mockActorWith([], { money: 15000 });
    expect(callDialogsBinding("jup_a12_actor_do_not_has_15000_money")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefacts", () => {
  it("should accept any of the four ransom artefacts", () => {
    expect(callDialogsBinding("jup_a12_actor_has_artefacts")).toBe(false);

    for (const artefact of [artefacts.af_fire, artefacts.af_gold_fish, artefacts.af_glass, artefacts.af_ice]) {
      mockActorWith([artefact]);
      expect(callDialogsBinding("jup_a12_actor_has_artefacts")).toBe(true);
    }
  });
});

describe("jup_a12_actor_has_artefact_1", () => {
  it("should accept only the fire artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_1", artefacts.af_fire);

    mockActorWith([artefacts.af_ice]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_1")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefact_2", () => {
  it("should accept only the gold fish artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_2", artefacts.af_gold_fish);

    mockActorWith([artefacts.af_fire]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_2")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefact_3", () => {
  it("should accept only the glass artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_3", artefacts.af_glass);

    mockActorWith([artefacts.af_fire]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_3")).toBe(false);
  });
});

describe("jup_a12_actor_has_artefact_4", () => {
  it("should accept only the ice artefact", () => {
    checkHasItemPredicate("jup_a12_actor_has_artefact_4", artefacts.af_ice);

    mockActorWith([artefacts.af_fire]);
    expect(callDialogsBinding("jup_a12_actor_has_artefact_4")).toBe(false);
  });
});

describe("jup_a12_actor_do_not_has_artefacts", () => {
  it("should invert the ransom artefact check", () => {
    expect(callDialogsBinding("jup_a12_actor_do_not_has_artefacts")).toBe(true);

    for (const artefact of [artefacts.af_fire, artefacts.af_gold_fish, artefacts.af_glass, artefacts.af_ice]) {
      mockActorWith([artefact]);
      expect(callDialogsBinding("jup_a12_actor_do_not_has_artefacts")).toBe(false);
    }
  });
});

describe("jup_a12_transfer_ransom_from_actor", () => {
  it("should take the money ransom when that option was chosen", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([], { money: 15000 });
    giveInfoPortion(infoPortions.jup_a12_ransom_by_money);

    callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 15000);
    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });

  it("should take the artefact matching the chosen ransom info portion", () => {
    const ransoms: Array<[TName, TSection]> = [
      ["jup_a12_af_fire", artefacts.af_fire],
      ["jup_a12_af_gold_fish", artefacts.af_gold_fish],
      ["jup_a12_af_glass", artefacts.af_glass],
      ["jup_a12_af_ice", artefacts.af_ice],
    ];

    for (const [portion, artefact] of ransoms) {
      const npc: GameObject = MockGameObject.mock();

      mockActorWith([artefact]);
      resetFunctionMock(transferItemsFromActor);
      giveInfoPortion(portion);

      callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, npc]);

      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefact);
    }
  });

  it("should take nothing when no ransom option was chosen", () => {
    callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, MockGameObject.mock()]);

    expect(transferMoneyFromActor).not.toHaveBeenCalled();
    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("jup_a12_transfer_5000_money_to_actor", () => {
  it("should pay money and reveal both treasures", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("jup_a12_transfer_5000_money_to_actor");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_40");
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_34");

    coordinates.mockRestore();
  });
});

describe("jup_a12_transfer_artefact_to_actor", () => {
  it("should give the gold fish without treasures by default", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    checkTransferToActor("jup_a12_transfer_artefact_to_actor", artefacts.af_gold_fish);

    expect(coordinates).not.toHaveBeenCalled();

    coordinates.mockRestore();
  });

  it("should also reveal both treasures once the prisoner was freed", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    giveInfoPortion(infoPortions.jup_a12_stalker_prisoner_free_dialog_done);

    callDialogsBinding("jup_a12_transfer_artefact_to_actor", [registry.actor, MockGameObject.mock()]);

    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_40");
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_34");

    coordinates.mockRestore();
  });
});

describe("jup_a12_transfer_cashier_money_from_actor", () => {
  it("should take the randomly rolled amount when the actor can afford it", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 30);
    mockActorWith([], { money: 10000 });

    callDialogsBinding("jup_a12_transfer_cashier_money_from_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 3000);
  });

  it("should cap the amount at what the actor actually owns", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 50);
    mockActorWith([], { money: 1200 });

    callDialogsBinding("jup_a12_transfer_cashier_money_from_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1200);
  });
});
