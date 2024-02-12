import { describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { updateClassIds } from "@/engine/core/utils/class_ids_list";
import { unlockSystemIniOverriding } from "@/engine/core/utils/ini";
import { AnyObject } from "@/engine/lib/types";
import { registerExtensions } from "@/engine/scripts/register/extensions_registrator";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";
import { registerSchemes } from "@/engine/scripts/register/schemes_registrator";

function checkBinding(name: string, container: AnyObject = global): void {
  expect(container["start"]).toBeDefined();
  expect(typeof container["start"]).toBe("object");
  expect(typeof container["start"][name]).toBe("function");
}

jest.mock("@/engine/core/utils/class_ids_list");
jest.mock("@/engine/core/utils/ini/ini_system");
jest.mock("@/engine/scripts/register/extensions_registrator");
jest.mock("@/engine/scripts/register/managers_registrator");
jest.mock("@/engine/scripts/register/schemes_registrator");

describe("start entry point", () => {
  it("should correctly inject starting methods for game", () => {
    require("@/engine/scripts/start");

    checkBinding("callback");
  });

  it("should correctly init methods on start", () => {
    require("@/engine/scripts/start");

    (global as AnyObject).start.callback();

    expect(updateClassIds).toHaveBeenCalledTimes(1);
    expect(unlockSystemIniOverriding).toHaveBeenCalledTimes(1);
    expect(registerExtensions).toHaveBeenCalledTimes(1);
    expect(registerManagers).toHaveBeenCalledTimes(1);
    expect(registerSchemes).toHaveBeenCalledTimes(1);
    expect(registry.simulator).not.toBeNull();
    expect(registry.ranks.isInitialized).toBe(true);
  });
});
