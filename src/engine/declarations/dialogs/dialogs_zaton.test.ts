import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { helmets } from "@/engine/constants/items/helmets";
import { misc } from "@/engine/constants/items/misc";
import { outfits } from "@/engine/constants/items/outfits";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getManager, registerStoryLink, registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/treasures";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import {
  zatB29AfTable,
  zatB29InfopBringTable,
  zatB29InfopTable,
} from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
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
 * Verify a money threshold predicate flips exactly at the provided amount.
 */
function checkMoneyPredicate(name: TName, amount: TCount, expectedWhenEnough: boolean = true): void {
  mockActorWith([], { money: amount - 1 });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expectedWhenEnough);

  mockActorWith([], { money: amount });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expectedWhenEnough);
}

/**
 * Verify a money reward action pays exactly the expected amount.
 */
function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
}

/**
 * Verify an action takes the expected money amount from the actor.
 */
function checkMoneyTransfer(name: TName, amount: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  expect(transferMoneyFromActor).toHaveBeenCalledTimes(1);
  expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, amount);
}

/**
 * Verify an action transfers the expected section from the actor to the NPC speaker.
 */
function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
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

/**
 * Verify a sale takes the item, pays the reward, and optionally records the sold info portion.
 */
function checkSale(name: TName, section: TSection, reward: TCount, soldInfo?: TInfoPortion): void {
  const npc: GameObject = MockGameObject.mock();

  mockActorWith([section]);

  callDialogsBinding(name, [registry.actor, npc]);

  expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  expect(giveMoneyToActor).toHaveBeenCalledWith(reward);

  if (soldInfo) {
    expect(registry.actor.has_info(soldInfo)).toBe(true);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/effects/game/set_counter");
  require("@/engine/declarations/effects/game/dec_counter");
  require("@/engine/declarations/dialogs/dialogs_zaton");
  require("@/engine/declarations/dialogs/zaton/zat_b29/advanced_artefacts");
  require("@/engine/declarations/dialogs/zaton/zat_b29/advanced_artefacts_variants");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();

  registry.simulator = MockAlifeSimulator.getInstance();

  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("zat_b30_owl_stalker_trader_actor_has_item_to_sell", () => {
  it("should report nothing to sell with an empty inventory", () => {
    expect(callDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell")).toBe(false);
  });

  it("should accept a plain sellable quest item", () => {
    mockActorWith([questItems.zat_b20_noah_pda]);

    expect(callDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell")).toBe(true);
  });

  it("should only offer the gated items while their discussion info portion is unset", () => {
    const gated: Array<[TSection, TInfoPortion]> = [
      [questItems.jup_b1_half_artifact, infoPortions.zat_b30_owl_stalker_about_halfart_jup_b6_asked],
      [artefacts.af_quest_b14_twisted, infoPortions.zat_b30_owl_stalker_about_halfart_zat_b14_asked],
      [artefacts.af_oasis_heart, infoPortions.zat_b30_owl_stalker_trader_about_osis_art],
    ];

    for (const [section, askedPortion] of gated) {
      mockActorWith([section]);
      expect(callDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell")).toBe(true);

      registry.actor.give_info_portion(askedPortion);
      expect(callDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell")).toBe(false);
    }
  });

  it("should ignore the scientific detector until the second detector info portion is set", () => {
    mockActorWith([detectors.detector_scientific]);
    expect(callDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell")).toBe(false);

    registry.actor.give_info_portion(infoPortions.zat_b30_second_detector);
    expect(callDialogsBinding("zat_b30_owl_stalker_trader_actor_has_item_to_sell")).toBe(true);
  });
});

describe("zat_b30_owl_can_say_about_heli", () => {
  it("should stop offering the topic once all three helicopters are known", () => {
    const pairs: Array<[TInfoPortion, TInfoPortion]> = [
      [infoPortions.zat_b28_heli_3_searched, infoPortions.zat_b30_owl_scat_1],
      [infoPortions.zat_b100_heli_2_searched, infoPortions.zat_b30_owl_scat_2],
      [infoPortions.zat_b101_heli_5_searched, infoPortions.zat_b30_owl_scat_3],
    ];

    for (const [searched] of pairs) {
      expect(callDialogsBinding("zat_b30_owl_can_say_about_heli")).toBe(true);
      registry.actor.give_info_portion(searched);
    }

    expect(callDialogsBinding("zat_b30_owl_can_say_about_heli")).toBe(false);
  });

  it("should also count an already scattered topic as known", () => {
    for (const portion of [
      infoPortions.zat_b30_owl_scat_1,
      infoPortions.zat_b30_owl_scat_2,
      infoPortions.zat_b30_owl_scat_3,
    ]) {
      registry.actor.give_info_portion(portion);
    }

    expect(callDialogsBinding("zat_b30_owl_can_say_about_heli")).toBe(false);
  });
});

describe("zat_b30_actor_has_1000", () => {
  it("should check the 1000 money threshold", () => {
    checkMoneyPredicate("zat_b30_actor_has_1000", 1000);
  });
});

describe("zat_b30_actor_has_200", () => {
  it("should check the 200 money threshold", () => {
    checkMoneyPredicate("zat_b30_actor_has_200", 200);
  });
});

describe("zat_b30_actor_has_pri_b36_monolith_hiding_place_pda", () => {
  it("should check the monolith hiding place PDA", () => {
    checkHasItemPredicate(
      "zat_b30_actor_has_pri_b36_monolith_hiding_place_pda",
      questItems.pri_b36_monolith_hiding_place_pda
    );
  });
});

describe("zat_b30_actor_has_pri_b306_envoy_pda", () => {
  it("should check the envoy PDA", () => {
    checkHasItemPredicate("zat_b30_actor_has_pri_b306_envoy_pda", questItems.pri_b306_envoy_pda);
  });
});

describe("zat_b30_actor_has_jup_b10_strelok_notes_1", () => {
  it("should check the first Strelok note", () => {
    checkHasItemPredicate("zat_b30_actor_has_jup_b10_strelok_notes_1", questItems.jup_b10_notes_01);
  });
});

describe("zat_b30_actor_has_jup_b10_strelok_notes_2", () => {
  it("should check the second Strelok note", () => {
    checkHasItemPredicate("zat_b30_actor_has_jup_b10_strelok_notes_2", questItems.jup_b10_notes_02);
  });
});

describe("zat_b30_actor_has_jup_b10_strelok_notes_3", () => {
  it("should check the third Strelok note", () => {
    checkHasItemPredicate("zat_b30_actor_has_jup_b10_strelok_notes_3", questItems.jup_b10_notes_03);
  });
});

describe("zat_b30_actor_has_detector_scientific", () => {
  it("should check the scientific detector", () => {
    checkHasItemPredicate("zat_b30_actor_has_detector_scientific", detectors.detector_scientific);
  });
});

describe("zat_b30_actor_has_device_flash_snag", () => {
  it("should check the flash snag device", () => {
    checkHasItemPredicate("zat_b30_actor_has_device_flash_snag", questItems.device_flash_snag);
  });
});

describe("zat_b30_actor_has_device_pda_port_bandit_leader", () => {
  it("should check the bandit leader PDA", () => {
    checkHasItemPredicate("zat_b30_actor_has_device_pda_port_bandit_leader", questItems.device_pda_port_bandit_leader);
  });
});

describe("zat_b30_actor_has_jup_b10_ufo_memory", () => {
  it("should check the second UFO memory", () => {
    checkHasItemPredicate("zat_b30_actor_has_jup_b10_ufo_memory", questItems.jup_b10_ufo_memory_2);
  });
});

describe("zat_b30_actor_has_jup_b202_bandit_pda", () => {
  it("should check the b202 bandit PDA", () => {
    checkHasItemPredicate("zat_b30_actor_has_jup_b202_bandit_pda", questItems.jup_b202_bandit_pda);
  });
});

describe("zat_b30_transfer_1000", () => {
  it("should take 1000 money", () => {
    checkMoneyTransfer("zat_b30_transfer_1000", 1000);
  });
});

describe("zat_b30_transfer_200", () => {
  it("should take 200 money", () => {
    checkMoneyTransfer("zat_b30_transfer_200", 200);
  });
});

describe("zat_b30_sell_pri_b36_monolith_hiding_place_pda", () => {
  it("should sell the monolith hiding place PDA", () => {
    checkSale("zat_b30_sell_pri_b36_monolith_hiding_place_pda", questItems.pri_b36_monolith_hiding_place_pda, 5000);
  });
});

describe("zat_b30_sell_pri_b306_envoy_pda", () => {
  it("should sell the envoy PDA", () => {
    checkSale("zat_b30_sell_pri_b306_envoy_pda", questItems.pri_b306_envoy_pda, 4000);
  });
});

describe("zat_b30_sell_jup_b207_merc_pda_with_contract", () => {
  it("should sell the contract PDA and record the sale", () => {
    checkSale(
      "zat_b30_sell_jup_b207_merc_pda_with_contract",
      questItems.jup_b207_merc_pda_with_contract,
      1000,
      infoPortions.jup_b207_merc_pda_with_contract_sold
    );
  });
});

describe("zat_b30_sell_jup_b10_strelok_notes_1", () => {
  it("should sell the first Strelok note", () => {
    checkSale("zat_b30_sell_jup_b10_strelok_notes_1", questItems.jup_b10_notes_01, 500);
  });
});

describe("zat_b30_sell_jup_b10_strelok_notes_2", () => {
  it("should sell the second Strelok note", () => {
    checkSale("zat_b30_sell_jup_b10_strelok_notes_2", questItems.jup_b10_notes_02, 500);
  });
});

describe("zat_b30_sell_jup_b10_strelok_notes_3", () => {
  it("should sell the third Strelok note", () => {
    checkSale("zat_b30_sell_jup_b10_strelok_notes_3", questItems.jup_b10_notes_03, 500);
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", () => {
  it("should sell the evacuation info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
      questItems.jup_a9_evacuation_info,
      750,
      infoPortions.jup_a9_evacuation_info_sold
    );
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", () => {
  it("should sell the meeting info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
      questItems.jup_a9_meeting_info,
      750,
      infoPortions.jup_a9_meeting_info_sold
    );
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", () => {
  it("should sell the losses info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
      questItems.jup_a9_losses_info,
      750,
      infoPortions.jup_a9_losses_info_sold
    );
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", () => {
  it("should sell the delivery info and record the sale", () => {
    checkSale(
      "jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
      questItems.jup_a9_delivery_info,
      750,
      infoPortions.jup_a9_delivery_info_sold
    );
  });
});

describe("zat_b30_owl_stalker_trader_sell_device_flash_snag", () => {
  it("should sell the flash snag and record the sale", () => {
    checkSale(
      "zat_b30_owl_stalker_trader_sell_device_flash_snag",
      questItems.device_flash_snag,
      200,
      infoPortions.device_flash_snag_sold
    );
  });
});

describe("zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader", () => {
  it("should sell the bandit leader PDA and record the sale", () => {
    checkSale(
      "zat_b30_owl_stalker_trader_sell_device_pda_port_bandit_leader",
      questItems.device_pda_port_bandit_leader,
      1000,
      infoPortions.device_pda_port_bandit_leader_sold
    );
  });
});

describe("zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory", () => {
  it("should sell the second UFO memory and record the sale", () => {
    checkSale(
      "zat_b30_owl_stalker_trader_sell_jup_b10_ufo_memory",
      questItems.jup_b10_ufo_memory_2,
      500,
      infoPortions.jup_b10_ufo_memory_2_sold
    );
  });
});

describe("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda", () => {
  it("should sell the b202 bandit PDA", () => {
    checkSale("zat_b30_owl_stalker_trader_sell_jup_b202_bandit_pda", questItems.jup_b202_bandit_pda, 500);
  });
});

describe("zat_b14_bar_transfer_money", () => {
  it("should pay the bar task reward", () => {
    checkMoneyReward("zat_b14_bar_transfer_money", 1000);
  });
});

describe("zat_b14_transfer_artefact", () => {
  it("should take the twisted artefact", () => {
    checkTransferFromActor("zat_b14_transfer_artefact", artefacts.af_quest_b14_twisted);
  });
});

describe("actor_has_artefact", () => {
  it("should check the twisted artefact on the first speaker", () => {
    checkHasItemPredicate("actor_has_artefact", artefacts.af_quest_b14_twisted);
  });
});

describe("actor_hasnt_artefact", () => {
  it("should invert the twisted artefact check", () => {
    checkHasItemPredicate("actor_hasnt_artefact", artefacts.af_quest_b14_twisted, false);
  });
});

describe("zat_b7_give_bandit_reward_to_actor", () => {
  it("should pay a randomized reward and reveal the treasure", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    jest.spyOn(math, "random").mockImplementation(() => 20);

    callDialogsBinding("zat_b7_give_bandit_reward_to_actor");

    expect(giveMoneyToActor).toHaveBeenCalledWith(2000);
    expect(coordinates).toHaveBeenCalledWith("zat_hiding_place_30");

    coordinates.mockRestore();
  });
});

describe("zat_b7_give_stalker_reward_to_actor", () => {
  it("should hand over the drug pack matching the rolled variant", () => {
    const variants: Array<[TCount, TSection, TCount]> = [
      [1, drugs.bandage, 6],
      [2, drugs.medkit, 2],
      [3, drugs.antirad, 3],
    ];
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    for (const [roll, section, count] of variants) {
      const npc: GameObject = MockGameObject.mock();

      resetFunctionMock(transferItemsToActor);
      jest.spyOn(math, "random").mockImplementation(() => roll);

      callDialogsBinding("zat_b7_give_stalker_reward_to_actor", [registry.actor, npc]);

      expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
      expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.vodka, 4);
    }

    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_29");

    giveTreasureCoordinates.mockRestore();
  });
});

describe("zat_b7_give_stalker_reward_2_to_actor", () => {
  it("should hand over the fixed drug pack", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b7_give_stalker_reward_2_to_actor", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 2);
  });
});

describe("zat_b7_rob_actor", () => {
  it("should take the rolled share of the actor money", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 80);
    mockActorWith([], { money: 1000 });

    callDialogsBinding("zat_b7_rob_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 800);
  });

  it("should never take more than the actor owns", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 100);
    mockActorWith([], { money: 0 });

    callDialogsBinding("zat_b7_rob_actor", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 0);
  });
});

describe("zat_b7_squad_alive", () => {
  it("should follow the victims squad story object existence", () => {
    expect(callDialogsBinding("zat_b7_squad_alive")).toBe(false);

    registerStoryLink(MockAlifeHumanStalker.mock().id, "zat_b7_stalkers_victims_1");
    expect(callDialogsBinding("zat_b7_squad_alive")).toBe(true);
  });
});

describe("zat_b7_killed_self_precond", () => {
  it("should require the squad to be gone and both info portions unset", () => {
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(true);

    registerStoryLink(MockAlifeHumanStalker.mock().id, "zat_b7_stalkers_victims_1");
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(false);
  });

  it("should close once either meeting info portion is set", () => {
    registry.actor.give_info_portion(infoPortions.zat_b7_stalkers_raiders_meet);
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(false);

    mockActorWith([]);
    registry.actor.give_info_portion(infoPortions.zat_b7_victims_disappeared);
    expect(callDialogsBinding("zat_b7_killed_self_precond")).toBe(false);
  });
});

describe("zat_b103_transfer_merc_supplies", () => {
  it("should move up to six food items to the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([
      food.conserva,
      food.conserva,
      food.conserva,
      food.kolbasa,
      food.kolbasa,
      food.bread,
      food.bread,
      food.bread,
    ]);

    callDialogsBinding("zat_b103_transfer_merc_supplies", [registry.actor, npc]);

    expect(MockGameObject.asMock(registry.actor).transfer_item).toHaveBeenCalledTimes(6);
  });

  it("should move nothing when the actor carries no food", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b103_transfer_merc_supplies", [registry.actor, npc]);

    expect(MockGameObject.asMock(registry.actor).transfer_item).not.toHaveBeenCalled();
  });
});

