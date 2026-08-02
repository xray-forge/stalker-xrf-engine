import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
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
  require("@/engine/declarations/dialogs/pripyat/pri_a17/reward");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_a17_reward", () => {
  it("should pay the reward matching the quest outcome", () => {
    const rewards: Array<[TInfoPortion, TCount]> = [
      [infoPortions.pri_a17_reward_well, 7500],
      [infoPortions.pri_a17_reward_norm, 4000],
      [infoPortions.pri_a17_reward_bad, 3000],
    ];

    for (const [infoPortion, reward] of rewards) {
      resetRegistry();
      mockRegisteredActor();

      giveInfoPortion(infoPortion);
      callDialogsBinding("pri_a17_reward");

      expect(giveMoneyToActor).toHaveBeenLastCalledWith(reward);
    }
  });

  it("should pay nothing when no outcome is recorded", () => {
    callDialogsBinding("pri_a17_reward");

    expect(giveMoneyToActor).not.toHaveBeenCalled();
  });

  it("should prefer the best outcome when several are recorded", () => {
    giveInfoPortion(infoPortions.pri_a17_reward_bad);
    giveInfoPortion(infoPortions.pri_a17_reward_norm);
    giveInfoPortion(infoPortions.pri_a17_reward_well);

    callDialogsBinding("pri_a17_reward");

    expect(giveMoneyToActor).toHaveBeenCalledTimes(1);
    expect(giveMoneyToActor).toHaveBeenCalledWith(7500);
  });
});

describe("actor_has_pri_a17_gauss_rifle", () => {
  it("should check the gauss rifle presence in the actor inventory", () => {
    expect(callDialogsBinding("actor_has_pri_a17_gauss_rifle")).toBe(false);

    resetRegistry();
    mockRegisteredActor({
      inventory: [["pri_a17_gauss_rifle", MockGameObject.mock({ section: "pri_a17_gauss_rifle" })]],
    });

    expect(callDialogsBinding("actor_has_pri_a17_gauss_rifle")).toBe(true);
  });
});

describe("actor_hasnt_pri_a17_gauss_rifle", () => {
  it("should invert the gauss rifle presence check", () => {
    expect(callDialogsBinding("actor_hasnt_pri_a17_gauss_rifle")).toBe(true);

    resetRegistry();
    mockRegisteredActor({
      inventory: [["pri_a17_gauss_rifle", MockGameObject.mock({ section: "pri_a17_gauss_rifle" })]],
    });

    expect(callDialogsBinding("actor_hasnt_pri_a17_gauss_rifle")).toBe(false);
  });
});

describe("transfer_artifact_af_baloon", () => {
  it("should transfer the baloon artefact from the NPC", () => {
    const npc: GameObject = MockGameObject.mock();

    callDialogsBinding("transfer_artifact_af_baloon", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_baloon);
  });
});

describe("pri_a17_sokolov_is_not_at_base", () => {
  it("should require both departure and death info portions", () => {
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);

    giveInfoPortion(infoPortions.pri_a15_sokolov_out);
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);

    giveInfoPortion(infoPortions.pas_b400_sokolov_dead);
    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(true);
  });

  it("should not accept the death info portion alone", () => {
    giveInfoPortion(infoPortions.pas_b400_sokolov_dead);

    expect(callDialogsBinding("pri_a17_sokolov_is_not_at_base")).toBe(false);
  });
});
