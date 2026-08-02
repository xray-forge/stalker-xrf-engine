import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
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
  require("@/engine/declarations/dialogs/jupiter/toolkits/trapper");
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

describe("actor_relocate_trapper_reward", () => {
  it("should transfer the trapper rifle to the actor", () => {
    checkTransferToActor("actor_relocate_trapper_reward", weapons.wpn_wincheaster1300_trapper);
  });
});

describe("zat_b106_trapper_reward", () => {
  it("should increase the trapper payment for a one-hit chimera kill", () => {
    callDialogsBinding("zat_b106_trapper_reward");
    expect(giveMoneyToActor).toHaveBeenLastCalledWith(2000);

    giveInfoPortion(infoPortions.zat_b106_one_hit);

    callDialogsBinding("zat_b106_trapper_reward");
    expect(giveMoneyToActor).toHaveBeenLastCalledWith(3000);
  });
});
