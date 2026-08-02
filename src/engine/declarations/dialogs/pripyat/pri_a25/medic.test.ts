import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
import { food } from "@/engine/constants/items/food";
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
  require("@/engine/declarations/dialogs/pripyat/pri_a25/medic");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_a25_medic_give_kit", () => {
  it("should give the basic supply when no specific kit is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 4);
  });

  it("should give the advanced supply when it is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 5);
  });

  it("should give the elite supply when it is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, food.conserva, 4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.antirad, 5);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.bandage, 8);
  });

  it("should prefer the advanced supply when both tiers are requested", () => {
    const npc: GameObject = MockGameObject.mock();

    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_advanced_supply);
    giveInfoPortion(infoPortions.pri_a25_actor_needs_medikit_elite_supply);
    callDialogsBinding("pri_a25_medic_give_kit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(4);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_army, 3);
  });
});
