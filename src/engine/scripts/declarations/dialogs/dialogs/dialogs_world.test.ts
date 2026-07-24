import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { AnyArgs, AnyObject, TName } from "xray16/lib";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { callBinding } from "@/fixtures/engine";

function callDialogsBinding(name: TName, args: AnyArgs = []): boolean {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_world");
});

describe("level_zaton", () => {
  it("should correctly check if level is zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("level_zaton")).toBe(true);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("level_zaton")).toBe(false);
  });
});

describe("not_level_zaton", () => {
  it("should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("not_level_zaton")).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("not_level_zaton")).toBe(true);
  });
});

describe("level_jupiter", () => {
  it("should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("level_jupiter")).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("level_jupiter")).toBe(true);
  });
});

describe("not_level_jupiter", () => {
  it("should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("not_level_jupiter")).toBe(true);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("not_level_jupiter")).toBe(false);
  });
});

describe("level_pripyat", () => {
  it("should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("level_pripyat")).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    expect(callDialogsBinding("level_pripyat")).toBe(true);
  });
});

describe("not_level_pripyat", () => {
  it("should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("not_level_pripyat")).toBe(true);

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    expect(callDialogsBinding("not_level_pripyat")).toBe(false);
  });
});

describe("is_surge_running", () => {
  it("should correctly check surge state", () => {
    surgeConfig.IS_STARTED = true;
    expect(callDialogsBinding("is_surge_running")).toBe(true);

    surgeConfig.IS_STARTED = false;
    expect(callDialogsBinding("is_surge_running")).toBe(false);
  });
});

describe("is_surge_not_running", () => {
  it("should correctly check surge state", () => {
    surgeConfig.IS_FINISHED = true;
    expect(callDialogsBinding("is_surge_not_running")).toBe(true);

    surgeConfig.IS_FINISHED = false;
    expect(callDialogsBinding("is_surge_not_running")).toBe(false);
  });
});
