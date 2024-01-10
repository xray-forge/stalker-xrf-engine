import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { SignalLightBinder } from "@/engine/core/binders/physic/SignalLightBinder";
import { registry } from "@/engine/core/database";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockGameObject, mockNetPacket, MockNetProcessor, mockNetReader } from "@/fixtures/xray";

describe("SignalLightBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    expect(binder.isLoaded).toBe(false);
    expect(binder.isTurnOffNeeded).toBe(true);
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.deltaTime).toBeNull();
    expect(binder.startTime).toBeNull();
  });

  it("should correctly lifecycle", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    binder.reinit();

    expect(registry.signalLights.get(binder.object.name())).toBe(binder);
    expect(registry.objects.has(binder.object.id())).toBe(true);

    binder.net_destroy();

    expect(registry.signalLights.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should be save relevant", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });

  it.todo("should correctly handle update event");

  it.todo("should correctly handle going online/offline");

  it.todo("should correctly handle launch");

  it.todo("should correctly handle stop/start of animation and fly");

  it("should correctly handle save/load with defaults", () => {
    const { actorGameObject, actorServerObject } = mockRegisteredActor();
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    jest.spyOn(Date, "now").mockImplementation(() => 45_000);

    binder.net_spawn(actorServerObject);
    binder.reinit();
    binder.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["save_from_SignalLightBinder", MAX_U32, false, 3]);

    const newBinder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    newBinder.load(mockNetReader(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(newBinder.startTime).toBeNull();
    expect(newBinder.isSlowFlyStarted).toBe(false);
    expect(newBinder.deltaTime).toBe(45_000);
    expect(newBinder.isLoaded).toBe(true);
  });

  it("should correctly handle save/load with custom values", () => {
    const { actorGameObject, actorServerObject } = mockRegisteredActor();
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    jest.spyOn(Date, "now").mockImplementation(() => 100_000);

    binder.startTime = 70_000;
    binder.isSlowFlyStarted = true;

    binder.net_spawn(actorServerObject);
    binder.reinit();
    binder.save(mockNetPacket(netProcessor));

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["save_from_SignalLightBinder", 30_000, true, 3]);

    const newBinder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    newBinder.load(mockNetReader(netProcessor));

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(newBinder.startTime).toBe(70_000);
    expect(newBinder.isSlowFlyStarted).toBe(true);
    expect(newBinder.deltaTime).toBe(100_000);
    expect(newBinder.isLoaded).toBe(true);
  });
});
