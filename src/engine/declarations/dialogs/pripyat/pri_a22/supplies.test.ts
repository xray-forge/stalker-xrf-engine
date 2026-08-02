import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { helmets } from "@/engine/constants/items/helmets";
import { outfits } from "@/engine/constants/items/outfits";
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
  require("@/engine/declarations/dialogs/pripyat/pri_a22/supplies");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_a22_army_signaller_supply", () => {
  it("should give the supply matching the requested supply info portion", () => {
    const supplies: Array<[TName, Array<[TSection, TCount]>]> = [
      [
        "supply_ammo_1",
        [
          ["ammo_9x18_fmj", 2],
          ["ammo_9x18_pmm", 1],
        ],
      ],
      [
        "supply_ammo_2",
        [
          ["ammo_9x19_fmj", 2],
          ["ammo_9x19_pbp", 1],
        ],
      ],
      [
        "supply_ammo_3",
        [
          ["ammo_11.43x23_fmj", 2],
          ["ammo_11.43x23_hydro", 1],
        ],
      ],
      [
        "supply_ammo_4",
        [
          ["ammo_12x70_buck", 10],
          ["ammo_12x76_zhekan", 5],
        ],
      ],
      [
        "supply_ammo_5",
        [
          ["ammo_5.45x39_fmj", 2],
          ["ammo_5.45x39_ap", 1],
        ],
      ],
      [
        "supply_ammo_6",
        [
          ["ammo_5.56x45_ss190", 2],
          ["ammo_5.56x45_ap", 1],
        ],
      ],
      [
        "supply_ammo_7",
        [
          ["ammo_9x39_pab9", 1],
          ["ammo_9x39_ap", 1],
        ],
      ],
      ["supply_ammo_8", [["ammo_7.62x54_7h1", 1]]],
      ["supply_ammo_9", [["ammo_pkm_100", 1]]],
      [
        "supply_grenade_1",
        [
          ["grenade_rgd5", 3],
          ["grenade_f1", 2],
        ],
      ],
      ["supply_grenade_2", [["ammo_vog-25", 3]]],
      ["supply_grenade_3", [["ammo_m209", 3]]],
    ];

    for (const [supply, items] of supplies) {
      resetRegistry();
      mockRegisteredActor();
      resetFunctionMock(transferItemsToActor);

      const npc: GameObject = MockGameObject.mock();

      giveInfoPortion(supply);
      callDialogsBinding("pri_a22_army_signaller_supply", [registry.actor, npc]);

      expect(transferItemsToActor).toHaveBeenCalledTimes(items.length);

      for (const [section, count] of items) {
        expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
      }
    }
  });

  it("should give nothing when no supply is requested", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a22_army_signaller_supply", [registry.actor, npc]);

    expect(transferItemsToActor).not.toHaveBeenCalled();
  });
});

describe("pri_a22_give_actor_outfit", () => {
  it("should transfer the military outfit together with the helmet", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("pri_a22_give_actor_outfit", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, outfits.military_outfit);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, helmets.helm_battle);
  });
});
