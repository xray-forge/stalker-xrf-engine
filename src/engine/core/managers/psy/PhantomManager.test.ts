import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { AnyObject } from "xray16/lib";
import { MockVector } from "xray16/mocks";

import { disposeManager, getManager, isManagerInitialized } from "@/engine/core/database";
import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { resetRegistry } from "@/fixtures/engine";

describe("PhantomManager", () => {
  beforeEach(() => {
    resetRegistry();

    // todo: Replace with SDK methods once it is updated.
    (level as unknown as AnyObject).spawn_phantom = jest.fn();
  });

  it("should initialize and destroy", () => {
    getManager(PhantomManager);

    expect(isManagerInitialized(PhantomManager)).toBe(true);

    disposeManager(PhantomManager);

    expect(isManagerInitialized(PhantomManager)).toBe(false);
  });

  it("should track added and removed phantoms", () => {
    const manager: PhantomManager = getManager(PhantomManager);

    manager.addPhantom();
    manager.addPhantom();
    manager.removePhantom();

    expect(manager.phantomsCount).toBe(1);
  });

  it("should spawn a phantom at the provided position", () => {
    const manager: PhantomManager = getManager(PhantomManager);
    const position = MockVector.create(10, 20, 30);

    manager.spawnPhantom(position);

    expect(level.spawn_phantom).toHaveBeenCalledWith(position);
  });
});
