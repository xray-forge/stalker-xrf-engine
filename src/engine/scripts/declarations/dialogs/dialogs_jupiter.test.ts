import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { getManager, registry } from "@/engine/core/database";
import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { TreasureManager } from "@/engine/core/managers/treasures";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { getObjectsRelationSafe, isActorEnemyWithFaction } from "@/engine/core/utils/relation";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function checkBinding(name: TName): void {
  return checkNestedBinding("dialogs_jupiter", name);
}

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

jest.mock("@/engine/core/utils/reward");
jest.mock("@/engine/core/utils/relation");

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs_jupiter");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(getObjectsRelationSafe);
  resetFunctionMock(isActorEnemyWithFaction);
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("jup_b208_give_reward", () => {
  it("should grant money and all three treasure coordinates", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("jup_b208_give_reward");

    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_18");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_35");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_45");
  });
});

describe("jupiter_a9_actor_hasnt_all_mail_items", () => {
  it("should invert the complete mail-items predicate", () => {
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_all_mail_items")).toBe(true);
  });
});

describe("jupiter_a9_actor_has_all_mail_items", () => {
  it("should require every mail document", () => {
    resetRegistry();
    mockRegisteredActor({
      inventory: [
        [questItems.jup_a9_conservation_info, MockGameObject.mock({ section: questItems.jup_a9_conservation_info })],
        [questItems.jup_a9_power_info, MockGameObject.mock({ section: questItems.jup_a9_power_info })],
        [questItems.jup_a9_way_info, MockGameObject.mock({ section: questItems.jup_a9_way_info })],
      ],
    });

    expect(callDialogsBinding("jupiter_a9_actor_has_all_mail_items")).toBe(true);
    expect(callDialogsBinding("jupiter_a9_actor_hasnt_all_mail_items")).toBe(false);
  });
});

describe("jupiter_a9_actor_has_any_items", () => {
  it("should accept a secondary document", () => {
    resetRegistry();
    mockRegisteredActor({
      inventory: [[questItems.jup_a9_delivery_info, MockGameObject.mock({ section: questItems.jup_a9_delivery_info })]],
    });

    expect(callDialogsBinding("jupiter_a9_actor_has_any_items")).toBe(true);
  });
});

describe("jupiter_a9_actor_has_any_mail_items", () => {
  it("should accept an individual mail document", () => {
    resetRegistry();
    mockRegisteredActor({
      inventory: [[questItems.jup_a9_power_info, MockGameObject.mock({ section: questItems.jup_a9_power_info })]],
    });

    expect(callDialogsBinding("jupiter_a9_actor_has_any_mail_items")).toBe(true);
  });
});

describe("jupiter_a9_actor_has_any_secondary_items", () => {
  it("should reject mail-only inventory", () => {
    resetRegistry();
    mockRegisteredActor({
      inventory: [[questItems.jup_a9_way_info, MockGameObject.mock({ section: questItems.jup_a9_way_info })]],
    });

    expect(callDialogsBinding("jupiter_a9_actor_has_any_secondary_items")).toBe(false);
  });
});

describe("jupiter_a9_actor_hasnt_any_mail_items", () => {
  it("should reject only a partial mail set", () => {
    resetRegistry();
    mockRegisteredActor({
      inventory: [
        [questItems.jup_a9_conservation_info, MockGameObject.mock({ section: questItems.jup_a9_conservation_info })],
      ],
    });

    expect(callDialogsBinding("jupiter_a9_actor_hasnt_any_mail_items")).toBe(true);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_delivery", () => {
  it("should pay for delivery info", () => {
    callDialogsBinding("jupiter_a9_freedom_leader_jupiter_delivery");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_evacuation", () => {
  it("should pay for evacuation info", () => {
    callDialogsBinding("jupiter_a9_freedom_leader_jupiter_evacuation");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_losses", () => {
  it("should pay for losses info", () => {
    callDialogsBinding("jupiter_a9_freedom_leader_jupiter_losses");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_freedom_leader_jupiter_meeting", () => {
  it("should pay for meeting info", () => {
    callDialogsBinding("jupiter_a9_freedom_leader_jupiter_meeting");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_delivery", () => {
  it("should pay for delivery info", () => {
    callDialogsBinding("jupiter_a9_dolg_leader_jupiter_delivery");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_evacuation", () => {
  it("should pay for evacuation info", () => {
    callDialogsBinding("jupiter_a9_dolg_leader_jupiter_evacuation");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_losses", () => {
  it("should pay for losses info", () => {
    callDialogsBinding("jupiter_a9_dolg_leader_jupiter_losses");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jupiter_a9_dolg_leader_jupiter_meeting", () => {
  it("should pay for meeting info", () => {
    callDialogsBinding("jupiter_a9_dolg_leader_jupiter_meeting");
    expect(giveMoneyToActor).toHaveBeenCalledWith(500);
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_losses_info");
  });
});

describe("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info");
  });
});

describe("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items");
  });
});

describe("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items", () => {
  it("should be registered", () => {
    checkBinding("jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items");
  });
});

describe("jup_a9_actor_has_conservation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_conservation_info");
  });
});

describe("jup_a9_actor_hasnt_conservation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_conservation_info");
  });
});

describe("actor_relocate_conservation_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_conservation_info");
  });
});

describe("jup_a9_actor_has_power_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_power_info");
  });
});

describe("jup_a9_actor_hasnt_power_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_power_info");
  });
});

describe("actor_relocate_power_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_power_info");
  });
});

describe("jup_a9_actor_has_way_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_way_info");
  });
});

