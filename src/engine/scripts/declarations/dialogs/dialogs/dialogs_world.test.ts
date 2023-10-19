import { beforeAll, describe, expect, it } from "@jest/globals";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding } from "@/fixtures/engine";

describe("dialogs_generic external callbacks", () => {
  const checkDialogsBinding = (name: TName) => checkNestedBinding("dialogs", name);
  const callDialogsBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject)["dialogs"]);

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

  it.todo("level_zaton should correctly check if level is zaton");

  it.todo("level_not_zaton should correctly check if level is not zaton");

  it.todo("level_jupiter should correctly check if level is jupiter");

  it.todo("level_not_jupiter should correctly check if level is not jupiter");

  it.todo("level_pripyat should correctly check if level is pripyat");

  it.todo("level_not_pripyat should correctly check if level is not pripyat");

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
