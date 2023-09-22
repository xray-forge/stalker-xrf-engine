import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/engine/core/utils/class_ids", () => ({ updateClassIds: jest.fn(), createClassIds: jest.fn() }));
jest.mock("@/engine/core/utils/ini/ini_system", () => ({ unlockSystemIniOverriding: jest.fn() }));
jest.mock("@/engine/scripts/register/extensions_registrator", () => ({ registerExtensions: jest.fn() }));
jest.mock("@/engine/scripts/register/managers_registrator", () => ({ registerManagers: jest.fn() }));
jest.mock("@/engine/scripts/register/schemes_registrator", () => ({ registerSchemes: jest.fn() }));

import { updateClassIds } from "@/engine/core/utils/class_ids";
import { unlockSystemIniOverriding } from "@/engine/core/utils/ini";
import { AnyObject } from "@/engine/lib/types";
import { registerExtensions } from "@/engine/scripts/register/extensions_registrator";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";
import { registerSchemes } from "@/engine/scripts/register/schemes_registrator";

describe("start entry point", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["start"]).toBeDefined();
    expect(typeof container["start"]).toBe("object");
    expect(typeof container["start"][name]).toBe("function");
  };

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
  });
});
