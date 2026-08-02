import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { resetFunctionMock } from "xray16/testing/utils";

import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { callBinding } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/game_save");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function checkAutoSave(name: TName, saveName: TName): void {
  callDialogsBinding(name);

  expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  expect(createGameAutoSave).toHaveBeenCalledWith(saveName);
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/zaton/autosaves"));

beforeEach(() => {
  resetFunctionMock(createGameAutoSave);
});

describe("save_zat_b106_arrived_to_chimera_lair", () => {
  it("should create the chimera lair arrival auto-save", () => {
    checkAutoSave("save_zat_b106_arrived_to_chimera_lair", "st_save_zat_b106_arrived_to_chimera_lair");
  });
});

describe("save_zat_b5_met_with_others", () => {
  it("should create the zat_b5 meeting auto-save", () => {
    checkAutoSave("save_zat_b5_met_with_others", "st_save_zat_b5_met_with_others");
  });
});
