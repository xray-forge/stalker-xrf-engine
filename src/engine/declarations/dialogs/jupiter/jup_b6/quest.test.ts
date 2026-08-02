import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { detectors } from "@/engine/constants/items/detectors";
import { outfits } from "@/engine/constants/items/outfits";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";

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
 * Verify a money reward action pays exactly the expected amount.
 */
function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
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
  require("@/engine/declarations/dialogs/jupiter/jup_b6/quest");
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

describe("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond", () => {
  it("should require the b32 quest to be active", () => {
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);

    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(true);
  });

  it("should close once the addon started after the task was given or failed", () => {
    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    giveInfoPortion(infoPortions.jup_b6_give_task);
    giveInfoPortion(infoPortions.jup_b32_task_addon_start);
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);

    mockActorWith([]);
    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    giveInfoPortion(infoPortions.jup_b6_task_fail);
    giveInfoPortion(infoPortions.jup_b32_task_addon_start);
    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(false);
  });

  it("should stay open while the addon has not started", () => {
    giveInfoPortion(infoPortions.jup_b6_b32_quest_active);
    giveInfoPortion(infoPortions.jup_b6_give_task);

    expect(callDialogsBinding("jup_b6_scientist_nuclear_physicist_scan_anomaly_precond")).toBe(true);
  });
});

describe("jup_b6_actor_outfit_cs", () => {
  it("should detect the clear sky heavy outfit in the body slot", () => {
    expect(callDialogsBinding("jup_b6_actor_outfit_cs")).toBe(false);

    const outfit: GameObject = MockGameObject.mock({ section: outfits.cs_heavy_outfit });

    MockGameObject.asMock(registry.actor).item_in_slot.mockReturnValue(outfit as never);

    expect(callDialogsBinding("jup_b6_actor_outfit_cs")).toBe(true);
  });
});

describe("jup_b6_first_reward_for_actor", () => {
  it("should pay the first b6 reward", () => {
    checkMoneyReward("jup_b6_first_reward_for_actor", 2500);
  });
});

describe("jup_b6_second_reward_for_actor", () => {
  it("should pay the second b6 reward", () => {
    checkMoneyReward("jup_b6_second_reward_for_actor", 2500);
  });
});

describe("jup_b6_all_reward_for_actor", () => {
  it("should pay the combined b6 reward", () => {
    checkMoneyReward("jup_b6_all_reward_for_actor", 5000);
  });
});

describe("jup_b6_first_reward_for_actor_extra", () => {
  it("should pay the extra first b6 reward", () => {
    checkMoneyReward("jup_b6_first_reward_for_actor_extra", 3500);
  });
});

describe("jup_b6_second_reward_for_actor_extra", () => {
  it("should pay the extra second b6 reward", () => {
    checkMoneyReward("jup_b6_second_reward_for_actor_extra", 3500);
  });
});

describe("jup_b6_all_reward_for_actor_extra", () => {
  it("should pay the combined extra b6 reward", () => {
    checkMoneyReward("jup_b6_all_reward_for_actor_extra", 7000);
  });
});

describe("jup_b6_reward_actor_by_detector", () => {
  it("should give the elite detector", () => {
    checkTransferToActor("jup_b6_reward_actor_by_detector", detectors.detector_elite);
  });
});

describe("jup_b6_actor_can_start", () => {
  it("should allow the start until the b1 squad died with nobody employed", () => {
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(true);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(false);
  });

  it("should allow the start again once any squad is employed", () => {
    for (const portion of [
      infoPortions.jup_b6_freedom_employed,
      infoPortions.jup_b6_duty_employed,
      infoPortions.jup_b6_gonta_employed,
      infoPortions.jup_b6_exprisoner_work_on_sci,
    ]) {
      mockActorWith([]);

      giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
      giveInfoPortion(portion);

      expect(callDialogsBinding("jup_b6_actor_can_start")).toBe(true);
    }
  });
});

describe("jup_b6_actor_can_not_start", () => {
  it("should invert the b6 start check", () => {
    expect(callDialogsBinding("jup_b6_actor_can_not_start", [registry.actor, MockGameObject.mock()])).toBe(false);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_actor_can_not_start", [registry.actor, MockGameObject.mock()])).toBe(true);
  });
});

describe("jup_b6_stalker_dialog_precond", () => {
  /**
   * Build an NPC speaker that belongs to a squad with the provided section name.
   */
  function mockSquadMember(squadSection: TName): GameObject {
    const squad: MockSquad = MockSquad.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    // The squad section is spied rather than configured, since constructing a squad reads its ini section.
    jest.spyOn(squad, "section_name").mockImplementation(() => squadSection);

    serverObject.group_id = squad.id;

    return MockGameObject.mock({ id: serverObject.id });
  }

  beforeEach(() => {
    registry.simulator = MockAlifeSimulator.getInstance();
  });

  it("should reject a speaker that has no server object", () => {
    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, MockGameObject.mock()])).toBe(false);
  });

  it("should accept the b1 stalker squad while it is alive", () => {
    const npc: GameObject = mockSquadMember(infoPortions.jup_b1_stalker_squad);

    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(true);

    giveInfoPortion(infoPortions.jup_b1_squad_is_dead);
    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(false);
  });

  it("should accept each employed squad only once its employment info portion is set", () => {
    const squads: Array<[TName, TName]> = [
      [infoPortions.jup_b6_stalker_freedom_squad, infoPortions.jup_b6_freedom_employed],
      [infoPortions.jup_b6_stalker_duty_squad, infoPortions.jup_b6_duty_employed],
      [infoPortions.jup_b6_stalker_gonta_squad, infoPortions.jup_b6_gonta_employed],
      [infoPortions.jup_b6_stalker_exprisoner_squad, infoPortions.jup_b6_exprisoner_work_on_sci],
    ];

    for (const [squadSection, employedPortion] of squads) {
      mockActorWith([]);
      registry.simulator = MockAlifeSimulator.getInstance();

      const npc: GameObject = mockSquadMember(squadSection);

      expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(false);

      giveInfoPortion(employedPortion);
      expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(true);
    }
  });

  it("should reject a squad that is not part of the quest", () => {
    const npc: GameObject = mockSquadMember("some_other_squad");

    expect(callDialogsBinding("jup_b6_stalker_dialog_precond", [registry.actor, npc])).toBe(false);
  });
});

describe("jupiter_b6_sell_halfartefact", () => {
  it("should pay for the half artefact", () => {
    checkMoneyReward("jupiter_b6_sell_halfartefact", 2000);
  });
});