describe("jup_a9_actor_hasnt_way_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_way_info");
  });
});

describe("actor_relocate_way_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_way_info");
  });
});

describe("jup_a9_actor_has_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_meeting_info");
  });
});

describe("jup_a9_actor_hasnt_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_meeting_info");
  });
});

describe("actor_relocate_meeting_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_meeting_info");
  });
});

describe("jup_a9_actor_has_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_delivery_info");
  });
});

describe("jup_a9_actor_hasnt_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_delivery_info");
  });
});

describe("jup_a9_actor_has_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_evacuation_info");
  });
});

describe("jup_a9_actor_hasnt_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_evacuation_info");
  });
});

describe("actor_relocate_evacuation_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_evacuation_info");
  });
});

describe("actor_relocate_delivery_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_delivery_info");
  });
});

describe("jup_a9_actor_has_losses_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_has_losses_info");
  });
});

describe("jup_a9_actor_hasnt_losses_info", () => {
  it("should be registered", () => {
    checkBinding("jup_a9_actor_hasnt_losses_info");
  });
});

describe("actor_relocate_losses_info", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_losses_info");
  });
});

describe("actor_has_plant", () => {
  it("should be registered", () => {
    checkBinding("actor_has_plant");
  });
});

describe("actor_relocate_plant", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_plant");
  });
});

describe("actor_relocate_trapper_reward", () => {
  it("should be registered", () => {
    checkBinding("actor_relocate_trapper_reward");
  });
});

describe("zat_b106_trapper_reward", () => {
  it("should be registered", () => {
    checkBinding("zat_b106_trapper_reward");
  });
});

describe("jup_a10_proverka_wpn", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_proverka_wpn");
  });
});

describe("jup_a10_proverka_wpn_false", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_proverka_wpn_false");
  });
});

describe("jup_a10_actor_has_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_money");
  });
});

describe("jup_a10_actor_has_not_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_not_money");
  });
});

describe("jup_a10_actor_give_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_give_money");
  });
});

describe("jup_a10_vano_give_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_vano_give_money");
  });
});

describe("jup_a10_actor_give_outfit_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_give_outfit_money");
  });
});

describe("jup_a10_actor_has_outfit_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_outfit_money");
  });
});

describe("jup_a10_actor_has_not_outfit_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a10_actor_has_not_outfit_money");
  });
});

describe("if_actor_has_jup_b16_oasis_artifact", () => {
  it("should be registered", () => {
    checkBinding("if_actor_has_jup_b16_oasis_artifact");
  });
});

describe("if_actor_hasnt_jup_b16_oasis_artifact", () => {
  it("should be registered", () => {
    checkBinding("if_actor_hasnt_jup_b16_oasis_artifact");
  });
});

describe("jupiter_b16_reward", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b16_reward");
  });
});

describe("give_jup_b16_oasis_artifact", () => {
  it("should be registered", () => {
    checkBinding("give_jup_b16_oasis_artifact");
  });
});

describe("jup_a12_actor_has_15000_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_15000_money");
  });
});

describe("jup_a12_actor_do_not_has_15000_money", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_do_not_has_15000_money");
  });
});

describe("jup_a12_actor_has_artefacts", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefacts");
  });
});

describe("jup_a12_actor_has_artefact_1", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_1");
  });
});

describe("jup_a12_actor_has_artefact_2", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_2");
  });
});

describe("jup_a12_actor_has_artefact_3", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_3");
  });
});

describe("jup_a12_actor_has_artefact_4", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_has_artefact_4");
  });
});

describe("jup_a12_actor_do_not_has_artefacts", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_actor_do_not_has_artefacts");
  });
});

describe("jup_a12_transfer_ransom_from_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_ransom_from_actor");
  });
});

describe("jup_a12_transfer_5000_money_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_5000_money_to_actor");
  });
});

describe("jup_a12_transfer_artefact_to_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_artefact_to_actor");
  });
});

describe("jup_a12_transfer_cashier_money_from_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_a12_transfer_cashier_money_from_actor");
  });
});

describe("zat_b30_transfer_detectors", () => {
  it("should be registered", () => {
    checkBinding("zat_b30_transfer_detectors");
  });
});

describe("zat_b30_actor_do_not_has_transfer_items", () => {
  it("should be registered", () => {
    checkBinding("zat_b30_actor_do_not_has_transfer_items");
  });
});

describe("zat_b30_actor_has_transfer_items", () => {
  it("should be registered", () => {
    checkBinding("zat_b30_actor_has_transfer_items");
  });
});

describe("jup_b202_hit_bandit_from_actor", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_hit_bandit_from_actor");
  });
});

describe("jup_b202_medic_dialog_precondition", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_medic_dialog_precondition");
  });
});

describe("jup_b6_stalker_dialog_precond", () => {
  it("should be registered", () => {
    checkBinding("jup_b6_stalker_dialog_precond");
  });
});

describe("jup_b217_actor_got_toolkit", () => {
  it("should be registered", () => {
    checkBinding("jup_b217_actor_got_toolkit");
  });
});

describe("jupiter_b200_tech_materials_relocate", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b200_tech_materials_relocate");
  });
});

describe("npc_in_b4_smart", () => {
  it("should be registered", () => {
    checkBinding("npc_in_b4_smart");
  });
});

describe("jup_b202_transfer_medkit", () => {
  it("should be registered", () => {
    checkBinding("jup_b202_transfer_medkit");
  });
});

describe("jupiter_b220_all_hunted", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b220_all_hunted");
  });
});

describe("jupiter_b220_no_one_hunted", () => {
  it("should be registered", () => {
    checkBinding("jupiter_b220_no_one_hunted");
  });
});

