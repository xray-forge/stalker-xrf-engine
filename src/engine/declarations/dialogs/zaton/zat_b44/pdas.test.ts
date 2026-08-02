import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { transferItemsFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b44/pdas");
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
