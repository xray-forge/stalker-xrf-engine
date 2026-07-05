import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager, isManagerInitialized, registry } from "@/engine/core/database";
import { PsyAntennaManager } from "@/engine/core/managers/psy/PsyAntennaManager";
import { ESoundObjectType } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

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

  it("should play both psy voice channels looped", () => {
    mockRegisteredActor();

    const psyAntennaManager: PsyAntennaManager = getManager(PsyAntennaManager);

    psyAntennaManager.updateSound();

    // Both channels must be looped (S2D + LOOPED).
    const loopedFlags: number = ESoundObjectType.S2D + ESoundObjectType.LOOPED;

    expect(psyAntennaManager.soundObjectLeft.play_at_pos).toHaveBeenCalledWith(
      registry.actor,
      expect.anything(),
      0,
      loopedFlags
    );
    expect(psyAntennaManager.soundObjectRight.play_at_pos).toHaveBeenCalledWith(
      registry.actor,
      expect.anything(),
      0,
      loopedFlags
    );
  });

  it("should correctly handle dispose", () => {
    const psyAntennaManager: PsyAntennaManager = getManager(PsyAntennaManager);

    expect(table.size(registry.managers)).toBe(2);
    expect(isManagerInitialized(PsyAntennaManager)).toBe(true);

    psyAntennaManager.dispose();

    expect(table.size(registry.managers)).toBe(1);
    expect(isManagerInitialized(PsyAntennaManager)).toBe(false);
  });
});