describe("jup_b15_dec_counter", () => {
  it("should be registered", () => {
    checkBinding("jup_b15_dec_counter");
  });
});

describe("jup_b47_jupiter_docs_enabled", () => {
  it("should be registered", () => {
    checkBinding("jup_b47_jupiter_docs_enabled");
  });
});

describe("jup_b218_counter_not_3", () => {
  it("should evaluate all squad-size predicates from the actor portable store", () => {
    expect(callDialogsBinding("jup_b218_counter_not_3")).toBe(true);
    expect(callDialogsBinding("jup_b218_counter_equal_3")).toBe(false);
    expect(callDialogsBinding("jup_b218_counter_not_0")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);

    expect(callDialogsBinding("jup_b218_counter_not_3")).toBe(false);
    expect(callDialogsBinding("jup_b218_counter_equal_3")).toBe(true);
    expect(callDialogsBinding("jup_b218_counter_not_0")).toBe(true);
  });
});

describe("jup_b25_frase_count_inc", () => {
  it("should delegate the counter increment to the quest effect", () => {
    const npc: GameObject = MockGameObject.mock();
    const incrementCounter = jest.fn(() => true);

    (_G as AnyObject)["xr_effects"] = { inc_counter: incrementCounter };

    expect(callDialogsBinding("jup_b25_frase_count_inc", [registry.actor, npc])).toBe(true);
    expect(incrementCounter).toHaveBeenCalledWith(registry.actor, npc, ["jup_b25_frase", 1]);
  });
});

describe("jup_b32_anomaly_has_af", () => {
  it("should consume the marked anomaly info only when its zone has an artefact", () => {
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    giveInfoPortion(infoPortions.jup_b32_anomaly_1);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    registry.anomalyZones.set("jup_b32_anomal_zone", { spawnedArtefactsCount: 0 } as AnomalyZoneBinder);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    registry.anomalyZones.set("jup_b32_anomal_zone", { spawnedArtefactsCount: 1 } as AnomalyZoneBinder);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_1)).toBe(false);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_true)).toBe(true);
  });
});

describe("jup_b4 faction relations", () => {
  it("should evaluate Freedom relation predicates and the complementary enemy check", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_freedom", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_freedom", [registry.actor, npc])).toBe(false);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_freedom", [registry.actor, npc])).toBe(true);
  });

  it("should evaluate Duty relation predicates and the complementary enemy check", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_dolg", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_dolg", [registry.actor, npc])).toBe(false);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_dolg", [registry.actor, npc])).toBe(true);

    MockGameObject.asMock(registry.actor).relation.mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_dolg", [registry.actor, npc])).toBe(true);
  });
});

describe("jup_b47 quest flow", () => {
  it("should check and trade the products info document for its complete reward", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("jup_b47_jupiter_products_info_enabled")).toBe(false);
    expect(callDialogsBinding("jup_b47_jupiter_products_info_disabled")).toBe(true);

    mockRegisteredActor({
      inventory: [
        [
          questItems.jup_b47_jupiter_products_info,
          MockGameObject.mock({ section: questItems.jup_b47_jupiter_products_info }),
        ],
      ],
    });

    expect(callDialogsBinding("jup_b47_jupiter_products_info_enabled")).toBe(true);
    expect(callDialogsBinding("jup_b47_jupiter_products_info_disabled")).toBe(false);

    callDialogsBinding("jup_b47_jupiter_products_info_revard", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b47_jupiter_products_info);
    expect(giveMoneyToActor).toHaveBeenCalledWith(7000);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.medkit_scientic, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.antirad, 5);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_psy_blockade, 2);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_antidot, 2);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_radioprotector, 2);
  });

  it("should check and trade the mercenary PDA", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("jup_b47_actor_has_merc_pda")).toBe(false);
    expect(callDialogsBinding("jup_b47_actor_has_not_merc_pda")).toBe(true);

    mockRegisteredActor({
      inventory: [[questItems.jup_b47_merc_pda, MockGameObject.mock({ section: questItems.jup_b47_merc_pda })]],
    });

    expect(callDialogsBinding("jup_b47_actor_has_merc_pda")).toBe(true);
    expect(callDialogsBinding("jup_b47_actor_has_not_merc_pda")).toBe(false);

    callDialogsBinding("jup_b47_merc_pda_revard", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b47_merc_pda);
    expect(giveMoneyToActor).toHaveBeenCalledWith(2500);
  });

  it("should allow the task for either exclusive B6 outcome and either available squad", () => {
    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(false);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(false);

    giveInfoPortion(infoPortions.jup_b6_task_done);
    giveInfoPortion(infoPortions.jup_b47_bunker_guards_started);
    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(true);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(true);

    resetRegistry();
    mockRegisteredActor();
    giveInfoPortion(infoPortions.jup_b6_task_fail);
    giveInfoPortion(infoPortions.jup_b6_employ_stalker);
    expect(callDialogsBinding("jup_b47_actor_can_take_task")).toBe(true);
    expect(callDialogsBinding("jup_b47_employ_squad")).toBe(true);
  });

  it("should issue all B47 rewards and detect the gauss documents", () => {
    callDialogsBinding("jup_b47_bunker_guard_revard");
    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_psy_blockade, 2);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_antidot, 3);
    expect(giveItemsToActor).toHaveBeenCalledWith(drugs.drug_radioprotector, 3);

    callDialogsBinding("jup_b47_gauss_rifle_revard");
    expect(giveMoneyToActor).toHaveBeenCalledWith(12000);
    expect(callDialogsBinding("jup_b47_actor_has_hauss_rifle_docs")).toBe(false);

    mockRegisteredActor({
      inventory: [
        [questItems.zat_a23_gauss_rifle_docs, MockGameObject.mock({ section: questItems.zat_a23_gauss_rifle_docs })],
      ],
    });
    expect(callDialogsBinding("jup_b47_actor_has_hauss_rifle_docs")).toBe(true);
  });
});