describe("zat_b33_set_counter_10", () => {
  it("should set the items counter to ten", () => {
    callDialogsBinding("zat_b33_set_counter_10", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(10);
  });
});

describe("zat_b33_counter_ge_2", () => {
  it("should check the items counter against two", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 1);
    expect(callDialogsBinding("zat_b33_counter_ge_2")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 2);
    expect(callDialogsBinding("zat_b33_counter_ge_2")).toBe(true);
  });
});

describe("zat_b33_counter_ge_4", () => {
  it("should check the items counter against four", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 3);
    expect(callDialogsBinding("zat_b33_counter_ge_4")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 4);
    expect(callDialogsBinding("zat_b33_counter_ge_4")).toBe(true);
  });
});

describe("zat_b33_counter_ge_8", () => {
  it("should check the items counter against eight", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 7);
    expect(callDialogsBinding("zat_b33_counter_ge_8")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 8);
    expect(callDialogsBinding("zat_b33_counter_ge_8")).toBe(true);
  });
});

describe("zat_b33_counter_le_2", () => {
  it("should invert the counter check against two", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 1);
    expect(callDialogsBinding("zat_b33_counter_le_2", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 2);
    expect(callDialogsBinding("zat_b33_counter_le_2", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("zat_b33_counter_le_4", () => {
  it("should invert the counter check against four", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 3);
    expect(callDialogsBinding("zat_b33_counter_le_4", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 4);
    expect(callDialogsBinding("zat_b33_counter_le_4", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("zat_b33_counter_le_8", () => {
  it("should invert the counter check against eight", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 7);
    expect(callDialogsBinding("zat_b33_counter_le_8", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 8);
    expect(callDialogsBinding("zat_b33_counter_le_8", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("zat_b33_counter_de_2", () => {
  it("should decrement the items counter by two", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);

    callDialogsBinding("zat_b33_counter_de_2", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(8);
  });
});

describe("zat_b33_counter_de_4", () => {
  it("should decrement the items counter by four", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);

    callDialogsBinding("zat_b33_counter_de_4", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(6);
  });
});

describe("zat_b33_counter_de_8", () => {
  it("should decrement the items counter by eight and clamp at zero", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);
    callDialogsBinding("zat_b33_counter_de_8", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(2);

    callDialogsBinding("zat_b33_counter_de_8", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "zat_b33_items", 0)).toBe(0);
  });
});

describe("zat_b33_counter_eq_10", () => {
  it("should match only the exact counter value", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 9);
    expect(callDialogsBinding("zat_b33_counter_eq_10")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);
    expect(callDialogsBinding("zat_b33_counter_eq_10")).toBe(true);
  });
});

describe("zat_b33_counter_ne_10", () => {
  it("should invert the exact counter match", () => {
    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 9);
    expect(callDialogsBinding("zat_b33_counter_ne_10", [registry.actor, MockGameObject.mock()])).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b33_items", 10);
    expect(callDialogsBinding("zat_b33_counter_ne_10", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("zat_b103_transfer_mechanic_toolkit_2", () => {
  it("should take the second toolkit", () => {
    checkTransferFromActor("zat_b103_transfer_mechanic_toolkit_2", misc.toolkit_2);
  });
});

describe("check_npc_name_mechanics", () => {
  it("should accept a plain stalker speaker", () => {
    const npc: GameObject = MockGameObject.mock({ name: "zat_b30_stalker_1" });

    expect(callDialogsBinding("check_npc_name_mechanics", [registry.actor, npc])).toBe(true);
  });

  it("should reject every excluded speaker name", () => {
    for (const name of ["mechanic_stalker", "zat_b103_lost_merc_stalker", "tech_stalker", "zulus_stalker"]) {
      const npc: GameObject = MockGameObject.mock({ name });

      expect(callDialogsBinding("check_npc_name_mechanics", [registry.actor, npc])).toBe(false);
    }
  });

  it("should reject a speaker that is not a stalker at all", () => {
    const npc: GameObject = MockGameObject.mock({ name: "zat_b30_owl" });

    expect(callDialogsBinding("check_npc_name_mechanics", [registry.actor, npc])).toBe(false);
  });
});

describe("zat_b33_transfer_first_item", () => {
  it("should give the snag pistol", () => {
    callDialogsBinding("zat_b33_transfer_first_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.wpn_fort_snag);
  });
});

describe("zat_b33_transfer_second_item", () => {
  it("should give the medicine pack", () => {
    callDialogsBinding("zat_b33_transfer_second_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledTimes(3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.medkit_scientic, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.antirad, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.bandage, 5);
  });
});

describe("zat_b33_transfer_third_item", () => {
  it("should give the snag rifle", () => {
    callDialogsBinding("zat_b33_transfer_third_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.wpn_ak74u_snag);
  });
});

describe("zat_b33_transfer_fourth_item", () => {
  it("should give the soul artefact", () => {
    callDialogsBinding("zat_b33_transfer_fourth_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(artefacts.af_soul);
  });
});

describe("zat_b33_transfer_fifth_item", () => {
  it("should give the snag hardhat", () => {
    callDialogsBinding("zat_b33_transfer_fifth_item", [registry.actor, MockGameObject.mock()]);

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.helm_hardhat_snag);
  });
});

describe("zat_b33_transfer_safe_container", () => {
  it("should take the safe container", () => {
    checkTransferFromActor("zat_b33_transfer_safe_container", questItems.zat_b33_safe_container);
  });
});

describe("zat_b33_aractor_has_habar", () => {
  it("should check the safe container", () => {
    checkHasItemPredicate("zat_b33_aractor_has_habar", questItems.zat_b33_safe_container);
  });
});

describe("zat_b33_actor_hasnt_habar", () => {
  it("should invert the safe container check", () => {
    checkHasItemPredicate("zat_b33_actor_hasnt_habar", questItems.zat_b33_safe_container, false);
  });
});

describe("zat_b33_actor_has_needed_money", () => {
  it("should check the 500 money threshold", () => {
    checkMoneyPredicate("zat_b33_actor_has_needed_money", 500);
  });
});

describe("zat_b33_actor_hasnt_needed_money", () => {
  it("should invert the 500 money threshold", () => {
    checkMoneyPredicate("zat_b33_actor_hasnt_needed_money", 500, false);
  });
});

describe("zat_b33_relocate_money", () => {
  it("should take the money only when the actor can afford it", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([], { money: 499 });
    callDialogsBinding("zat_b33_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).not.toHaveBeenCalled();

    mockActorWith([], { money: 500 });
    callDialogsBinding("zat_b33_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 500);
  });
});

describe("zat_b29_create_af_in_anomaly", () => {
  it("should force the requested artefact into a zone matching the anomaly type", () => {
    const zone = { setForcedSpawnOverride: jest.fn() } as unknown as AnomalyZoneBinder;

    // Index 16 maps to the `gravi` anomaly type, whose first zone is zat_b14.
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);
    registry.anomalyZones.set("zat_b14_anomal_zone", zone);
    jest.spyOn(math, "random").mockImplementation(() => 1);

    callDialogsBinding("zat_b29_create_af_in_anomaly");

    expect(zone.setForcedSpawnOverride).toHaveBeenCalledWith(zatB29AfTable.get(16));
  });

  it("should resolve a different anomaly type for a later index", () => {
    const zone = { setForcedSpawnOverride: jest.fn() } as unknown as AnomalyZoneBinder;

    // Index 19 maps to the `electra` anomaly type, whose second zone is zat_b100.
    registry.actor.give_info_portion(zatB29InfopBringTable.get(19) as TInfoPortion);
    registry.anomalyZones.set("zat_b100_anomal_zone", zone);
    jest.spyOn(math, "random").mockImplementation(() => 2);

    callDialogsBinding("zat_b29_create_af_in_anomaly");

    expect(zone.setForcedSpawnOverride).toHaveBeenCalledWith(zatB29AfTable.get(19));
  });
});

describe("zat_b29_linker_give_adv_task", () => {
  it("should list every requested artefact and clear the bring markers", () => {
    registry.actor.give_info_portion(zatB29InfopTable.get(16));
    registry.actor.give_info_portion(zatB29InfopTable.get(17));
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);

    const result: string = callDialogsBinding<string>("zat_b29_linker_give_adv_task", [
      registry.actor,
      MockGameObject.mock(),
    ]);

    expect(result.endsWith(".")).toBe(true);
    expect(result.split(", ")).toHaveLength(2);
    expect(registry.actor.has_info(zatB29InfopBringTable.get(16) as TInfoPortion)).toBe(false);
  });

  it("should return just the terminator when nothing is requested", () => {
    expect(callDialogsBinding<string>("zat_b29_linker_give_adv_task", [registry.actor, MockGameObject.mock()])).toBe(
      "."
    );
  });
});

describe("zat_b29_actor_has_adv_task_af", () => {
  it("should require both the bring marker and the artefact", () => {
    expect(callDialogsBinding("zat_b29_actor_has_adv_task_af")).toBe(false);

    mockActorWith([zatB29AfTable.get(16)]);
    expect(callDialogsBinding("zat_b29_actor_has_adv_task_af")).toBe(false);

    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);
    expect(callDialogsBinding("zat_b29_actor_has_adv_task_af")).toBe(true);
  });
});

describe("zat_b29_actor_do_not_has_adv_task_af", () => {
  it("should invert the requested artefact check", () => {
    expect(callDialogsBinding("zat_b29_actor_do_not_has_adv_task_af")).toBe(true);

    mockActorWith([zatB29AfTable.get(16)]);
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);
    expect(callDialogsBinding("zat_b29_actor_do_not_has_adv_task_af")).toBe(false);
  });
});

describe("zat_b29_linker_get_adv_task_af", () => {
  it("should pay the lower tier reward for an early artefact", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([zatB29AfTable.get(16)]);
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);

    callDialogsBinding("zat_b29_linker_get_adv_task_af", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, zatB29AfTable.get(16));
    expect(giveMoneyToActor).toHaveBeenCalledWith(18000);
  });

  it("should pay the higher tier reward for a later artefact", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([zatB29AfTable.get(20)]);
    registry.actor.give_info_portion(zatB29InfopBringTable.get(20) as TInfoPortion);

    callDialogsBinding("zat_b29_linker_get_adv_task_af", [registry.actor, npc]);

    expect(giveMoneyToActor).toHaveBeenCalledWith(24000);
  });

  it("should reduce both rewards when the artefact came from a rival", () => {
    mockActorWith([zatB29AfTable.get(16)]);
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);
    registry.actor.give_info_portion("zat_b29_linker_take_af_from_rival" as TInfoPortion);
    callDialogsBinding("zat_b29_linker_get_adv_task_af", [registry.actor, MockGameObject.mock()]);
    expect(giveMoneyToActor).toHaveBeenLastCalledWith(12000);

    mockActorWith([zatB29AfTable.get(20)]);
    registry.actor.give_info_portion(zatB29InfopBringTable.get(20) as TInfoPortion);
    registry.actor.give_info_portion("zat_b29_linker_take_af_from_rival" as TInfoPortion);
    callDialogsBinding("zat_b29_linker_get_adv_task_af", [registry.actor, MockGameObject.mock()]);
    expect(giveMoneyToActor).toHaveBeenLastCalledWith(18000);
  });
});

describe("zat_b29_actor_has_exchange_item", () => {
  it("should remember a valuable weapon found in the actor inventory", () => {
    expect(callDialogsBinding("zat_b29_actor_has_exchange_item")).toBe(false);

    mockActorWith([weapons.wpn_groza]);

    expect(callDialogsBinding("zat_b29_actor_has_exchange_item")).toBe(true);
    expect((registry.actor as AnyObject).goodGun).toBe(weapons.wpn_groza);
  });

  it("should ignore weapons that are not on the valuable list", () => {
    mockActorWith([weapons.wpn_pm]);

    expect(callDialogsBinding("zat_b29_actor_has_exchange_item")).toBe(false);
  });
});

describe("zat_b29_actor_exchange", () => {
  it("should swap the remembered weapon for the requested artefact", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([weapons.wpn_groza]);
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);
    (registry.actor as AnyObject).goodGun = weapons.wpn_groza;

    callDialogsBinding("zat_b29_actor_exchange", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, zatB29AfTable.get(16));
    expect((registry.actor as AnyObject).goodGun).toBeNull();
  });

  it("should do nothing without a remembered weapon", () => {
    (registry.actor as AnyObject).goodGun = null;
    registry.actor.give_info_portion(zatB29InfopBringTable.get(16) as TInfoPortion);

    callDialogsBinding("zat_b29_actor_exchange", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("zat_b30_transfer_percent", () => {
  it("should pay the rolled share for every accumulated day and reset the counter", () => {
    jest.spyOn(math, "random").mockImplementation(() => 10);
    setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 3);

    callDialogsBinding("zat_b30_transfer_percent", [registry.actor, MockGameObject.mock()]);

    expect(giveMoneyToActor).toHaveBeenCalledWith(3000);
    expect(getPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 0)).toBe(0);
  });
});

describe("zat_b30_npc_has_detector", () => {
  it("should check the scientific detector on the NPC speaker", () => {
    expect(callDialogsBinding("zat_b30_npc_has_detector", [registry.actor, MockGameObject.mock()])).toBe(false);

    const npc: GameObject = MockGameObject.mock({
      inventory: [[detectors.detector_scientific, MockGameObject.mock({ section: detectors.detector_scientific })]],
    });

    expect(callDialogsBinding("zat_b30_npc_has_detector", [registry.actor, npc])).toBe(true);
  });
});

describe("zat_b30_actor_second_exchange", () => {
  it("should give the scientific detector", () => {
    checkTransferToActor("zat_b30_actor_second_exchange", detectors.detector_scientific);
  });
});

describe("zat_b30_actor_exchange", () => {
  it("should swap the remembered weapon for a scientific detector", () => {
    const npc: GameObject = MockGameObject.mock();

    (registry.actor as AnyObject).goodGun = weapons.wpn_groza;

    callDialogsBinding("zat_b30_actor_exchange", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, detectors.detector_scientific);
    expect((registry.actor as AnyObject).goodGun).toBeNull();
  });

  it("should do nothing without a remembered weapon", () => {
    (registry.actor as AnyObject).goodGun = null;

    callDialogsBinding("zat_b30_actor_exchange", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("zat_b30_actor_has_two_detectors", () => {
  it("should require more than one scientific detector", () => {
    mockActorWith([detectors.detector_scientific]);
    expect(callDialogsBinding("zat_b30_actor_has_two_detectors")).toBe(false);

    mockActorWith([detectors.detector_scientific, detectors.detector_scientific]);
    expect(callDialogsBinding("zat_b30_actor_has_two_detectors")).toBe(true);
  });
});

describe("actor_has_nimble_weapon", () => {
  it("should accept any of the nimble weapons", () => {
    expect(callDialogsBinding("actor_has_nimble_weapon")).toBe(false);

    for (const weapon of [weapons.wpn_groza_nimble, weapons.wpn_vintorez_nimble, weapons.wpn_svu_nimble]) {
      mockActorWith([weapon]);
      expect(callDialogsBinding("actor_has_nimble_weapon")).toBe(true);
    }
  });

  it("should reject a plain weapon", () => {
    mockActorWith([weapons.wpn_groza]);

    expect(callDialogsBinding("actor_has_nimble_weapon")).toBe(false);
  });
});

describe("zat_b12_actor_have_documents", () => {
  it("should accept either document set", () => {
    expect(callDialogsBinding("zat_b12_actor_have_documents")).toBe(false);

    for (const document of [questItems.zat_b12_documents_1, questItems.zat_b12_documents_2]) {
      mockActorWith([document]);
      expect(callDialogsBinding("zat_b12_actor_have_documents")).toBe(true);
    }
  });
});

describe("zat_b12_actor_transfer_documents", () => {
  it("should take the first document set and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([questItems.zat_b12_documents_1]);

    callDialogsBinding("zat_b12_actor_transfer_documents", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b12_documents_1);
    expect(registry.actor.has_info(infoPortions.zat_b12_documents_sold_1)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });

  it("should pay extra for each additional copy of the second document set", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([questItems.zat_b12_documents_2, questItems.zat_b12_documents_2, questItems.zat_b12_documents_2]);

    callDialogsBinding("zat_b12_actor_transfer_documents", [registry.actor, npc]);

    expect(giveMoneyToActor).toHaveBeenCalledWith(600 + 400 * 2);
    expect(registry.actor.has_info(infoPortions.zat_b12_documents_sold_2)).toBe(true);
  });
});

describe("zat_b3_actor_got_toolkit", () => {
  it("should detect a toolkit that has not been brought yet", () => {
    expect(callDialogsBinding("zat_b3_actor_got_toolkit")).toBe(false);

    mockActorWith([misc.toolkit_2]);
    expect(callDialogsBinding("zat_b3_actor_got_toolkit")).toBe(true);
  });

  it("should ignore a toolkit that was already brought", () => {
    mockActorWith([misc.toolkit_1]);
    registry.actor.give_info_portion(infoPortions.zat_b3_tech_instrument_1_brought);

    expect(callDialogsBinding("zat_b3_actor_got_toolkit")).toBe(false);
  });
});

describe("give_toolkit_1", () => {
  it("should take the first toolkit, clear it, and pay for it", () => {
    const npc: GameObject = MockGameObject.mock();

    (registry.actor as AnyObject).toolkit = misc.toolkit_1;

    callDialogsBinding("give_toolkit_1", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, misc.toolkit_1);
    expect((registry.actor as AnyObject).toolkit).toBeNull();
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});

describe("give_toolkit_2", () => {
  it("should take the second toolkit and pay for it", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("give_toolkit_2", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, misc.toolkit_2);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1200);
  });
});

describe("give_toolkit_3", () => {
  it("should take the third toolkit and pay for it", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("give_toolkit_3", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, misc.toolkit_3);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1500);
  });
});

describe("if_actor_has_toolkit_1", () => {
  it("should check the first toolkit", () => {
    checkHasItemPredicate("if_actor_has_toolkit_1", misc.toolkit_1);
  });
});

describe("if_actor_has_toolkit_2", () => {
  it("should check the second toolkit", () => {
    checkHasItemPredicate("if_actor_has_toolkit_2", misc.toolkit_2);
  });
});

describe("if_actor_has_toolkit_3", () => {
  it("should check the third toolkit", () => {
    checkHasItemPredicate("if_actor_has_toolkit_3", misc.toolkit_3);
  });
});

describe("zat_b215_counter_greater_3", () => {
  it("should check the Pripyat way counter against three", () => {
    setPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 3);
    expect(callDialogsBinding("zat_b215_counter_greater_3")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 4);
    expect(callDialogsBinding("zat_b215_counter_greater_3")).toBe(true);
  });
});

describe("zat_b40_transfer_notebook", () => {
  it("should sell the notebook and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b40_transfer_notebook", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b40_notebook);
    expect(registry.actor.has_info(infoPortions.zat_b40_notebook_saled)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(2000);
  });
});

describe("zat_b40_transfer_merc_pda_1", () => {
  it("should sell the first mercenary PDA and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b40_transfer_merc_pda_1", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b40_pda_1);
    expect(registry.actor.has_info(infoPortions.zat_b40_pda_1_saled)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});

describe("zat_b40_transfer_merc_pda_2", () => {
  it("should sell the second mercenary PDA and record the sale", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b40_transfer_merc_pda_2", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b40_pda_2);
    expect(registry.actor.has_info(infoPortions.zat_b40_pda_2_saled)).toBe(true);
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
  });
});

describe("zat_b40_actor_has_notebook", () => {
  it("should check the notebook", () => {
    checkHasItemPredicate("zat_b40_actor_has_notebook", questItems.zat_b40_notebook);
  });
});

describe("zat_b40_actor_has_merc_pda_1", () => {
  it("should check the first mercenary PDA", () => {
    checkHasItemPredicate("zat_b40_actor_has_merc_pda_1", questItems.zat_b40_pda_1);
  });
});

describe("zat_b40_actor_has_merc_pda_2", () => {
  it("should check the second mercenary PDA", () => {
    checkHasItemPredicate("zat_b40_actor_has_merc_pda_2", questItems.zat_b40_pda_2);
  });
});

describe("zat_b51_robbery", () => {
  it("should take a rolled share of the money and every listed weapon", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 40);
    mockActorWith([weapons.wpn_groza, weapons.wpn_svd], { money: 1000 });

    callDialogsBinding("zat_b51_robbery", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 400);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza, "all");
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_svd, "all");
  });

  it("should leave weapons that are not on the list alone", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.spyOn(math, "random").mockImplementation(() => 40);
    mockActorWith([weapons.wpn_pm], { money: 100 });

    callDialogsBinding("zat_b51_robbery", [registry.actor, npc]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("zat_b51_rob_nimble_weapon", () => {
  it("should take exactly one of the carried nimble weapons", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([weapons.wpn_groza_nimble, weapons.wpn_svd_nimble]);
    jest.spyOn(math, "random").mockImplementation(() => 1);

    callDialogsBinding("zat_b51_rob_nimble_weapon", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect([weapons.wpn_groza_nimble, weapons.wpn_svd_nimble]).toContain(
      jest.mocked(transferItemsFromActor).mock.calls[0][1]
    );
  });

  it("should immediately take an equipped nimble weapon", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([weapons.wpn_groza_nimble]);
    MockGameObject.asMock(registry.actor).item_in_slot.mockImplementation(((slot: TCount) =>
      slot === 2 ? MockGameObject.mock({ section: weapons.wpn_groza_nimble }) : null) as never);

    callDialogsBinding("zat_b51_rob_nimble_weapon", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, weapons.wpn_groza_nimble);
  });

  it("should leave plain weapons alone", () => {
    mockActorWith([weapons.wpn_groza]);

    callDialogsBinding("zat_b51_rob_nimble_weapon", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});

describe("give_compass_to_actor", () => {
  it("should give the compass artefact", () => {
    checkTransferToActor("give_compass_to_actor", artefacts.af_compass);
  });
});

describe("zat_b51_randomize_item", () => {
  it("should order one of the still available items of the active category", () => {
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_done_item_1_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_done_item_1_2" as TInfoPortion);
    jest.spyOn(math, "random").mockImplementation(() => 1);

    callDialogsBinding("zat_b51_randomize_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_ordered_item_1_3" as TInfoPortion)).toBe(true);
  });

  it("should order nothing while no category is being processed", () => {
    callDialogsBinding("zat_b51_randomize_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_ordered_item_1_1" as TInfoPortion)).toBe(false);
  });
});

describe("zat_b51_give_prepay", () => {
  it("should take the agreed prepay for the active category", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);

    callDialogsBinding("zat_b51_give_prepay", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 700);
  });

  it("should double the prepay once the order was refused", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion(infoPortions.zat_b51_order_refused);

    callDialogsBinding("zat_b51_give_prepay", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1400);
  });
});

describe("zat_b51_has_prepay", () => {
  it("should check the agreed prepay threshold of the active category", () => {
    mockActorWith([], { money: 699 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(false);

    mockActorWith([], { money: 700 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(true);
  });

  it("should check the doubled threshold once the order was refused", () => {
    mockActorWith([], { money: 1399 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion(infoPortions.zat_b51_order_refused);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(false);

    mockActorWith([], { money: 1400 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion(infoPortions.zat_b51_order_refused);
    expect(callDialogsBinding("zat_b51_has_prepay")).toBe(true);
  });
});

describe("zat_b51_hasnt_prepay", () => {
  it("should invert the prepay affordability check", () => {
    mockActorWith([], { money: 699 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_prepay", [registry.actor, MockGameObject.mock()])).toBe(true);

    mockActorWith([], { money: 700 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_prepay", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("zat_b51_buy_item", () => {
  it("should hand over the ordered item, charge its cost, and mark it done", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_1_1" as TInfoPortion);

    callDialogsBinding("zat_b51_buy_item", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_desert_eagle_nimble);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 2800);
    expect(registry.actor.has_info("zat_b51_done_item_1_1" as TInfoPortion)).toBe(true);
    expect(registry.actor.has_info("zat_b51_processing_category_1" as TInfoPortion)).toBe(false);
    expect(registry.actor.has_info("zat_b51_ordered_item_1_1" as TInfoPortion)).toBe(false);
  });

  it("should hand over every item of a multi-item category", () => {
    const npc: GameObject = MockGameObject.mock();

    registry.actor.give_info_portion("zat_b51_processing_category_5" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_5_1" as TInfoPortion);

    callDialogsBinding("zat_b51_buy_item", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_tactic);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, outfits.cs_heavy_outfit);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 32000);
  });

  it("should mark the category as finished once every item is done", () => {
    registry.actor.give_info_portion("zat_b51_processing_category_6" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_6_1" as TInfoPortion);

    callDialogsBinding("zat_b51_buy_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_finishing_category_6" as TInfoPortion)).toBe(true);
  });
});

describe("zat_b51_refuse_item", () => {
  it("should drop the order and stop processing the category", () => {
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    registry.actor.give_info_portion("zat_b51_ordered_item_1_1" as TInfoPortion);

    callDialogsBinding("zat_b51_refuse_item", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.has_info("zat_b51_processing_category_1" as TInfoPortion)).toBe(false);
    expect(registry.actor.has_info("zat_b51_ordered_item_1_1" as TInfoPortion)).toBe(false);
  });
});

describe("zat_b51_has_item_cost", () => {
  it("should check the full cost of the active category", () => {
    mockActorWith([], { money: 2799 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_item_cost")).toBe(false);

    mockActorWith([], { money: 2800 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_has_item_cost")).toBe(true);
  });

  it("should be false while no category is being processed", () => {
    mockActorWith([], { money: 100000 });

    expect(callDialogsBinding("zat_b51_has_item_cost")).toBe(false);
  });
});

describe("zat_b51_hasnt_item_cost", () => {
  it("should invert the full cost check", () => {
    mockActorWith([], { money: 2799 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_item_cost", [registry.actor, MockGameObject.mock()])).toBe(true);

    mockActorWith([], { money: 2800 });
    registry.actor.give_info_portion("zat_b51_processing_category_1" as TInfoPortion);
    expect(callDialogsBinding("zat_b51_hasnt_item_cost", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe.each([1, 2, 3, 4, 5, 6, 7, 8])("zat_b29_actor_has_adv_task_af_%i", (index: number) => {
  const tableIndex: number = index + 15;

  it("should require both the request marker and the matching artefact", () => {
    expect(callDialogsBinding(`zat_b29_actor_has_adv_task_af_${index}`)).toBe(false);

    mockActorWith([zatB29AfTable.get(tableIndex)]);
    expect(callDialogsBinding(`zat_b29_actor_has_adv_task_af_${index}`)).toBe(false);

    registry.actor.give_info_portion(zatB29InfopTable.get(tableIndex) as TInfoPortion);
    expect(callDialogsBinding(`zat_b29_actor_has_adv_task_af_${index}`)).toBe(true);
  });
});

describe.each([1, 2, 3, 4, 5, 6, 7, 8])("zat_b29_actor_do_not_has_adv_task_af_%i", (index: number) => {
  const tableIndex: number = index + 15;

  it("should require the request marker while the artefact is missing", () => {
    expect(callDialogsBinding(`zat_b29_actor_do_not_has_adv_task_af_${index}`)).toBe(false);

    registry.actor.give_info_portion(zatB29InfopTable.get(tableIndex) as TInfoPortion);
    expect(callDialogsBinding(`zat_b29_actor_do_not_has_adv_task_af_${index}`)).toBe(true);

    mockActorWith([zatB29AfTable.get(tableIndex)]);
    registry.actor.give_info_portion(zatB29InfopTable.get(tableIndex) as TInfoPortion);
    expect(callDialogsBinding(`zat_b29_actor_do_not_has_adv_task_af_${index}`)).toBe(false);
  });
});

describe("zat_b30_transfer_detector_to_actor", () => {
  it("should give the scientific detector", () => {
    checkTransferToActor("zat_b30_transfer_detector_to_actor", detectors.detector_scientific);
  });
});

describe("zat_b30_give_owls_share_to_actor", () => {
  it("should pay the Owl share", () => {
    checkMoneyReward("zat_b30_give_owls_share_to_actor", 1500);
  });
});

describe("zat_b30_actor_has_compass", () => {
  it("should check the compass artefact", () => {
    checkHasItemPredicate("zat_b30_actor_has_compass", artefacts.af_compass);
  });
});

describe("zat_b30_transfer_af_from_actor", () => {
  it("should take the compass, pay for it, and reveal both treasures", () => {
    const npc: GameObject = MockGameObject.mock();
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("zat_b30_transfer_af_from_actor", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_compass);
    expect(giveMoneyToActor).toHaveBeenCalledWith(10000);
    expect(coordinates).toHaveBeenCalledWith("zat_hiding_place_49");
    expect(coordinates).toHaveBeenCalledWith("zat_hiding_place_15");

    coordinates.mockRestore();
  });
});

describe("zat_b30_barmen_has_percent", () => {
  it("should follow the accumulated days counter", () => {
    expect(callDialogsBinding("zat_b30_barmen_has_percent")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 1);
    expect(callDialogsBinding("zat_b30_barmen_has_percent")).toBe(true);
  });
});

describe("zat_b30_barmen_do_not_has_percent", () => {
  it("should invert the accumulated days counter", () => {
    expect(callDialogsBinding("zat_b30_barmen_do_not_has_percent")).toBe(true);

    setPortableStoreValue(ACTOR_ID, "zat_b30_days_cnt", 1);
    expect(callDialogsBinding("zat_b30_barmen_do_not_has_percent")).toBe(false);
  });
});

describe("zat_b30_actor_has_noah_pda", () => {
  it("should check the Noah PDA", () => {
    checkHasItemPredicate("zat_b30_actor_has_noah_pda", questItems.zat_b20_noah_pda);
  });
});

describe("zat_b30_sell_noah_pda", () => {
  it("should sell the Noah PDA", () => {
    checkSale("zat_b30_sell_noah_pda", questItems.zat_b20_noah_pda, 1000);
  });
});

describe("give_vodka", () => {
  it("should take the vodka", () => {
    checkTransferFromActor("give_vodka", food.vodka);
  });
});

describe("if_actor_has_vodka", () => {
  it("should check the vodka", () => {
    checkHasItemPredicate("if_actor_has_vodka", food.vodka);
  });
});

describe("actor_has_more_then_need_money_to_buy_battery", () => {
  it("should check the battery price threshold", () => {
    checkMoneyPredicate("actor_has_more_then_need_money_to_buy_battery", 2000);
  });
});

describe("actor_has_less_then_need_money_to_buy_battery", () => {
  it("should invert the battery price threshold", () => {
    checkMoneyPredicate("actor_has_less_then_need_money_to_buy_battery", 2000, false);
  });
});

describe("relocate_need_money_to_buy_battery", () => {
  it("should take the battery price", () => {
    checkMoneyTransfer("relocate_need_money_to_buy_battery", 2000);
  });
});

describe("give_actor_battery", () => {
  it("should give the gauss battery", () => {
    checkTransferToActor("give_actor_battery", ammo.ammo_gauss_cardan);
  });
});

describe("give_actor_zat_a23_access_card", () => {
  it("should give the access card", () => {
    checkTransferToActor("give_actor_zat_a23_access_card", questItems.zat_a23_access_card);
  });
});

describe("give_zat_a23_gauss_rifle_docs", () => {
  it("should take the gauss documents", () => {
    checkTransferFromActor("give_zat_a23_gauss_rifle_docs", questItems.zat_a23_gauss_rifle_docs);
  });
});

describe("return_zat_a23_gauss_rifle_docs", () => {
  it("should hand the gauss documents back", () => {
    checkTransferToActor("return_zat_a23_gauss_rifle_docs", questItems.zat_a23_gauss_rifle_docs);
  });
});

describe("if_actor_has_zat_a23_gauss_rifle_docs", () => {
  it("should check the gauss documents on the first speaker", () => {
    checkHasItemPredicate("if_actor_has_zat_a23_gauss_rifle_docs", questItems.zat_a23_gauss_rifle_docs);
  });
});

describe("if_actor_has_gauss_rifle", () => {
  it("should check the broken gauss rifle on the first speaker", () => {
    checkHasItemPredicate("if_actor_has_gauss_rifle", questItems.pri_a17_gauss_rifle);
  });
});

describe("give_tech_gauss_rifle", () => {
  it("should take the broken gauss rifle", () => {
    checkTransferFromActor("give_tech_gauss_rifle", questItems.pri_a17_gauss_rifle);
  });
});

describe("give_actor_repaired_gauss_rifle", () => {
  it("should give the repaired gauss rifle", () => {
    checkTransferToActor("give_actor_repaired_gauss_rifle", weapons.wpn_gauss);
  });
});

describe("zat_b215_actor_has_money_poor", () => {
  it("should check the poor guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_money_poor", 1000);
  });
});

describe("zat_b215_actor_has_no_money_poor", () => {
  it("should invert the poor guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_no_money_poor", 1000, false);
  });
});

describe("zat_b215_actor_has_money_poor_pripyat", () => {
  it("should check the poor Pripyat guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_money_poor_pripyat", 4000);
  });
});

describe("zat_b215_actor_has_no_money_poor_pripyat", () => {
  it("should invert the poor Pripyat guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_no_money_poor_pripyat", 4000, false);
  });
});

describe("zat_b215_actor_has_money_rich", () => {
  it("should check the rich guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_money_rich", 3000);
  });
});

describe("zat_b215_actor_has_no_money_rich", () => {
  it("should invert the rich guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_no_money_rich", 3000, false);
  });
});

describe("zat_b215_actor_has_money_rich_pripyat", () => {
  it("should check the rich Pripyat guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_money_rich_pripyat", 6000);
  });
});

describe("zat_b215_actor_has_no_money_rich_pripyat", () => {
  it("should invert the rich Pripyat guide fee", () => {
    checkMoneyPredicate("zat_b215_actor_has_no_money_rich_pripyat", 6000, false);
  });
});

describe("zat_b215_relocate_money_poor", () => {
  it("should take the poor guide fee", () => {
    checkMoneyTransfer("zat_b215_relocate_money_poor", 1000);
  });
});

describe("zat_b215_relocate_money_poor_pripyat", () => {
  it("should take the poor Pripyat guide fee", () => {
    checkMoneyTransfer("zat_b215_relocate_money_poor_pripyat", 4000);
  });
});

describe("zat_b215_relocate_money_rich", () => {
  it("should take the rich guide fee", () => {
    checkMoneyTransfer("zat_b215_relocate_money_rich", 3000);
  });
});

describe("zat_b215_relocate_money_rich_pripyat", () => {
  it("should take the rich Pripyat guide fee", () => {
    checkMoneyTransfer("zat_b215_relocate_money_rich_pripyat", 6000);
  });
});

describe("zat_b44_actor_has_pda_global", () => {
  it("should accept either mercenary PDA", () => {
    expect(callDialogsBinding("zat_b44_actor_has_pda_global")).toBe(false);

    for (const pda of [questItems.zat_b39_joker_pda, questItems.zat_b44_barge_pda]) {
      mockActorWith([pda]);
      expect(callDialogsBinding("zat_b44_actor_has_pda_global")).toBe(true);
    }
  });
});

describe("zat_b44_actor_has_not_pda_global", () => {
  it("should require both PDAs before reporting them as present", () => {
    expect(callDialogsBinding("zat_b44_actor_has_not_pda_global")).toBe(true);

    mockActorWith([questItems.zat_b39_joker_pda]);
    expect(callDialogsBinding("zat_b44_actor_has_not_pda_global")).toBe(true);

    mockActorWith([questItems.zat_b39_joker_pda, questItems.zat_b44_barge_pda]);
    expect(callDialogsBinding("zat_b44_actor_has_not_pda_global")).toBe(false);
  });
});

describe("zat_b44_actor_has_pda_barge", () => {
  it("should check the barge PDA", () => {
    checkHasItemPredicate("zat_b44_actor_has_pda_barge", questItems.zat_b44_barge_pda);
  });
});

describe("zat_b44_actor_has_pda_joker", () => {
  it("should check the joker PDA", () => {
    checkHasItemPredicate("zat_b44_actor_has_pda_joker", questItems.zat_b39_joker_pda);
  });
});

describe("zat_b44_actor_has_pda_both", () => {
  it("should require both PDAs", () => {
    mockActorWith([questItems.zat_b39_joker_pda]);
    expect(callDialogsBinding("zat_b44_actor_has_pda_both")).toBe(false);

    mockActorWith([questItems.zat_b39_joker_pda, questItems.zat_b44_barge_pda]);
    expect(callDialogsBinding("zat_b44_actor_has_pda_both")).toBe(true);
  });
});

describe("zat_b44_transfer_pda_barge", () => {
  it("should take the barge PDA", () => {
    checkTransferFromActor("zat_b44_transfer_pda_barge", questItems.zat_b44_barge_pda);
  });
});

describe("zat_b44_transfer_pda_joker", () => {
  it("should take the joker PDA", () => {
    checkTransferFromActor("zat_b44_transfer_pda_joker", questItems.zat_b39_joker_pda);
  });
});

describe("zat_b44_transfer_pda_both", () => {
  it("should take both PDAs", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_b44_transfer_pda_both", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(2);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b44_barge_pda);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_b39_joker_pda);
  });
});

describe("zat_b44_frends_dialog_enabled", () => {
  it("should open while the actor is missing one of the PDAs", () => {
    expect(callDialogsBinding("zat_b44_frends_dialog_enabled", [registry.actor, MockGameObject.mock()])).toBe(true);
  });

  it("should close once both PDAs are carried and the tech topics are unset", () => {
    mockActorWith([questItems.zat_b39_joker_pda, questItems.zat_b44_barge_pda]);

    expect(callDialogsBinding("zat_b44_frends_dialog_enabled", [registry.actor, MockGameObject.mock()])).toBe(false);
  });

  it("should open on the tech discount topics regardless of the PDAs", () => {
    mockActorWith([questItems.zat_b39_joker_pda, questItems.zat_b44_barge_pda]);
    registry.actor.give_info_portion(infoPortions.zat_b3_tech_have_couple_dose);
    registry.actor.give_info_portion(infoPortions.zat_b3_tech_discount_1);

    expect(callDialogsBinding("zat_b44_frends_dialog_enabled", [registry.actor, MockGameObject.mock()])).toBe(true);
  });
});

describe("zat_b53_if_actor_has_detector_advanced", () => {
  it("should accept any detector above the basic one", () => {
    expect(callDialogsBinding("zat_b53_if_actor_has_detector_advanced")).toBe(false);

    for (const detector of [detectors.detector_advanced, detectors.detector_elite, detectors.detector_scientific]) {
      mockActorWith([detector]);
      expect(callDialogsBinding("zat_b53_if_actor_has_detector_advanced")).toBe(true);
    }
  });
});

describe("zat_b53_if_actor_hasnt_detector_advanced", () => {
  it("should invert the advanced detector check", () => {
    expect(
      callDialogsBinding("zat_b53_if_actor_hasnt_detector_advanced", [registry.actor, MockGameObject.mock()])
    ).toBe(true);

    mockActorWith([detectors.detector_advanced]);
    expect(
      callDialogsBinding("zat_b53_if_actor_hasnt_detector_advanced", [registry.actor, MockGameObject.mock()])
    ).toBe(false);
  });
});

describe("zat_b53_transfer_medkit_to_npc", () => {
  it("should release the preferred medkit and raise the actor reputation", () => {
    mockActorWith([drugs.medkit_army, drugs.medkit]);
    registry.simulator = MockAlifeSimulator.getInstance();

    const release = jest.spyOn(registry.simulator, "release").mockImplementation(jest.fn());

    callDialogsBinding("zat_b53_transfer_medkit_to_npc", [registry.actor, MockGameObject.mock()]);

    expect(release).toHaveBeenCalled();
    expect(registry.actor.change_character_reputation).toHaveBeenCalledWith(10);

    release.mockRestore();
  });

  it("should do nothing when the actor has no medkit", () => {
    callDialogsBinding("zat_b53_transfer_medkit_to_npc", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.change_character_reputation).not.toHaveBeenCalled();
  });
});

describe("zat_b53_transfer_detector_advanced_to_actor", () => {
  it("should give the advanced detector", () => {
    checkTransferToActor("zat_b53_transfer_detector_advanced_to_actor", detectors.detector_advanced);
  });
});

describe("zat_b53_transfer_fireball_to_actor", () => {
  it("should give the fireball artefact", () => {
    checkTransferToActor("zat_b53_transfer_fireball_to_actor", artefacts.af_fireball);
  });
});

describe("zat_b53_transfer_medkit_to_actor", () => {
  it("should give the plain medkit", () => {
    checkTransferToActor("zat_b53_transfer_medkit_to_actor", drugs.medkit);
  });
});

describe("is_zat_b106_hunting_time", () => {
  it("should only accept the late night hunting window", () => {
    jest.spyOn(level, "get_time_hours").mockImplementation(() => 1);
    expect(callDialogsBinding("is_zat_b106_hunting_time")).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 3);
    expect(callDialogsBinding("is_zat_b106_hunting_time")).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 5);
    expect(callDialogsBinding("is_zat_b106_hunting_time")).toBe(false);
  });

  it("should open the window part way through the second hour", () => {
    jest.spyOn(level, "get_time_hours").mockImplementation(() => 2);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 44);
    expect(callDialogsBinding("is_zat_b106_hunting_time")).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 45);
    expect(callDialogsBinding("is_zat_b106_hunting_time")).toBe(true);
  });
});

describe("is_not_zat_b106_hunting_time", () => {
  it("should invert the hunting window", () => {
    jest.spyOn(level, "get_time_hours").mockImplementation(() => 3);
    expect(callDialogsBinding("is_not_zat_b106_hunting_time")).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 5);
    expect(callDialogsBinding("is_not_zat_b106_hunting_time")).toBe(true);
  });
});

describe("zat_b106_soroka_reward", () => {
  it("should pay the full reward while Flint was not blamed", () => {
    checkMoneyReward("zat_b106_soroka_reward", 3000);
  });

  it("should reduce the reward once Flint was blamed to either faction", () => {
    for (const portion of [
      infoPortions.jup_b25_flint_blame_done_to_duty,
      infoPortions.jup_b25_flint_blame_done_to_freedom,
    ]) {
      mockActorWith([]);
      resetFunctionMock(giveMoneyToActor);
      registry.actor.give_info_portion(portion);

      callDialogsBinding("zat_b106_soroka_reward");

      expect(giveMoneyToActor).toHaveBeenCalledWith(1000);
    }
  });
});

describe("zat_b103_actor_has_needed_food", () => {
  it("should require six food items in total", () => {
    mockActorWith([food.bread, food.kolbasa, food.conserva, food.bread, food.kolbasa]);
    expect(callDialogsBinding("zat_b103_actor_has_needed_food")).toBe(false);

    mockActorWith([food.bread, food.kolbasa, food.conserva, food.bread, food.kolbasa, food.conserva]);
    expect(callDialogsBinding("zat_b103_actor_has_needed_food")).toBe(true);
  });
});

describe("zat_b106_transfer_weap_to_actor", () => {
  it("should give the shotgun", () => {
    checkTransferToActor("zat_b106_transfer_weap_to_actor", weapons.wpn_spas12);
  });
});

describe("zat_b106_give_reward", () => {
  it("should reveal the treasure", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b106_give_reward");

    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_50");

    giveTreasureCoordinates.mockRestore();
  });
});

describe("zat_b3_tech_drinks_precond", () => {
  it("should open while the tech has not seen the produce", () => {
    expect(callDialogsBinding("zat_b3_tech_drinks_precond")).toBe(true);

    registry.actor.give_info_portion(infoPortions.zat_b3_tech_see_produce_62);
    expect(callDialogsBinding("zat_b3_tech_drinks_precond")).toBe(false);
  });

  it("should reopen after the gauss repair until the tech stops drinking", () => {
    registry.actor.give_info_portion(infoPortions.zat_b3_tech_see_produce_62);
    registry.actor.give_info_portion(infoPortions.zat_b3_gauss_repaired);
    expect(callDialogsBinding("zat_b3_tech_drinks_precond")).toBe(true);

    registry.actor.give_info_portion(infoPortions.zat_b3_tech_drink_no_more);
    expect(callDialogsBinding("zat_b3_tech_drinks_precond")).toBe(false);
  });
});

describe("zat_b106_soroka_gone", () => {
  it("should follow either Flint blame outcome", () => {
    expect(callDialogsBinding("zat_b106_soroka_gone")).toBe(false);

    for (const portion of [
      infoPortions.jup_b25_flint_blame_done_to_duty,
      infoPortions.jup_b25_flint_blame_done_to_freedom,
    ]) {
      mockActorWith([]);
      registry.actor.give_info_portion(portion);
      expect(callDialogsBinding("zat_b106_soroka_gone")).toBe(true);
    }
  });
});

describe("zat_b106_soroka_not_gone", () => {
  it("should invert the Flint blame outcome", () => {
    expect(callDialogsBinding("zat_b106_soroka_not_gone", [registry.actor, MockGameObject.mock()])).toBe(true);

    registry.actor.give_info_portion(infoPortions.jup_b25_flint_blame_done_to_duty);
    expect(callDialogsBinding("zat_b106_soroka_not_gone", [registry.actor, MockGameObject.mock()])).toBe(false);
  });
});

describe("zat_b22_actor_has_proof", () => {
  it("should check the medic PDA", () => {
    checkHasItemPredicate("zat_b22_actor_has_proof", infoPortions.zat_b22_medic_pda);
  });
});

describe("zat_b22_transfer_proof", () => {
  it("should take the medic PDA", () => {
    checkTransferFromActor("zat_b22_transfer_proof", infoPortions.zat_b22_medic_pda);
  });
});

describe("zat_b5_stalker_transfer_money", () => {
  it("should pay the stalker reward and reveal the treasure", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b5_stalker_transfer_money");

    expect(giveMoneyToActor).toHaveBeenCalledWith(2500);
    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_7");

    giveTreasureCoordinates.mockRestore();
  });
});

describe("zat_b5_dealer_full_revard", () => {
  it("should pay the full dealer reward", () => {
    checkMoneyReward("zat_b5_dealer_full_revard", 6000);
  });
});

describe("zat_b5_dealer_easy_revard", () => {
  it("should pay the reduced dealer reward", () => {
    checkMoneyReward("zat_b5_dealer_easy_revard", 3000);
  });
});

describe("zat_b5_bandits_revard", () => {
  it("should pay the bandit reward and reveal the treasure", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b5_bandits_revard");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_20");

    giveTreasureCoordinates.mockRestore();
  });
});

describe("zat_a23_actor_has_access_card", () => {
  it("should check the access card", () => {
    checkHasItemPredicate("zat_a23_actor_has_access_card", questItems.zat_a23_access_card);
  });
});

describe("zat_a23_transfer_access_card_to_tech", () => {
  it("should swap the access card for scientific medkits", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("zat_a23_transfer_access_card_to_tech", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.zat_a23_access_card);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
  });
});

describe("zat_b57_stalker_reward_to_actor_detector", () => {
  it("should give the elite detector and reveal the treasure", () => {
    const npc: GameObject = MockGameObject.mock();
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("zat_b57_stalker_reward_to_actor_detector", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, detectors.detector_elite);
    expect(giveTreasureCoordinates).toHaveBeenCalledWith("zat_hiding_place_54");

    giveTreasureCoordinates.mockRestore();
  });
});

describe("actor_has_gas", () => {
  it("should check the gas canister", () => {
    checkHasItemPredicate("actor_has_gas", questItems.zat_b57_gas);
  });
});

describe("actor_has_not_gas", () => {
  it("should invert the gas canister check", () => {
    checkHasItemPredicate("actor_has_not_gas", questItems.zat_b57_gas, false);
  });
});

describe("zat_b57_actor_has_money", () => {
  it("should check the gas price threshold", () => {
    checkMoneyPredicate("zat_b57_actor_has_money", 2000);
  });
});

describe("zat_b57_actor_hasnt_money", () => {
  it("should invert the gas price threshold", () => {
    checkMoneyPredicate("zat_b57_actor_hasnt_money", 2000, false);
  });
});

describe("zat_b57_transfer_gas_money", () => {
  it("should take the gas price", () => {
    checkMoneyTransfer("zat_b57_transfer_gas_money", 2000);
  });
});
