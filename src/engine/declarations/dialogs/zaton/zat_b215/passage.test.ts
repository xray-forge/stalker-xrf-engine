import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { transferMoneyFromActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function checkMoneyPredicate(name: TName, amount: TCount, expectedWhenEnough: boolean = true): void {
  mockActorWith([], { money: amount - 1 });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expectedWhenEnough);

  mockActorWith([], { money: amount });
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expectedWhenEnough);
}

function checkMoneyTransfer(name: TName, amount: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  expect(transferMoneyFromActor).toHaveBeenCalledTimes(1);
  expect(transferMoneyFromActor).toHaveBeenCalledWith(npc, amount);
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
  resetFunctionMock(transferMoneyFromActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b215/passage");
});

describe("zat_b215_counter_greater_3", () => {
  it("should check the Pripyat way counter against three", () => {
    setPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 3);
    expect(callDialogsBinding("zat_b215_counter_greater_3")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "zat_a9_way_to_pripyat_counter", 4);
    expect(callDialogsBinding("zat_b215_counter_greater_3")).toBe(true);
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