describe("jup_b10 and related exchanges", () => {
  it("should transfer both UFO memories in the correct directions and detect the first one", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("jup_b10_ufo_memory_give_to_actor", [registry.actor, npc])).toBe(false);
    expect(callDialogsBinding("jup_b10_actor_has_ufo_memory")).toBe(false);

    mockRegisteredActor({
      inventory: [[questItems.jup_b10_ufo_memory, MockGameObject.mock({ section: questItems.jup_b10_ufo_memory })]],
    });
    expect(callDialogsBinding("jup_b10_ufo_memory_give_to_actor", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("jup_b10_actor_has_ufo_memory")).toBe(true);

    callDialogsBinding("jup_b10_ufo_memory_give_to_npc", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b10_ufo_memory);

    callDialogsBinding("jup_b10_ufo_memory_2_give_to_actor", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, questItems.jup_b10_ufo_memory_2);
  });

  it("should enforce the configured UFO fees and invoke their transfers", () => {
    mockRegisteredActor({ money: 999 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_1000")).toBe(false);
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_1000")).toBe(true);

    mockRegisteredActor({ money: 1000 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_1000")).toBe(true);
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_1000")).toBe(false);

    mockRegisteredActor({ money: 1999 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_3000")).toBe(false);
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_3000")).toBe(true);

    mockRegisteredActor({ money: 2000 });
    expect(callDialogsBinding("jup_b10_ufo_has_money_3000")).toBe(true);
    expect(callDialogsBinding("jup_b10_ufo_hasnt_money_3000")).toBe(false);

    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_b10_ufo_relocate_money_1000", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 1000);
    callDialogsBinding("jup_b10_ufo_relocate_money_3000", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 2000);
  });

  it("should apply the related B211, B19, and B6 rewards", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_b211_kill_bludsuckers_reward");
    expect(giveMoneyToActor).toHaveBeenCalledWith(3000);

    callDialogsBinding("jup_b19_transfer_conserva_to_actor", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva);

    callDialogsBinding("jupiter_b6_sell_halfartefact");
    expect(giveMoneyToActor).toHaveBeenCalledWith(2000);
  });
});

describe("Sokolov note and faction checks", () => {
  it("should check and exchange the Sokolov note for an army medkit", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("pri_a15_sokolov_actor_has_note")).toBe(false);
    expect(callDialogsBinding("pri_a15_sokolov_actor_has_not_note")).toBe(true);

    mockRegisteredActor({
      inventory: [
        [questItems.jup_b205_sokolov_note, MockGameObject.mock({ section: questItems.jup_b205_sokolov_note })],
      ],
    });
    expect(callDialogsBinding("pri_a15_sokolov_actor_has_note")).toBe(true);
    expect(callDialogsBinding("pri_a15_sokolov_actor_has_not_note")).toBe(false);

    callDialogsBinding("pri_a15_sokolov_actor_give_note", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b205_sokolov_note);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army);
  });

  it("should allow dialog with factions the actor is not hostile to", () => {
    jest.mocked(isActorEnemyWithFaction).mockReturnValue(false);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_freedom")).toBe(true);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_dolg")).toBe(true);

    jest.mocked(isActorEnemyWithFaction).mockReturnValue(true);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_freedom")).toBe(false);
    expect(callDialogsBinding("jup_b47_actor_not_enemy_to_dolg")).toBe(false);
  });
});

describe("jup_b15 scientific outfit and b19 treasure", () => {
  it("should expose complementary scientific-outfit predicates", () => {
    expect(callDialogsBinding("jup_b15_actor_sci_outfit")).toBe(false);
    expect(callDialogsBinding("jup_b15_no_actor_sci_outfit")).toBe(true);

    mockRegisteredActor({
      inventory: [[outfits.scientific_outfit, MockGameObject.mock({ section: outfits.scientific_outfit })]],
    });
    expect(callDialogsBinding("jup_b15_actor_sci_outfit")).toBe(true);
    expect(callDialogsBinding("jup_b15_no_actor_sci_outfit")).toBe(false);
  });

  it("should reveal the B19 treasure coordinates", () => {
    const giveTreasureCoordinates = jest
      .spyOn(TreasureManager, "giveTreasureCoordinates")
      .mockImplementation(jest.fn());

    callDialogsBinding("jup_b19_reward");

    expect(giveTreasureCoordinates).toHaveBeenCalledWith("jup_hiding_place_38");
    giveTreasureCoordinates.mockRestore();
  });
});

