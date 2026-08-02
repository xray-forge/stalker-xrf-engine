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

beforeAll(() => require("@/engine/declarations/dialogs/quests/shared/travel"));

beforeEach(() => {
  resetFunctionMock(createGameAutoSave);
});

describe("leave_zone_save", () => {
  it("should create the zone to reality auto-save", () => {
    checkAutoSave("leave_zone_save", "st_save_uni_zone_to_reality");
  });
});

describe("save_uni_travel_zat_to_jup", () => {
  it("should create the Zaton to Jupiter auto-save", () => {
    checkAutoSave("save_uni_travel_zat_to_jup", "st_save_uni_travel_zat_to_jup");
  });
});

describe("save_uni_travel_zat_to_pri", () => {
  it("should create the Zaton to Pripyat auto-save", () => {
    checkAutoSave("save_uni_travel_zat_to_pri", "st_save_uni_travel_zat_to_pri");
  });
});

describe("save_uni_travel_jup_to_zat", () => {
  it("should create the Jupiter to Zaton auto-save", () => {
    checkAutoSave("save_uni_travel_jup_to_zat", "st_save_uni_travel_jup_to_zat");
  });
});

describe("save_uni_travel_jup_to_pri", () => {
  it("should create the Jupiter to Pripyat auto-save", () => {
    checkAutoSave("save_uni_travel_jup_to_pri", "st_save_uni_travel_jup_to_pri");
  });
});

describe("save_uni_travel_pri_to_zat", () => {
  it("should create the Pripyat to Zaton auto-save", () => {
    checkAutoSave("save_uni_travel_pri_to_zat", "st_save_uni_travel_pri_to_zat");
  });
});

describe("save_uni_travel_pri_to_jup", () => {
  it("should create the Pripyat to Jupiter auto-save", () => {
    checkAutoSave("save_uni_travel_pri_to_jup", "st_save_uni_travel_pri_to_jup");
  });
});
