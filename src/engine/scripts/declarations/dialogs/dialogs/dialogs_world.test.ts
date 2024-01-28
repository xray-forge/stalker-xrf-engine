import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding } from "@/fixtures/engine";

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs", name);
}

function callDialogsBinding(name: TName, args: AnyArgs = []): boolean {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

describe("dialogs_generic external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_world");
  });

  it("should correctly inject dialog functors", () => {
    checkDialogsBinding("level_zaton");
    checkDialogsBinding("level_jupiter");
    checkDialogsBinding("level_pripyat");
    checkDialogsBinding("not_level_zaton");
    checkDialogsBinding("not_level_jupiter");
    checkDialogsBinding("not_level_pripyat");
    checkDialogsBinding("is_surge_running");
    checkDialogsBinding("is_surge_not_running");
  });

  it("level_zaton should correctly check if level is zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("level_zaton")).toBe(true);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("level_zaton")).toBe(false);
  });

  it("not_level_zaton should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("not_level_zaton")).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("not_level_zaton")).toBe(true);
  });

  it("level_jupiter should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("level_jupiter")).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("level_jupiter")).toBe(true);
  });

  it("not_level_jupiter should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("not_level_jupiter")).toBe(true);

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    expect(callDialogsBinding("not_level_jupiter")).toBe(false);
  });

  it("level_pripyat should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("level_pripyat")).toBe(false);

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    expect(callDialogsBinding("level_pripyat")).toBe(true);
  });

  it("not_level_pripyat should correctly check if level is not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    expect(callDialogsBinding("not_level_pripyat")).toBe(true);

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    expect(callDialogsBinding("not_level_pripyat")).toBe(false);
  });

  it("is_surge_running should correctly check surge state", () => {
    surgeConfig.IS_STARTED = true;
    expect(callDialogsBinding("is_surge_running")).toBe(true);

    surgeConfig.IS_STARTED = false;
    expect(callDialogsBinding("is_surge_running")).toBe(false);
  });

  it("is_surge_not_running should correctly check surge state", () => {
    surgeConfig.IS_FINISHED = true;
    expect(callDialogsBinding("is_surge_not_running")).toBe(true);

    surgeConfig.IS_FINISHED = false;
    expect(callDialogsBinding("is_surge_not_running")).toBe(false);
  });
});