describe("a9 information exchanges", () => {
  it("should sell every secondary document to Owl and record the matching sale", () => {
    const npc: GameObject = MockGameObject.mock();
    const sales: Array<[TName, TName, TName]> = [
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_evacuation_info",
        questItems.jup_a9_evacuation_info,
        infoPortions.jup_a9_evacuation_info_sold,
      ],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_meeting_info",
        questItems.jup_a9_meeting_info,
        infoPortions.jup_a9_meeting_info_sold,
      ],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_losses_info",
        questItems.jup_a9_losses_info,
        infoPortions.jup_a9_losses_info_sold,
      ],
      [
        "jup_a9_owl_stalker_trader_sell_jup_a9_delivery_info",
        questItems.jup_a9_delivery_info,
        infoPortions.jup_a9_delivery_info_sold,
      ],
    ];

    for (const [binding, item, soldInfo] of sales) {
      resetRegistry();
      mockRegisteredActor({ inventory: [[item, MockGameObject.mock({ section: item })]] });
      resetFunctionMock(giveMoneyToActor);
      resetFunctionMock(transferItemsFromActor);

      callDialogsBinding(binding, [registry.actor, npc]);

      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, item);
      expect(giveMoneyToActor).toHaveBeenCalledWith(750);
      expect(registry.actor.has_info(soldInfo)).toBe(true);
    }
  });

  it("should hand every secondary document to either faction leader", () => {
    const npc: GameObject = MockGameObject.mock();
    const secondaryItems: Array<TName> = [
      questItems.jup_a9_evacuation_info,
      questItems.jup_a9_meeting_info,
      questItems.jup_a9_losses_info,
      questItems.jup_a9_delivery_info,
    ];
    const inventory: Array<[TName, GameObject]> = secondaryItems.map((item) => [
      item,
      MockGameObject.mock({ section: item }),
    ]);

    for (const leaderBinding of [
      "jupiter_a9_dolg_leader_jupiter_sell_all_secondary_items",
      "jupiter_a9_freedom_leader_jupiter_sell_all_secondary_items",
    ] as Array<TName>) {
      resetRegistry();
      mockRegisteredActor({ inventory: inventory });
      resetFunctionMock(giveMoneyToActor);
      resetFunctionMock(transferItemsFromActor);

      callDialogsBinding(leaderBinding, [registry.actor, npc]);

      expect(transferItemsFromActor).toHaveBeenCalledTimes(4);
      expect(giveMoneyToActor).toHaveBeenCalledTimes(4);

      for (const item of secondaryItems) {
        expect(transferItemsFromActor).toHaveBeenCalledWith(npc, item);
      }
    }
  });

  it("should expose complementary predicates and transfer every individual quest document", () => {
    const npc: GameObject = MockGameObject.mock();
    const documents: Array<[TName, TName, TName, TName]> = [
      [
        "jup_a9_actor_has_conservation_info",
        "jup_a9_actor_hasnt_conservation_info",
        "actor_relocate_conservation_info",
        questItems.jup_a9_conservation_info,
      ],
      [
        "jup_a9_actor_has_power_info",
        "jup_a9_actor_hasnt_power_info",
        "actor_relocate_power_info",
        questItems.jup_a9_power_info,
      ],
      [
        "jup_a9_actor_has_way_info",
        "jup_a9_actor_hasnt_way_info",
        "actor_relocate_way_info",
        questItems.jup_a9_way_info,
      ],
      [
        "jup_a9_actor_has_meeting_info",
        "jup_a9_actor_hasnt_meeting_info",
        "actor_relocate_meeting_info",
        questItems.jup_a9_meeting_info,
      ],
      [
        "jup_a9_actor_has_delivery_info",
        "jup_a9_actor_hasnt_delivery_info",
        "actor_relocate_delivery_info",
        questItems.jup_a9_delivery_info,
      ],
      [
        "jup_a9_actor_has_evacuation_info",
        "jup_a9_actor_hasnt_evacuation_info",
        "actor_relocate_evacuation_info",
        questItems.jup_a9_evacuation_info,
      ],
      [
        "jup_a9_actor_has_losses_info",
        "jup_a9_actor_hasnt_losses_info",
        "actor_relocate_losses_info",
        questItems.jup_a9_losses_info,
      ],
    ];

    for (const [hasBinding, hasntBinding, relocateBinding, item] of documents) {
      resetRegistry();
      mockRegisteredActor();
      expect(callDialogsBinding(hasBinding)).toBe(false);
      expect(callDialogsBinding(hasntBinding)).toBe(true);

      mockRegisteredActor({ inventory: [[item, MockGameObject.mock({ section: item })]] });
      resetFunctionMock(transferItemsFromActor);
      expect(callDialogsBinding(hasBinding)).toBe(true);
      expect(callDialogsBinding(hasntBinding)).toBe(false);

      callDialogsBinding(relocateBinding, [registry.actor, npc]);
      expect(transferItemsFromActor).toHaveBeenCalledWith(npc, item);
    }
  });
});

describe("Jupiter B206 and trapper rewards", () => {
  it("should check and transfer the plant and the trapper weapon", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("actor_has_plant")).toBe(false);
    mockRegisteredActor({
      inventory: [[questItems.jup_b206_plant, MockGameObject.mock({ section: questItems.jup_b206_plant })]],
    });
    expect(callDialogsBinding("actor_has_plant")).toBe(true);

    callDialogsBinding("actor_relocate_plant", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b206_plant);

    callDialogsBinding("actor_relocate_trapper_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_wincheaster1300_trapper);
  });

  it("should increase the trapper payment for a one-hit chimera kill", () => {
    callDialogsBinding("zat_b106_trapper_reward");
    expect(giveMoneyToActor).toHaveBeenCalledWith(2000);

    giveInfoPortion(infoPortions.zat_b106_one_hit);
    callDialogsBinding("zat_b106_trapper_reward");
    expect(giveMoneyToActor).toHaveBeenCalledWith(3000);
  });
});

