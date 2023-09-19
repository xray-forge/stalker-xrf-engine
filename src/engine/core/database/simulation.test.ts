import { beforeEach, describe, expect, it } from "@jest/globals";
import { alife } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerSimulator } from "@/engine/core/database/simulation";
import { AlifeSimulator } from "@/engine/lib/types";

describe("'simulation' module of the database", () => {
  beforeEach(() => {
    registry.simulator = null as unknown as AlifeSimulator;
    registry.objects = new LuaTable();
  });

  it("registerSimulator should correctly register simulator", () => {
    expect(registry.simulator).toBeNull();

    registerSimulator();

    expect(registry.simulator).toBe(alife());
  });

  it.todo("should correctly register simulation objects");

  it.todo("should correctly unregister simulation objects");

  it.todo("should correctly initialize simulation objects properties");
});
