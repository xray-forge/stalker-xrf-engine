import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
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
 * Verify a money reward action pays exactly the expected amount.
 */
function checkMoneyReward(name: TName, amount: TCount): void {
  callDialogsBinding(name, [registry.actor, MockGameObject.mock()]);

  expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
  expect(giveMoneyToActor).toHaveBeenCalledWith(amount);
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
  require("@/engine/declarations/dialogs/jupiter/jup_b32/anomaly");
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

describe("jup_b32_task_give_dialog_precond", () => {
  it("should block the offer only while the task is started and not ended", () => {
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b32_task_start);
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(false);

    giveInfoPortion("jup_b32_task_end");
    expect(callDialogsBinding("jup_b32_task_give_dialog_precond")).toBe(true);
  });
});

describe("jup_b32_transfer_scanners", () => {
  it("should give three scanner devices", () => {
    checkTransferToActor("jup_b32_transfer_scanners", infoPortions.jup_b32_scanner_device, 3);
  });
});

describe("jup_b32_transfer_scanners_2", () => {
  it("should give two scanner devices", () => {
    checkTransferToActor("jup_b32_transfer_scanners_2", infoPortions.jup_b32_scanner_device, 2);
  });
});

describe("jup_b32_give_reward_to_actor", () => {
  it("should pay the b32 reward", () => {
    checkMoneyReward("jup_b32_give_reward_to_actor", 5000);
  });
});

describe("jup_b32_anomaly_do_not_has_af", () => {
  it("should consume the stale anomaly marker and report the artefact as present", () => {
    expect(callDialogsBinding("jup_b32_anomaly_do_not_has_af")).toBe(true);

    giveInfoPortion(infoPortions.jup_b32_anomaly_true);

    expect(callDialogsBinding("jup_b32_anomaly_do_not_has_af")).toBe(false);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_true)).toBe(false);
  });
});

describe("jup_b32_anomaly_has_af", () => {
  it("should consume the marked anomaly info only when its zone has an artefact", () => {
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    giveInfoPortion(infoPortions.jup_b32_anomaly_1);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    registry.anomalyZones.set("jup_b32_anomal_zone", { spawnedArtefactsCount: 0 } as AnomalyZoneBinder);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(false);

    registry.anomalyZones.set("jup_b32_anomal_zone", { spawnedArtefactsCount: 1 } as AnomalyZoneBinder);
    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_1)).toBe(false);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_true)).toBe(true);
  });

  it("should resolve the zone matching the marked anomaly index", () => {
    giveInfoPortion(infoPortions.jup_b32_anomaly_3);
    registry.anomalyZones.set("jup_b209_anomal_zone", { spawnedArtefactsCount: 2 } as AnomalyZoneBinder);

    expect(callDialogsBinding("jup_b32_anomaly_has_af")).toBe(true);
    expect(registry.actor.has_info(infoPortions.jup_b32_anomaly_3)).toBe(false);
  });
});