describe("Jupiter A10 debt dialog", () => {
  it("should reject an actor without an accepted weapon", () => {
    const actor: GameObject = registry.actor;

    expect(callDialogsBinding("jup_a10_proverka_wpn")).toBe(false);
    expect(callDialogsBinding("jup_a10_proverka_wpn_false", [actor, MockGameObject.mock()])).toBe(true);
  });

  it("should use the correct debt threshold and payment outcome", () => {
    const npc: GameObject = MockGameObject.mock();

    mockRegisteredActor({ money: 6999 });
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(false);
    expect(callDialogsBinding("jup_a10_actor_has_not_money", [registry.actor, npc])).toBe(true);

    mockRegisteredActor({ money: 7000 });
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(true);
    callDialogsBinding("jup_a10_actor_give_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 7000);
    expect(registry.actor.has_info(infoPortions.jup_a10_bandit_take_all_money)).toBe(true);

    resetRegistry();
    mockRegisteredActor({ money: 5000 });
    giveInfoPortion(infoPortions.jup_a10_debt_wo_percent);
    resetFunctionMock(transferMoneyFromActor);
    expect(callDialogsBinding("jup_a10_actor_has_money")).toBe(true);
    callDialogsBinding("jup_a10_actor_give_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 5000);
    expect(registry.actor.has_info(infoPortions.jup_a10_bandit_take_money)).toBe(true);
  });

  it("should pay Vano and process the outfit fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("jup_a10_vano_give_money");
    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);

    mockRegisteredActor({ money: 4999 });
    expect(callDialogsBinding("jup_a10_actor_has_outfit_money")).toBe(false);
    expect(callDialogsBinding("jup_a10_actor_has_not_outfit_money", [registry.actor, npc])).toBe(true);

    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_a10_actor_has_outfit_money")).toBe(true);
    expect(callDialogsBinding("jup_a10_actor_has_not_outfit_money", [registry.actor, npc])).toBe(false);
    callDialogsBinding("jup_a10_actor_give_outfit_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 5000);
  });
});

describe("Jupiter B16 and A12 exchanges", () => {
  it("should check, hand over, and reward the oasis heart", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("if_actor_has_jup_b16_oasis_artifact", [registry.actor, npc])).toBe(false);
    expect(callDialogsBinding("if_actor_hasnt_jup_b16_oasis_artifact", [registry.actor, npc])).toBe(true);

    mockRegisteredActor({
      inventory: [[artefacts.af_oasis_heart, MockGameObject.mock({ section: artefacts.af_oasis_heart })]],
    });
    expect(callDialogsBinding("if_actor_has_jup_b16_oasis_artifact", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("if_actor_hasnt_jup_b16_oasis_artifact", [registry.actor, npc])).toBe(false);
    callDialogsBinding("give_jup_b16_oasis_artifact", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_oasis_heart);

    callDialogsBinding("jupiter_b16_reward");
    expect(giveMoneyToActor).toHaveBeenCalledWith(7000);
  });

  it("should support both the money and artefact ransom paths", () => {
    const npc: GameObject = MockGameObject.mock();

    mockRegisteredActor({ money: 14999 });
    expect(callDialogsBinding("jup_a12_actor_has_15000_money")).toBe(false);
    expect(callDialogsBinding("jup_a12_actor_do_not_has_15000_money")).toBe(true);

    mockRegisteredActor({ money: 15000 });
    expect(callDialogsBinding("jup_a12_actor_has_15000_money")).toBe(true);
    giveInfoPortion(infoPortions.jup_a12_ransom_by_money);
    callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 15000);

    resetRegistry();
    mockRegisteredActor({
      inventory: [[artefacts.af_glass, MockGameObject.mock({ section: artefacts.af_glass })]],
    });
    giveInfoPortion("jup_a12_af_glass");
    resetFunctionMock(transferItemsFromActor);
    callDialogsBinding("jup_a12_transfer_ransom_from_actor", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_glass);
  });

  it("should distinguish every accepted ransom artefact", () => {
    const ransomArtefacts: Array<TName> = [
      artefacts.af_fire,
      artefacts.af_gold_fish,
      artefacts.af_glass,
      artefacts.af_ice,
    ];

    expect(callDialogsBinding("jup_a12_actor_has_artefacts")).toBe(false);
    expect(callDialogsBinding("jup_a12_actor_do_not_has_artefacts")).toBe(true);

    for (const [index, artefact] of ransomArtefacts.entries()) {
      resetRegistry();
      mockRegisteredActor({ inventory: [[artefact, MockGameObject.mock({ section: artefact })]] });

      expect(callDialogsBinding("jup_a12_actor_has_artefacts")).toBe(true);
      expect(callDialogsBinding("jup_a12_actor_do_not_has_artefacts")).toBe(false);
      expect(callDialogsBinding(`jup_a12_actor_has_artefact_${index + 1}`)).toBe(true);
    }
  });

  it("should grant both treasure-coordinate rewards and the gold fish", () => {
    const npc: GameObject = MockGameObject.mock();
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const coordinates = jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(jest.fn());

    callDialogsBinding("jup_a12_transfer_5000_money_to_actor");
    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_40");
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_34");

    resetFunctionMock(transferItemsToActor);
    coordinates.mockClear();
    callDialogsBinding("jup_a12_transfer_artefact_to_actor", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_gold_fish);
    expect(coordinates).not.toHaveBeenCalled();

    giveInfoPortion(infoPortions.jup_a12_stalker_prisoner_free_dialog_done);
    callDialogsBinding("jup_a12_transfer_artefact_to_actor", [registry.actor, npc]);
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_40");
    expect(coordinates).toHaveBeenCalledWith("jup_hiding_place_34");
    coordinates.mockRestore();
  });
});

