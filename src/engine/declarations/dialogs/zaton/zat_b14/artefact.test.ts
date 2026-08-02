import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { artefacts } from "@/engine/constants/items/artefacts";
import { registry } from "@/engine/core/database";
import { giveMoneyToActor, transferItemsFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
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
  require("@/engine/declarations/dialogs/zaton/zat_b14/artefact");
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
