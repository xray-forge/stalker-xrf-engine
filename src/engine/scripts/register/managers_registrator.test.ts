import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { AnyObject } from "@/engine/lib/types";
import { registerManagers } from "@/engine/scripts/register/managers_registrator";

describe("'managers_registrator' entry point", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("'registerSchemeModules' should correctly re-register required managers", () => {
    registerManagers();

    expect((registry.managers as AnyObject).size).toBe(24);
  });
});