describe("Zaton B30 detector handoff", () => {
  it("should require and transfer three elite detectors", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(false);
    expect(callDialogsBinding("zat_b30_actor_do_not_has_transfer_items", [registry.actor, npc])).toBe(true);

    mockRegisteredActor({
      inventory: [
        ["first_detector", MockGameObject.mock({ section: detectors.detector_elite })],
        ["second_detector", MockGameObject.mock({ section: detectors.detector_elite })],
        ["third_detector", MockGameObject.mock({ section: detectors.detector_elite })],
      ],
    });
    expect(callDialogsBinding("zat_b30_actor_has_transfer_items")).toBe(true);
    expect(callDialogsBinding("zat_b30_actor_do_not_has_transfer_items", [registry.actor, npc])).toBe(false);

    callDialogsBinding("zat_b30_transfer_detectors", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, detectors.detector_elite, 3);
  });
});

describe("Jupiter B32 and B207 dialog scenarios", () => {
  it("should gate B32 dialogs, scanners, and rewards", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);

    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);

    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(true);
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b32_task_start);
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(false);

    callDialogsBinding("jup_b32_transfer_scanners", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, infoPortions.jup_b32_scanner_device, 3);

    callDialogsBinding("jup_b32_transfer_scanners_2", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, infoPortions.jup_b32_scanner_device, 2);

    callDialogsBinding("jup_b32_give_reward_to_actor");
    expect(giveMoneyToActor).toHaveBeenCalledWith(5000);

    callDialogsBinding("jup_b209_get_monster_scanner", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, "jup_b209_monster_scanner", 1);

    callDialogsBinding("jup_b209_return_monster_scanner", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, "jup_b209_monster_scanner", 1);
  });

  it("should clean stale anomaly state and process both B207 PDAs", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("jup_b32_anomaly_do_not_has_af")).toBe(true);

    giveInfoPortion(infoPortions.jup_b32_anomaly_true);
    expect(callDialogsBinding("jup_b32_anomaly_do_not_has_af")).toBe(false);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_true)).toBe(false);

    expect(callDialogsBinding("jup_b207_actor_has_dealers_pda")).toBe(false);
    expect(callDialogsBinding("jup_b207_generic_decrypt_need_dialog_precond", [registry.actor, npc])).toBe(false);

    mockRegisteredActor({
      inventory: [["device_pda_zat_b5_dealer", MockGameObject.mock({ section: "device_pda_zat_b5_dealer" })]],
    });
    expect(callDialogsBinding("jup_b207_actor_has_dealers_pda")).toBe(true);

    callDialogsBinding("jup_b207_sell_dealers_pda", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, "device_pda_zat_b5_dealer");
    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);

    callDialogsBinding("jup_b207_give_dealers_pda", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, "device_pda_zat_b5_dealer");

    resetRegistry();
    mockRegisteredActor({
      inventory: [
        ["jup_b207_merc_pda_with_contract", MockGameObject.mock({ section: "jup_b207_merc_pda_with_contract" })],
        [questItems.jup_b9_blackbox, MockGameObject.mock({ section: questItems.jup_b9_blackbox })],
      ],
    });
    expect(callDialogsBinding("jup_b207_generic_decrypt_need_dialog_precond", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("jup_b207_actor_has_merc_pda_with_contract")).toBe(true);

    callDialogsBinding("jup_b207_sell_merc_pda_with_contract", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, "jup_b207_merc_pda_with_contract");
    expect(giveMoneyToActor).toHaveBeenCalledWith(1000);

    callDialogsBinding("jup_b207_transfer_blackmail_reward", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, "jup_b207_merc_pda_with_contract");

    callDialogsBinding("jup_b207_transfer_blackmail_reward_for_pda", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, "wpn_abakan");
  });
});

describe("Jupiter B1 and B6 rewards", () => {
  it("should exchange the half artefact and apply every B6 money reward", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("if_actor_has_jup_b1_art")).toBe(false);

    mockRegisteredActor({
      inventory: [["jup_b1_half_artifact", MockGameObject.mock({ section: "jup_b1_half_artifact" })]],
    });
    expect(callDialogsBinding("if_actor_has_jup_b1_art")).toBe(true);

    callDialogsBinding("give_jup_b1_art", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, "jup_b1_half_artifact");

    const rewards: Array<[TName, number]> = [
      ["jup_b1_reward_actor", 6000],
      ["jup_b6_first_reward_for_actor", 2500],
      ["jup_b6_second_reward_for_actor", 2500],
      ["jup_b6_all_reward_for_actor", 5000],
      ["jup_b6_first_reward_for_actor_extra", 3500],
      ["jup_b6_second_reward_for_actor_extra", 3500],
      ["jup_b6_all_reward_for_actor_extra", 7000],
    ];

    for (const [binding, amount] of rewards) {
      callDialogsBinding(binding);
      expect(giveMoneyToActor).toHaveBeenLastCalledWith(amount);
    }
  });

  it("should check B6 outfit and start conditions and grant item rewards", () => {
    const npc: GameObject = MockGameObject.mock();
    const actor: GameObject = registry.actor;
    const csOutfit: GameObject = MockGameObject.mock({ section: outfits.cs_heavy_outfit });

    expect(callDialogsBinding("jup_b6_actor_outfit_cs")).toBe(false);
    expect(callDialogsBinding("jup_b1_actor_have_good_suit")).toBe(false);
    expect(callDialogsBinding("jup_b1_actor_do_not_have_good_suit", [actor, npc])).toBe(true);

    MockGameObject.asMock(actor).item_in_slot.mockReturnValue(csOutfit as never);
    expect(callDialogsBinding("jup_b6_actor_outfit_cs")).toBe(true);
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(true);
    expect(callDialogsBinding("jup_b6_actor_can_not_start", [actor, npc])).toBe(false);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(false);
    expect(callDialogsBinding("jup_b6_actor_can_not_start", [actor, npc])).toBe(true);

    giveInfoPortion(infoPortions.jup_b6_duty_employed);
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(true);

    callDialogsBinding("jup_b6_reward_actor_by_detector", [actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, detectors.detector_elite);

    callDialogsBinding("jup_b1_stalker_squad_thanks", [actor, npc]);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_protective);
  });

  it("should expose the medkit predicate", () => {
    expect(callDialogsBinding("jup_b202_actor_has_medkit")).toBe(false);

    mockRegisteredActor({ inventory: [[drugs.medkit_army, MockGameObject.mock({ section: drugs.medkit_army })]] });

    expect(callDialogsBinding("jup_b202_actor_has_medkit")).toBe(true);
  });
});

