import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_pripyat"]);
}

/**
 * Sections of the three Strelok notes, indexed the same way the dialog predicates name them.
 */
const NOTES: Array<TSection> = [questItems.jup_b10_notes_01, questItems.jup_b10_notes_02, questItems.jup_b10_notes_03];

/**
 * All possible combinations of carried Strelok notes, described by their 1-based indexes.
 */
const NOTE_COMBINATIONS: Array<Array<number>> = [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];

/**
 * Re-register the actor carrying the provided 1-based Strelok note indexes and extra sections.
 */
function mockActorWithNotes(indexes: Array<number>, extra: Array<TSection> = []): void {
  resetRegistry();
  mockRegisteredActor({
    inventory: [...indexes.map((index) => NOTES[index - 1]), ...extra].map((section) => [
      section,
      MockGameObject.mock({ section }),
    ]),
  });
}

/**
 * Verify that a note predicate accepts only the exact note combination it is named after.
 */
function checkNotePredicate(name: TName, expected: Array<number>): void {
  for (const combination of NOTE_COMBINATIONS) {
    mockActorWithNotes(combination);

    const isExpected: boolean =
      combination.length === expected.length && expected.every((index) => combination.includes(index));

    expect(callDialogsBinding(name)).toBe(isExpected);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs_pripyat");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();

  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_b301_zulus_reward", () => {
  it("should transfer the Zulus machine gun from the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b301_zulus_reward", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_pkm_zulus);
  });
});

describe("pri_a17_reward", () => {
  it("should pay the reward matching the quest outcome", () => {
    const rewards: Array<[TInfoPortion, TCount]> = [
      [infoPortions.pri_a17_reward_well, 7500],
      [infoPortions.pri_a17_reward_norm, 4000],
      [infoPortions.pri_a17_reward_bad, 3000],
    ];

    for (const [infoPortion, reward] of rewards) {
      resetRegistry();
      mockRegisteredActor();

      giveInfoPortion(infoPortion);
      callDialogsBinding("pri_a17_reward");

      expect(giveMoneyToActor).toHaveBeenLastCalledWith(reward);
    }
  });

  it("should pay nothing when no outcome is recorded", () => {
    callDialogsBinding("pri_a17_reward");

    expect(giveMoneyToActor).not.toHaveBeenCalled();
  });

  it("should prefer the best outcome when several are recorded", () => {
    giveInfoPortion(infoPortions.pri_a17_reward_bad);
    giveInfoPortion(infoPortions.pri_a17_reward_norm);
    giveInfoPortion(infoPortions.pri_a17_reward_well);

    callDialogsBinding("pri_a17_reward");

    expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
    expect(giveMoneyToActor).toHaveBeenCalledWith(7500);
  });
});

describe("actor_has_pri_a17_gauss_rifle", () => {
  it("should check the gauss rifle presence in the actor inventory", () => {
    expect(callDialogsBinding("actor_has_pri_a17_gauss_rifle")).toBe(false);

    resetRegistry();
    mockRegisteredActor({
      inventory: [["pri_a17_gauss_rifle", MockGameObject.mock({ section: "pri_a17_gauss_rifle" })]],
    });

    expect(callDialogsBinding("actor_has_pri_a17_gauss_rifle")).toBe(true);
  });
});

describe("actor_hasnt_pri_a17_gauss_rifle", () => {
  it("should invert the gauss rifle presence check", () => {
    expect(callDialogsBinding("actor_hasnt_pri_a17_gauss_rifle")).toBe(true);

    resetRegistry();
    mockRegisteredActor({
      inventory: [["pri_a17_gauss_rifle", MockGameObject.mock({ section: "pri_a17_gauss_rifle" })]],
    });

    expect(callDialogsBinding("actor_hasnt_pri_a17_gauss_rifle")).toBe(false);
  });
});

describe("transfer_artifact_af_baloon", () => {
  it("should transfer the baloon artefact from the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("transfer_artifact_af_baloon", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_baloon);
  });
});

