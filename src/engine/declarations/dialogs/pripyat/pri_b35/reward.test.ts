import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
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
  require("@/engine/declarations/dialogs/pripyat/pri_b35/reward");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_b35_transfer_svd", () => {
  it("should transfer the rifle together with its ammunition", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b35_transfer_svd", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, weapons.wpn_svd);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, ammo["ammo_7.62x54_7h1"]);
  });
});

describe("pri_b35_give_actor_reward", () => {
  it("should triple the ammunition reward once the secondary objective is done", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_b35_give_actor_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"], 1);

    giveInfoPortion(infoPortions.pri_b35_secondary);

    callDialogsBinding("pri_b35_give_actor_reward", [registry.actor, npc]);
    expect(transferItemsToActor).toHaveBeenLastCalledWith(npc, ammo["ammo_7.62x54_7h1"], 3);
  });
});
