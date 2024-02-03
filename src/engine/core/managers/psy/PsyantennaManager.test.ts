import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager, isManagerInitialized, registry } from "@/engine/core/database";
import { PsyAntennaManager } from "@/engine/core/managers/psy/PsyAntennaManager";
import { resetRegistry } from "@/fixtures/engine";

describe("PsyAntennaManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it.todo("should correctly initialize and destroy");

  it.todo("should correctly handle save/load state");

  it.todo("should correctly handle save/load manager information");

  it.todo("should correctly handle update event");

  it.todo("should correctly create phantoms");

  it.todo("should correctly hit");

  it.todo("should correctly handle post process effects");

  it.todo("should correctly handle sounds");

  it("should correctly handle dispose", () => {
    const psyAntennaManager: PsyAntennaManager = getManager(PsyAntennaManager);

    expect(registry.managers.length()).toBe(2);
    expect(isManagerInitialized(PsyAntennaManager)).toBe(true);

    psyAntennaManager.dispose();

    expect(registry.managers.length()).toBe(1);
    expect(isManagerInitialized(PsyAntennaManager)).toBe(false);
  });
});