describe("pay_cost_to_guide_to_zaton", () => {
  it("should charge the full fee and the discounted one once maps are given", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pay_cost_to_guide_to_zaton", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 3000);

    giveInfoPortion(infoPortions.zat_b215_gave_maps);

    callDialogsBinding("pay_cost_to_guide_to_zaton", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 1000);
  });
});

describe("jup_b43_actor_has_10000_money", () => {
  it("should require 5000 money by default", () => {
    resetRegistry();
    mockRegisteredActor({ money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(true);
  });

  it("should require only 3000 money once maps are given", () => {
    resetRegistry();
    mockRegisteredActor({ money: 2999 });
    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 3000 });
    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(true);
  });
});

describe("jup_b43_actor_do_not_has_10000_money", () => {
  it("should invert the Zaton guide fee affordability check", () => {
    resetRegistry();
    mockRegisteredActor({ money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 3000 });
    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(false);
  });
});

describe("pay_cost_to_guide_to_jupiter", () => {
  it("should charge a flat Jupiter guide fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pay_cost_to_guide_to_jupiter", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledTimes(1);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 7000);
  });

  it("should not discount the Jupiter fee when maps are given", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    callDialogsBinding("pay_cost_to_guide_to_jupiter", [registry.actor, npc]);

    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 7000);
  });
});

describe("jup_b43_actor_has_7000_money", () => {
  it("should check the 7000 money threshold", () => {
    resetRegistry();
    mockRegisteredActor({ money: 6999 });
    expect(callDialogsBinding("jup_b43_actor_has_7000_money")).toBe(false);

    resetRegistry();
    mockRegisteredActor({ money: 7000 });
    expect(callDialogsBinding("jup_b43_actor_has_7000_money")).toBe(true);
  });
});

describe("jup_b43_actor_do_not_has_7000_money", () => {
  it("should invert the 7000 money threshold", () => {
    resetRegistry();
    mockRegisteredActor({ money: 6999 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_7000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 7000 });
    expect(callDialogsBinding("jup_b43_actor_do_not_has_7000_money")).toBe(false);
  });
});

describe("pri_b35_transfer_svd", () => {
  it("should transfer the rifle together with its ammunition", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b35_transfer_svd", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_svd);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, ammo["ammo_7.62x54_7h1"]);
  });
});

describe("pri_b35_give_actor_reward", () => {
  it("should triple the ammunition reward once the secondary objective is done", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b35_give_actor_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"], 1);

    giveInfoPortion(infoPortions.pri_b35_secondary);

    callDialogsBinding("pri_b35_give_actor_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"], 3);
  });
});

describe("pri_a25_medic_give_kit", () => {
  it("should give the basic supply when no specific kit is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 4);
  });

  it("should give the advanced supply when it is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 5);
  });

  it("should give the elite supply when it is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva, 4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 8);
  });

  it("should prefer the advanced supply when both tiers are requested", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply);
    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 3);
  });
});

describe("pri_a22_army_signaller_supply", () => {
  it("should give the supply matching the requested supply info portion", () => {
    const supplies: Array<[TName, Array<[TSection, TCount]>]> = [
      [
        "supply_ammo_1",
        [
          ["ammo_9x18_fmj", 2],
          ["ammo_9x18_pmm", 1],
        ],
      ],
      [
        "supply_ammo_2",
        [
          ["ammo_9x19_fmj", 2],
          ["ammo_9x19_pbp", 1],
        ],
      ],
      [
        "supply_ammo_3",
        [
          ["ammo_11.43x23_fmj", 2],
          ["ammo_11.43x23_hydro", 1],
        ],
      ],
      [
        "supply_ammo_4",
        [
          ["ammo_12x70_buck", 10],
          ["ammo_12x76_zhekan", 5],
        ],
      ],
      [
        "supply_ammo_5",
        [
          ["ammo_5.45x39_fmj", 2],
          ["ammo_5.45x39_ap", 1],
        ],
      ],
      [
        "supply_ammo_6",
        [
          ["ammo_5.56x45_ss190", 2],
          ["ammo_5.56x45_ap", 1],
        ],
      ],
      [
        "supply_ammo_7",
        [
          ["ammo_9x39_pab9", 1],
          ["ammo_9x39_ap", 1],
        ],
      ],
      ["supply_ammo_8", [["ammo_7.62x54_7h1", 1]]],
      ["supply_ammo_9", [["ammo_pkm_100", 1]]],
      [
        "supply_grenade_1",
        [
          ["grenade_rgd5", 3],
          ["grenade_f1", 2],
        ],
      ],
      ["supply_grenade_2", [["ammo_vog-25", 3]]],
      ["supply_grenade_3", [["ammo_m209", 3]]],
    ];

    for (const [supply, items] of supplies) {
      resetRegistry();
      mockRegisteredActor();
      resetFunctionMock(transferItemsToActor);

      const npc: GameObject = MockGameObject.mock();

      giveInfoPortion(supply);
      callDialogsBinding("pri_a22_army_signaller_supply", [registry.actor, npc]);

      expect(transferItemsToActor).toHaveBeenCalledTimes(items.length);

      for (const [section, count] of items) {
        expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
      }
    }
  });

  it("should give nothing when no supply is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a22_army_signaller_supply", [registry.actor, npc]);

    expect(transferItemsToActor).not.toHaveBeenCalled();
  });
});

