import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { questItems } from "@/engine/constants/items/quest_items";
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

describe("pri_a17_sokolov_is_not_at_base", () => {
  it("should require both departure and death info portions", () => {
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);

    giveInfoPortion(infoPortions.pri_a15_sokolov_out);
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);

    giveInfoPortion(infoPortions.pas_b400_sokolov_dead);
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(true);
  });
});

describe("Pri_a17 rewards", () => {
  it("should grant the reward matching the quest outcome", () => {
    const rewardCases: Array<[TInfoPortion, number]> = [
      [infoPortions.pri_a17_reward_well, 7500],
      [infoPortions.pri_a17_reward_norm, 4000],
      [infoPortions.pri_a17_reward_bad, 3000],
    ];

    for (const [infoPortion, reward] of rewardCases) {
      giveInfoPortion(infoPortion);
      callDialogsBinding("pri_a17_reward");
      expect(giveMoneyToActor).toHaveBeenLastCalledWith(reward);

      resetRegistry();
      mockRegisteredActor();
    }
  });
});

describe("pri_a17 gauss rifle predicates", () => {
  it("should expose complementary inventory checks", () => {
    const rifle: GameObject = MockGameObject.mock({ section: "pri_a17_gauss_rifle" });

    resetRegistry();
    mockRegisteredActor({ inventory: [["pri_a17_gauss_rifle", rifle]] });

    expect(callDialogsBinding("actor_has_pri_a17_gauss_rifle")).toBe(true);
    expect(callDialogsBinding("actor_hasnt_pri_a17_gauss_rifle")).toBe(false);

    resetRegistry();
    resetRegistry();
    mockRegisteredActor();

    expect(callDialogsBinding("actor_has_pri_a17_gauss_rifle")).toBe(false);
    expect(callDialogsBinding("actor_hasnt_pri_a17_gauss_rifle")).toBe(true);
  });
});

describe("Pripyat guide fees", () => {
  it("should charge discounted and full Zaton fees", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pay_cost_to_guide_to_zaton", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 3000);

    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    callDialogsBinding("pay_cost_to_guide_to_zaton", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 1000);

    callDialogsBinding("pay_cost_to_guide_to_jupiter", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenLastCalledWith(npc, 7000);
  });

  it("should use the correct money thresholds and inverse predicates", () => {
    mockRegisteredActor({ money: 4999 });
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(false);
    expect(callDialogsBinding("jup_b43_actor_do_not_has_10000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(true);

    giveInfoPortion(infoPortions.zat_b215_gave_maps);
    expect(callDialogsBinding("jup_b43_actor_has_10000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 6999 });
    expect(callDialogsBinding("jup_b43_actor_has_7000_money")).toBe(false);
    expect(callDialogsBinding("jup_b43_actor_do_not_has_7000_money")).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 7000 });
    expect(callDialogsBinding("jup_b43_actor_has_7000_money")).toBe(true);
    expect(callDialogsBinding("jup_b43_actor_do_not_has_7000_money")).toBe(false);
  });
});

describe("Pripyat supply rewards", () => {
  it("should transfer quest rewards from the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b301_zulus_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, "wpn_pkm_zulus");

    callDialogsBinding("transfer_artifact_af_baloon", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, artefacts.af_baloon);

    callDialogsBinding("pri_b35_transfer_svd", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"]);
  });

  it("should scale the pri_b35 ammunition reward by the secondary objective", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b35_give_actor_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"], 1);

    giveInfoPortion(infoPortions.pri_b35_secondary);
    callDialogsBinding("pri_b35_give_actor_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"], 3);
  });

  it("should give the selected medic kit and signaller ammunition supply", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 5);

    resetRegistry();
    mockRegisteredActor();

    resetFunctionMock(transferItemsToActor);
    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 8);

    resetFunctionMock(transferItemsToActor);
    giveInfoPortion("supply_ammo_1");
    callDialogsBinding("pri_a22_army_signaller_supply", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, "ammo_9x18_fmj", 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, "ammo_9x18_pmm", 1);
  });

  it("should transfer the military outfit and helmet", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a22_give_actor_outfit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, outfits.military_outfit);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_battle);
  });
});

describe("Pri_b305 Strelok notes", () => {
  it("should distinguish every supported note combination", () => {
    const notes = [questItems.jup_b10_notes_01, questItems.jup_b10_notes_02, questItems.jup_b10_notes_03];
    const predicates: Array<[TName, Array<number>]> = [
      ["pri_b305_actor_has_strelok_note_1", [0]],
      ["pri_b305_actor_has_strelok_note_2", [1]],
      ["pri_b305_actor_has_strelok_note_3", [2]],
      ["pri_b305_actor_has_strelok_note_12", [0, 1]],
      ["pri_b305_actor_has_strelok_note_13", [0, 2]],
      ["pri_b305_actor_has_strelok_note_23", [1, 2]],
      ["pri_b305_actor_has_strelok_note_all", [0, 1, 2]],
    ];

    for (const [name, indexes] of predicates) {
      resetRegistry();
      mockRegisteredActor({
        inventory: indexes.map((index) => [notes[index], MockGameObject.mock({ section: notes[index] })]),
      });

      expect(callDialogsBinding("pri_b305_actor_has_strelok_notes")).toBe(true);
      expect(callDialogsBinding(name)).toBe(true);
    }

    resetRegistry();
    mockRegisteredActor();

    expect(callDialogsBinding("pri_b305_actor_has_strelok_notes")).toBe(false);
  });

  it("should trade all notes for the complete reward", () => {
    mockRegisteredActor({
      inventory: [
        [questItems.jup_b10_notes_01, MockGameObject.mock({ section: questItems.jup_b10_notes_01 })],
        [questItems.jup_b10_notes_02, MockGameObject.mock({ section: questItems.jup_b10_notes_02 })],
        [questItems.jup_b10_notes_03, MockGameObject.mock({ section: questItems.jup_b10_notes_03 })],
      ],
    });

    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_fire);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_glass);
  });

  it("should give gauss ammunition instead of medkits when the actor owns the gauss rifle", () => {
    mockRegisteredActor({
      inventory: [
        [questItems.jup_b10_notes_01, MockGameObject.mock({ section: questItems.jup_b10_notes_01 })],
        ["wpn_gauss", MockGameObject.mock({ section: "wpn_gauss" })],
      ],
    });

    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, ammo.ammo_gauss, 2);
  });
});
