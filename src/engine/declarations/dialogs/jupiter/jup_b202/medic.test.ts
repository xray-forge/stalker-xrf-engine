import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { drugs } from "@/engine/constants/items/drugs";
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
 * Re-register the actor carrying the provided sections, dropping any previously given info portions.
 *
 * Inventory keys are index-suffixed so repeating the same section registers separate items, while
 * `object(section)` lookups still resolve by section.
 */
function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/effects/relation/set_squad_goodwill");
  require("@/engine/declarations/dialogs/jupiter/jup_b202/medic");
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

describe("jup_b202_actor_has_medkit", () => {
  it("should accept any medkit variant", () => {
    expect(callDialogsBinding("jup_b202_actor_has_medkit")).toBe(false);

    for (const medkit of [drugs.medkit, drugs.medkit_army, drugs.medkit_scientic]) {
      mockActorWith([medkit]);
      expect(callDialogsBinding("jup_b202_actor_has_medkit")).toBe(true);
    }
  });
});

describe("jup_b202_hit_bandit_from_actor", () => {
  it("should record both hit info portions and turn the bandit squad hostile", () => {
    const npc: GameObject = MockGameObject.mock();
    const setSquadGoodwill = jest.fn();

    (_G as AnyObject)["xr_effects"].set_squad_goodwill = setSquadGoodwill;

    callDialogsBinding("jup_b202_hit_bandit_from_actor", [registry.actor, npc]);

    expect(registry.actor.has_info(infoPortions.jup_b202_bandit_hited)).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b202_bandit_hited_by_actor)).toBe(true);
    expect(setSquadGoodwill).toHaveBeenCalledWith(registry.actor, npc, ["jup_b202_bandit_squad", "enemy"]);
  });
});

describe("jup_b202_medic_dialog_precondition", () => {
  it("should switch to the polustanok check once the squad is gathered", () => {
    giveInfoPortion(infoPortions.jup_b218_gather_squad_complete);
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(true);

    giveInfoPortion(infoPortions.jup_b202_polustanok);
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(false);
  });

  it("should use the medic testimony check before the squad is gathered", () => {
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(true);

    giveInfoPortion(infoPortions.jup_b52_medic_testimony);
    expect(callDialogsBinding("jup_b202_medic_dialog_precondition")).toBe(false);
  });
});

describe("jup_b202_transfer_medkit", () => {
  it("should prefer the plain medkit when several kinds are carried", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([drugs.medkit, drugs.medkit_army, drugs.medkit_scientic]);
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, drugs.medkit);
  });

  it("should fall back to the army and scientific medkits in order", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWith([drugs.medkit_army, drugs.medkit_scientic]);
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenLastCalledWith(npc, drugs.medkit_army);

    mockActorWith([drugs.medkit_scientic]);
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, npc]);
    expect(transferItemsFromActor).toHaveBeenLastCalledWith(npc, drugs.medkit_scientic);
  });

  it("should transfer nothing when the actor has no medkit", () => {
    callDialogsBinding("jup_b202_transfer_medkit", [registry.actor, MockGameObject.mock()]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
  });
});
