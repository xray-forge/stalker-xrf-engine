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

beforeAll(() => require("@/engine/declarations/dialogs/quests/pripyat/autosaves"));

beforeEach(() => {
  resetFunctionMock(createGameAutoSave);
});

describe("save_pri_a17_hospital_start", () => {
  it("should create the hospital start auto-save", () => {
    checkAutoSave("save_pri_a17_hospital_start", "st_save_pri_a17_hospital_start");
  });
});