describe("pri_a22_give_actor_outfit", () => {
  it("should transfer the military outfit together with the helmet", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a22_give_actor_outfit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, outfits.military_outfit);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_battle);
  });
});

describe("pri_b305_actor_has_strelok_notes", () => {
  it("should detect any of the three notes", () => {
    for (const combination of NOTE_COMBINATIONS) {
      mockActorWithNotes(combination);

      expect(callDialogsBinding("pri_b305_actor_has_strelok_notes")).toBe(combination.length > 0);
    }
  });
});

describe("pri_b305_actor_has_strelok_note_1", () => {
  it("should accept only the first note alone", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_1", [1]);
  });
});

describe("pri_b305_actor_has_strelok_note_2", () => {
  it("should accept only the second note alone", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_2", [2]);
  });
});

describe("pri_b305_actor_has_strelok_note_3", () => {
  it("should accept only the third note alone", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_3", [3]);
  });
});

describe("pri_b305_actor_has_strelok_note_12", () => {
  it("should accept only the first and second notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_12", [1, 2]);
  });
});

describe("pri_b305_actor_has_strelok_note_13", () => {
  it("should accept only the first and third notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_13", [1, 3]);
  });
});

describe("pri_b305_actor_has_strelok_note_23", () => {
  it("should accept only the second and third notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_23", [2, 3]);
  });
});

describe("pri_b305_actor_has_strelok_note_all", () => {
  it("should accept only all three notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_all", [1, 2, 3]);
  });
});

describe("pri_b305_sell_strelok_notes", () => {
  it("should take a single note and reward medkits only", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b10_notes_01);
    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
    expect(registry.actor.has_info(infoPortions.pri_b305_all_strelok_notes_given)).toBe(false);
  });

  it("should add the fire artefact starting from the second note", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1, 2]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_fire);
    expect(transferItemsToActor).not.toHaveBeenCalledWith(npc, artefacts.af_glass);
    expect(registry.actor.has_info(infoPortions.pri_b305_all_strelok_notes_given)).toBe(false);
  });

  it("should add the glass artefact and mark completion for all three notes", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1, 2, 3]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_fire);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_glass);
    expect(registry.actor.has_info(infoPortions.pri_b305_all_strelok_notes_given)).toBe(true);
  });

  it("should reward gauss ammunition instead of medkits when the actor owns the gauss rifle", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1], [weapons.wpn_gauss]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, ammo.ammo_gauss, 2);
    expect(transferItemsToActor).not.toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
  });

  it("should do nothing but reward medkits when no notes are carried", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
  });
});

describe("pri_a17_sokolov_is_not_at_base", () => {
  it("should require both departure and death info portions", () => {
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);

    giveInfoPortion(infoPortions.pri_a15_sokolov_out);
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);

    giveInfoPortion(infoPortions.pas_b400_sokolov_dead);
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(true);
  });

  it("should not accept the death info portion alone", () => {
    giveInfoPortion(infoPortions.pas_b400_sokolov_dead);

    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);
  });
});
