import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { transferItemsFromActor, transferItemsToActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
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

function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
}

function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_a23/gauss");
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
