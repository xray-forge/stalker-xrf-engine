import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hit, level, time_global } from "xray16";
import { ESoundObjectType } from "xray16/alias";
import { AnyObject } from "xray16/lib";
import { MockNetProcessor } from "xray16/mocks";

import { disposeManager, getManager, isManagerInitialized, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { PsyAntennaManager } from "@/engine/core/managers/psy/PsyAntennaManager";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("PsyAntennaManager", () => {
  beforeEach(() => {
    resetRegistry();

    // todo: Replace with SDK methods once it is updated.
    (level as unknown as AnyObject).set_pp_effector_factor = jest.fn();
    (level as unknown as AnyObject).remove_pp_effector = jest.fn();
    (level as unknown as AnyObject).spawn_phantom = jest.fn();
  });

  it("should register and unregister event callbacks during its lifecycle", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);

    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_OFFLINE)).toBe(1);

    disposeManager(PsyAntennaManager);

    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(0);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_GO_OFFLINE)).toBe(0);
    expect(manager.soundObjectLeft.stop).toHaveBeenCalledTimes(1);
    expect(manager.soundObjectRight.stop).toHaveBeenCalledTimes(1);
    expect(level.set_snd_volume).toHaveBeenCalledWith(manager.sndVolume);
  });

  it("should save and load its state", () => {
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.hitIntensity = 0.6;
    manager.soundIntensity = 0.4;
    manager.soundIntensityBase = 0.8;
    manager.muteSoundThreshold = 0.2;
    manager.noStatic = true;
    manager.noMumble = true;
    manager.hitType = "chemical";
    manager.hitFreq = 1_500;
    manager.postprocessCount = 1;
    manager.postprocess.set("psy.ppe", { intensity: 0.4, intensityBase: 0.8, idx: 1504 });

    manager.save(processor.asNetPacket());
    disposeManager(PsyAntennaManager);

    const loadedManager: PsyAntennaManager = getManager(PsyAntennaManager);

    loadedManager.load(processor.asNetReader());

    expect(loadedManager.hitIntensity).toBe(0.6);
    expect(loadedManager.soundIntensity).toBe(0.4);
    expect(loadedManager.soundIntensityBase).toBe(0.8);
    expect(loadedManager.muteSoundThreshold).toBe(0.2);
    expect(loadedManager.noStatic).toBe(true);
    expect(loadedManager.noMumble).toBe(true);
    expect(loadedManager.hitType).toBe("chemical");
    expect(loadedManager.hitFreq).toBe(1_500);
    expect(loadedManager.postprocess.get("psy.ppe")).toEqual({ intensity: 0.4, intensityBase: 0.8, idx: 1504 });
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it("should save and restore the static manager state", () => {
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.hitIntensity = 0.75;

    PsyAntennaManager.save(processor.asNetPacket());
    disposeManager(PsyAntennaManager);

    PsyAntennaManager.load(processor.asNetReader());

    expect(isManagerInitialized(PsyAntennaManager)).toBe(true);
    expect(getManager(PsyAntennaManager).hitIntensity).toBe(0.75);
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it("should update sound and post-process intensities", () => {
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);

    jest.spyOn(manager, "generatePhantoms").mockImplementation(jest.fn());
    jest.spyOn(manager, "updateSound").mockImplementation(jest.fn());
    jest.spyOn(manager, "updatePsyHit").mockImplementation(jest.fn());

    manager.intensityInertion = 0.05;
    manager.soundIntensity = 0;
    manager.soundIntensityBase = 1;
    manager.postprocessCount = 1;
    manager.postprocess.set("psy.ppe", { intensity: 0, intensityBase: 1, idx: 1501 });

    manager.update(100);

    expect(manager.soundIntensity).toBe(0.05);
    expect(manager.updateSound).toHaveBeenCalledTimes(1);
    expect(manager.postprocess.get("psy.ppe")!.intensity).toBe(0.05);
    expect(level.set_pp_effector_factor).toHaveBeenCalledWith(1501, 0.05, 0.3);
    expect(manager.updatePsyHit).toHaveBeenCalledWith(100);
  });

  it("should create phantoms after the idle delay when below the configured limit", () => {
    mockRegisteredActor();

    const manager: PsyAntennaManager = getManager(PsyAntennaManager);
    const phantomManager: PhantomManager = getManager(PhantomManager);

    (time_global as unknown as jest.Mock).mockReturnValue(1);
    jest.spyOn(math, "random").mockReturnValue(0);
    jest.spyOn(phantomManager, "spawnPhantom");

    manager.phantomTime = 0;
    manager.phantomIdle = 0;
    manager.phantomSpawnProbability = 1;
    manager.phantomMax = 1;

    manager.generatePhantoms();

    expect(manager.phantomTime).toBe(1);
    expect(phantomManager.spawnPhantom).toHaveBeenCalledTimes(1);
  });

  it("should apply configured psy hits to the actor", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);

    (time_global as unknown as jest.Mock).mockReturnValue(1);
    manager.hitAmplitude = 0.5;
    manager.hitIntensity = 1;
    manager.hitFreq = 0;

    manager.updatePsyHit(0);

    expect(actorGameObject.hit).toHaveBeenCalledWith(
      expect.objectContaining({ draftsman: actorGameObject, power: 0.5, type: hit.telepatic })
    );
  });

  it("should update active post-process effects and remove expired effects", () => {
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);

    manager.postprocessCount = 1;

    expect(manager.updatePostprocess({ intensity: 0.5, intensityBase: 1, idx: 1501 })).toBe(true);
    expect(level.set_pp_effector_factor).toHaveBeenCalledWith(1501, 0.5, 0.3);

    expect(manager.updatePostprocess({ intensity: 0, intensityBase: 1, idx: 1501 })).toBe(false);
    expect(manager.postprocessCount).toBe(0);
    expect(level.remove_pp_effector).toHaveBeenCalledWith(1501);
  });

  it("should continue post-process ID allocation after the highest loaded effector", () => {
    const manager: PsyAntennaManager = getManager(PsyAntennaManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.postprocessCount = 2;
    manager.postprocess.set("first.ppe", { intensity: 0.4, intensityBase: 0.6, idx: 1501 });
    manager.postprocess.set("second.ppe", { intensity: 0.2, intensityBase: 0.3, idx: 1505 });

    manager.save(processor.asNetPacket());

    disposeManager(PsyAntennaManager);

    const loadedManager: PsyAntennaManager = getManager(PsyAntennaManager);

    loadedManager.load(processor.asNetReader());

    expect(loadedManager.postprocessCount).toBe(2);
    expect(loadedManager.postprocessNextId).toBe(1505);
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

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
