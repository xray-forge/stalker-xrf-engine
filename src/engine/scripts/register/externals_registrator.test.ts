import { describe, expect, it, jest } from "@jest/globals";
import { AnyCallable, extern, getExtern } from "xray16/lib";
import { $fromArray } from "xray16/macros";

import { discoverDeclarationModules, loadDeclarationModules } from "@/engine/scripts/register/declaration_modules";
import { registerExternals } from "@/engine/scripts/register/externals_registrator";

jest.mock("@/engine/scripts/register/declaration_modules");

describe("extrnals_registrator entry point", () => {
  it("registerExternals should correctly register globals and mark as called", () => {
    jest.mocked(discoverDeclarationModules).mockReturnValue($fromArray(["scripts.declarations.callbacks.actor"]));
    jest.mocked(loadDeclarationModules).mockImplementation(() => {
      require("@/engine/scripts/declarations/callbacks");
      require("@/engine/scripts/declarations/conditions");
      require("@/engine/scripts/declarations/effects");
      require("@/engine/scripts/declarations/tasks");
      require("@/engine/scripts/declarations/dialogs");
    });

    expect(getExtern("areExternalsRegistered")).toBeFalsy();

    registerExternals();

    expect(getExtern("areExternalsRegistered")).toBeTruthy();

    expect(getExtern("engine")).toBeDefined();
    expect(getExtern("task_functors")).toBeDefined();

    expect(getExtern("xr_conditions")).toBeDefined();
    expect(getExtern("xr_effects")).toBeDefined();

    expect(getExtern("dialogs")).toBeDefined();
    expect(getExtern("dialog_manager")).toBeDefined();
    expect(getExtern("dialogs_pripyat")).toBeDefined();
    expect(getExtern("dialogs_jupiter")).toBeDefined();
    expect(getExtern("dialogs_zaton")).toBeDefined();
    expect(getExtern("zat_b29_create_af_in_anomaly", getExtern("dialogs_zaton"))).toBeDefined();
    expect(getExtern("zat_b29_actor_exchange", getExtern("dialogs_zaton"))).toBeDefined();

    // Do not re-declare same values.
    const previous: AnyCallable = getExtern("on_actor_critical_power");

    expect(() => {
      registerExternals();
    }).not.toThrow();

    expect(previous).toBe(getExtern("on_actor_critical_power"));
    expect(discoverDeclarationModules).toHaveBeenCalledTimes(1);
    expect(loadDeclarationModules).toHaveBeenCalledTimes(1);
  });

  it("fails without payload modules and permits a later retry", () => {
    extern("areExternalsRegistered", false);
    extern("areExternalsRegistering", false);
    jest.mocked(discoverDeclarationModules).mockReturnValueOnce(new LuaTable());

    expect(() => registerExternals()).toThrow("No declaration payload modules found");
    expect(getExtern("areExternalsRegistered")).toBe(false);
    expect(getExtern("areExternalsRegistering")).toBe(false);

    jest.mocked(discoverDeclarationModules).mockReturnValue($fromArray(["scripts.declarations.callbacks.actor"]));
    jest.mocked(loadDeclarationModules).mockImplementation(() => {});

    expect(() => registerExternals()).not.toThrow();
    expect(getExtern("areExternalsRegistered")).toBe(true);
    expect(getExtern("areExternalsRegistering")).toBe(false);
  });

  it("clears the in-progress marker when a payload fails to load", () => {
    extern("areExternalsRegistered", false);
    extern("areExternalsRegistering", false);
    jest.mocked(discoverDeclarationModules).mockReturnValue($fromArray(["scripts.declarations.callbacks.actor"]));
    jest.mocked(loadDeclarationModules).mockImplementationOnce(() => {
      throw new Error("payload failed");
    });

    expect(() => registerExternals()).toThrow("payload failed");
    expect(getExtern("areExternalsRegistered")).toBe(false);
    expect(getExtern("areExternalsRegistering")).toBe(false);

    jest.mocked(loadDeclarationModules).mockImplementation(() => {});

    expect(() => registerExternals()).not.toThrow();
    expect(getExtern("areExternalsRegistered")).toBe(true);
  });
});
