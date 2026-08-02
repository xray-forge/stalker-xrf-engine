import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { questItems } from "@/engine/constants/items/quest_items";
import { registry } from "@/engine/core/database";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";
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

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b12/documents");
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
