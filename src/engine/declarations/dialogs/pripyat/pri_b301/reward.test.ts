import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
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
  require("@/engine/declarations/dialogs/pripyat/pri_b301/reward");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_b301_zulus_reward", () => {
  it("should transfer the Zulus machine gun from the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b301_zulus_reward", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_pkm_zulus);
  });
});
