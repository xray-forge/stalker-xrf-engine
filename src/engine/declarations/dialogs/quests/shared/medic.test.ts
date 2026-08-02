import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { isObjectInjured } from "@/engine/core/utils/object";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/object");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/shared/medic"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(isObjectInjured);
});

describe("medic_magic_potion", () => {
  it("should fully restore the actor", () => {
    const { actorGameObject } = mockRegisteredActor({ bleeding: 0.5, health: 0.4, power: 0.3, radiation: 0.2 });

    callDialogsBinding("medic_magic_potion");

    expect(actorGameObject.health).toBe(1);
    expect(actorGameObject.power).toBe(1);
    expect(actorGameObject.radiation).toBe(0);
    expect(actorGameObject.bleeding).toBe(0);
  });

  it("should leave an already healthy actor untouched", () => {
    const { actorGameObject } = mockRegisteredActor({ bleeding: 0, health: 1, power: 1, radiation: 0 });

    callDialogsBinding("medic_magic_potion");

    expect(actorGameObject.health).toBe(1);
    expect(actorGameObject.power).toBe(1);
    expect(actorGameObject.radiation).toBe(0);
    expect(actorGameObject.bleeding).toBe(0);
  });
});

describe("actor_needs_bless", () => {
  it("should follow the actor injury state", () => {
    replaceFunctionMock(isObjectInjured, () => true);
    expect(callDialogsBinding("actor_needs_bless")).toBe(true);

    replaceFunctionMock(isObjectInjured, () => false);
    expect(callDialogsBinding("actor_needs_bless")).toBe(false);
  });
});

describe("actor_is_damn_healthy", () => {
  it("should invert the actor injury state", () => {
    replaceFunctionMock(isObjectInjured, () => true);
    expect(callDialogsBinding("actor_is_damn_healthy")).toBe(false);

    replaceFunctionMock(isObjectInjured, () => false);
    expect(callDialogsBinding("actor_is_damn_healthy")).toBe(true);
  });
});
