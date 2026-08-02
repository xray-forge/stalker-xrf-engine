import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { isStalkerAlive } from "@/engine/core/utils/object";
import { callBinding } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/object");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function checkAlivePredicate(name: TName, storyId: TName): void {
  replaceFunctionMock(isStalkerAlive, () => true);
  expect(callDialogsBinding(name)).toBe(true);
  expect(isStalkerAlive).toHaveBeenLastCalledWith(storyId);

  replaceFunctionMock(isStalkerAlive, () => false);
  expect(callDialogsBinding(name)).toBe(false);
  expect(isStalkerAlive).toHaveBeenLastCalledWith(storyId);
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/zaton/zat_b7/spartak"));

beforeEach(() => {
  resetFunctionMock(isStalkerAlive);
});

describe("spartak_is_alive", () => {
  it("should follow the zat_b7 victim state", () => {
    checkAlivePredicate("spartak_is_alive", "zat_b7_stalker_victim_1");
  });
});
