import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/game_save");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function checkAutoSave(name: TName, saveName: TName): void {
  callDialogsBinding(name);

  expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  expect(createGameAutoSave).toHaveBeenCalledWith(saveName);
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/jupiter/autosaves"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(createGameAutoSave);
});

describe("save_jup_b218_travel_jup_to_pas", () => {
  it("should create the Jupiter to underpass auto-save", () => {
    checkAutoSave("save_jup_b218_travel_jup_to_pas", "st_save_jup_b218_travel_jup_to_pas");
  });
});

describe("save_jup_a10_gonna_return_debt", () => {
  it("should create the return debt auto-save and remember it", () => {
    checkAutoSave("save_jup_a10_gonna_return_debt", "st_save_jup_a10_gonna_return_debt");

    expect(registry.actor.has_info(infoPortions.jup_a10_avtosave)).toBe(true);
  });

  it("should save only once", () => {
    callDialogsBinding("save_jup_a10_gonna_return_debt");
    callDialogsBinding("save_jup_a10_gonna_return_debt");

    expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  });

  it("should skip the save when it already happened", () => {
    giveInfoPortion(infoPortions.jup_a10_avtosave);

    callDialogsBinding("save_jup_a10_gonna_return_debt");

    expect(createGameAutoSave).not.toHaveBeenCalled();
  });
});

describe("save_jup_b6_arrived_to_fen", () => {
  it("should create the fen arrival auto-save", () => {
    checkAutoSave("save_jup_b6_arrived_to_fen", "st_save_jup_b6_arrived_to_fen");
  });
});

describe("save_jup_b6_arrived_to_ash_heap", () => {
  it("should create the ash heap arrival auto-save", () => {
    checkAutoSave("save_jup_b6_arrived_to_ash_heap", "st_save_jup_b6_arrived_to_ash_heap");
  });
});

describe("save_jup_b19_arrived_to_kopachy", () => {
  it("should create the Kopachy arrival auto-save", () => {
    checkAutoSave("save_jup_b19_arrived_to_kopachy", "st_save_jup_b19_arrived_to_kopachy");
  });
});