describe("Jupiter B9 blackbox and artefacts", () => {
  it("should calculate the blackbox fee, transfer payment, and hand over the blackbox", () => {
    const npc: GameObject = MockGameObject.mock();

    mockRegisteredActor({ money: 0 });
    expect(callDialogsBinding("jup_b9_actor_has_money")).toBe(true);
    expect(callDialogsBinding("jup_b9_actor_has_not_money", [registry.actor, npc])).toBe(false);

    callDialogsBinding("jupiter_b9_relocate_money", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 0);

    resetRegistry();
    mockRegisteredActor({
      money: 2999,
      inventory: [[questItems.jup_b9_blackbox, MockGameObject.mock({ section: questItems.jup_b9_blackbox })]],
    });
    giveInfoPortion("jup_b200_tech_materials_brought_counter_1");

    expect(callDialogsBinding("jup_b9_actor_has_money")).toBe(false);
    expect(callDialogsBinding("jup_b9_actor_has_not_money", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("if_actor_has_jup_b9_blackbox")).toBe(true);

    callDialogsBinding("give_jup_b9_blackbox", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b9_blackbox);
  });

  it("should detect and transfer the two B9 artefacts", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("if_actor_has_af_mincer_meat", [registry.actor, npc])).toBe(false);
    expect(callDialogsBinding("if_actor_has_af_fuzz_kolobok", [registry.actor, npc])).toBe(false);

    mockRegisteredActor({
      inventory: [[artefacts.af_mincer_meat, MockGameObject.mock({ section: artefacts.af_mincer_meat })]],
    });
    expect(callDialogsBinding("if_actor_has_af_mincer_meat", [registry.actor, npc])).toBe(true);
    expect(callDialogsBinding("actor_has_first_or_second_artefact", [registry.actor, npc])).toBe(true);

    callDialogsBinding("transfer_af_mincer_meat", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_mincer_meat);

    mockRegisteredActor({
      inventory: [[artefacts.af_fuzz_kolobok, MockGameObject.mock({ section: artefacts.af_fuzz_kolobok })]],
    });
    expect(callDialogsBinding("if_actor_has_af_fuzz_kolobok", [registry.actor, npc])).toBe(true);
  });
});

describe("Jupiter B46 and B43 exchanges", () => {
  it("should check, transfer, and sell the Duty founder PDA", () => {
    const npc: GameObject = MockGameObject.mock();

    expect(callDialogsBinding("jup_b46_actor_has_founder_pda")).toBe(false);

    mockRegisteredActor({
      inventory: [
        [questItems.jup_b46_duty_founder_pda, MockGameObject.mock({ section: questItems.jup_b46_duty_founder_pda })],
      ],
    });
    expect(callDialogsBinding("jup_b46_actor_has_founder_pda")).toBe(true);

    callDialogsBinding("jup_b46_transfer_duty_founder_pda", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b46_duty_founder_pda);

    callDialogsBinding("jup_b46_sell_duty_founder_pda_to_owl", [registry.actor, npc]);
    expect(giveMoneyToActor).toHaveBeenCalledWith(2500);
    expect(registry.actor.has_info(infoPortions.jup_b46_duty_founder_pda_sold)).toBe(true);
  });

  it("should award the faction-specific PDA reward and B43 guide rewards", () => {
    giveInfoPortion(infoPortions.jup_b46_duty_founder_pda_to_freedom);
    callDialogsBinding("jup_b46_sell_duty_founder_pda");

    expect(giveMoneyToActor).toHaveBeenCalledWith(4000);
    expect(giveItemsToActor).toHaveBeenCalledWith(weapons.wpn_sig550, 1);

    mockRegisteredActor({ money: 4999 });

    expect(callDialogsBinding("jup_b43_actor_has_5000_money")).toBe(false);
    expect(callDialogsBinding("jup_b43_actor_do_not_has_5000_money")).toBe(true);

    mockRegisteredActor({ money: 5000 });
    expect(callDialogsBinding("jup_b43_actor_has_5000_money")).toBe(true);

    const rewards: Array<[TName, number]> = [
      ["jup_b43_reward_for_first_artefact", 2500],
      ["jup_b43_reward_for_second_artefact", 3500],
      ["jup_b43_reward_for_both_artefacts", 6000],
    ];

    for (const [binding, amount] of rewards) {
      callDialogsBinding(binding);
      expect(giveMoneyToActor).toHaveBeenLastCalledWith(amount);
    }
  });

  it("should transfer the remaining artefact and Pripyat guide fee", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("transfer_af_fuzz_kolobok", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, artefacts.af_fuzz_kolobok);

    callDialogsBinding("pay_cost_to_guide_to_pripyat", [registry.actor, npc]);
    expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, 5000);
  });
});
