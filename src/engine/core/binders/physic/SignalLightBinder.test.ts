import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { SignalLightBinder } from "@/engine/core/binders/physic/SignalLightBinder";
import { registry } from "@/engine/core/database";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { Y_VECTOR } from "@/engine/lib/constants/vectors";
import { HangingLamp, ServerObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockAlifeObject,
  MockGameObject,
  MockHangingLamp,
  MockNetProcessor,
  MockObjectBinder,
} from "@/fixtures/xray";

describe("SignalLightBinder", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    expect(binder.isLoaded).toBe(false);
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.loadedAt).toBeNull();
    expect(binder.startTime).toBeNull();
  });

  it("should verify whether can be spawned", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock({ id: serverObject.id }));

    (binder as unknown as MockObjectBinder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);
    expect(registry.signalLights.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle lifecycle", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock({ id: serverObject.id }));

    binder.net_spawn(serverObject);

    expect(registry.signalLights.get(binder.object.name())).toBe(binder);
    expect(registry.objects.has(binder.object.id())).toBe(true);

    binder.net_destroy();

    expect(registry.signalLights.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle reinit", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock({ id: serverObject.id }));

    binder.reinit();

    expect(registry.signalLights.get(binder.object.name())).toBe(binder);
    expect(registry.objects.has(binder.object.id())).toBe(true);
  });

  it("should be save relevant", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    expect(binder.net_save_relevant()).toBe(true);
  });

  it("should correctly handle generic update event with three phases", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(binder.object, "get_hanging_lamp").mockImplementation(() => lamp);

    binder.startTime = 10_000;

    jest.spyOn(Date, "now").mockImplementation(() => 11_000);

    binder.update(500);

    expect(binder.startTime).toBe(10_000);
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.object.stop_particles).not.toHaveBeenCalled();
    expect(binder.object.set_const_force).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 12_000);

    binder.update(500);

    expect(binder.startTime).toBe(10_000);
    expect(binder.isSlowFlyStarted).toBe(true);
    expect(binder.isHangingAnimationTurnedOn).toBe(true);
    expect(binder.object.stop_particles).not.toHaveBeenCalled();
    expect(binder.object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 30, 20_000);
    expect(binder.object.start_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);

    jest.spyOn(Date, "now").mockImplementation(() => 15_000);

    binder.update(500);

    expect(binder.startTime).toBe(10_000);
    expect(binder.isSlowFlyStarted).toBe(true);
    expect(binder.isHangingAnimationTurnedOn).toBe(true);
    expect(binder.object.stop_particles).not.toHaveBeenCalled();
    expect(binder.object.set_const_force).toHaveBeenCalledTimes(1);
    expect(binder.object.start_particles).toHaveBeenCalledTimes(1);
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);

    jest.spyOn(Date, "now").mockImplementation(() => 30_600);

    binder.update(500);

    expect(binder.startTime).toBe(10_000);
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.object.set_const_force).toHaveBeenCalledTimes(1);
    expect(binder.object.start_particles).toHaveBeenCalledTimes(1);
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
    expect(binder.object.stop_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);

    jest.spyOn(Date, "now").mockImplementation(() => 35_000);

    binder.update(500);

    expect(binder.startTime).toBe(10_000);
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.object.set_const_force).toHaveBeenCalledTimes(1);
    expect(binder.object.start_particles).toHaveBeenCalledTimes(1);
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
    expect(binder.object.stop_particles).toHaveBeenCalledTimes(1);
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);

    jest.spyOn(Date, "now").mockImplementation(() => 38_600);

    binder.update(500);

    expect(binder.startTime).toBeNull();
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.object.set_const_force).toHaveBeenCalledTimes(1);
    expect(binder.object.start_particles).toHaveBeenCalledTimes(1);
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
    expect(binder.object.stop_particles).toHaveBeenCalledTimes(1);
    expect(binder.object.get_hanging_lamp().turn_on).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle generic update after game load with short update", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(binder.object, "get_hanging_lamp").mockImplementation(() => lamp);
    jest.spyOn(Date, "now").mockImplementation(() => 11_000);

    binder.isLoaded = true;
    binder.loadedAt = 10_250;
    binder.startTime = 10_000;

    binder.update(100);

    expect(binder.startTime).toBe(10_750);
    expect(binder.isLoaded).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 230, 1250);
    expect(binder.object.start_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
  });

  it("should correctly handle generic update after game load with long update", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(binder.object, "get_hanging_lamp").mockImplementation(() => lamp);
    jest.spyOn(Date, "now").mockImplementation(() => 29_500);

    binder.isLoaded = true;
    binder.loadedAt = 29_100;
    binder.startTime = 10_000;

    binder.update(100);

    expect(binder.startTime).toBe(10_400);
    expect(binder.isLoaded).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 33, 900);
    expect(binder.object.start_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
  });

  it("should correctly handle generic update when not started", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(binder.object, "get_hanging_lamp").mockImplementation(() => lamp);

    binder.isLoaded = true;

    binder.update(100);

    expect(binder.isLoaded).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(0);

    binder.startTime = null;
    binder.isLoaded = true;
    binder.isHangingAnimationTurnedOn = true;

    binder.update(100);

    expect(binder.isLoaded).toBe(false);
    expect(binder.isHangingAnimationTurnedOn).toBe(false);
    expect(binder.object.get_hanging_lamp().turn_off).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle stop fly", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());
    const lamp: HangingLamp = MockHangingLamp.mock();

    jest.spyOn(binder.object, "get_hanging_lamp").mockImplementation(() => lamp);

    binder.stopFly();

    expect(binder.startTime).toBeNull();
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.object.stop_particles).not.toHaveBeenCalled();
    expect(binder.object.get_hanging_lamp().turn_off).not.toHaveBeenCalled();

    binder.startTime = 1000;

    binder.stopFly();

    expect(binder.startTime).toBeNull();
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.object.stop_particles).not.toHaveBeenCalled();
    expect(binder.object.get_hanging_lamp().turn_off).not.toHaveBeenCalled();

    binder.startTime = 1000;
    binder.isSlowFlyStarted = true;

    binder.stopFly();

    expect(binder.startTime).toBeNull();
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.object.stop_particles).toHaveBeenCalledWith("weapons\\light_signal", "link");
    expect(binder.object.get_hanging_lamp().turn_off).toHaveBeenCalled();
  });

  it("should correctly handle start fly", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    jest.spyOn(Date, "now").mockImplementation(() => 30_000);

    binder.isSlowFlyStarted = true;

    expect(binder.startFly()).toBe(false);
    expect(binder.isFlying()).toBe(false);

    mockRegisteredActor();

    expect(binder.startFly()).toBe(true);
    expect(binder.isFlying()).toBe(true);

    expect(binder.startTime).toBe(30_000);
    expect(binder.isSlowFlyStarted).toBe(false);
    expect(binder.object.set_const_force).toHaveBeenCalledWith(Y_VECTOR, 180, 1500);

    jest.spyOn(Date, "now").mockImplementation(() => 60_000);

    expect(binder.startFly()).toBe(false);
    expect(binder.startTime).toBe(30_000);
  });

  it("should correctly check if light is flying", () => {
    const binder: SignalLightBinder = new SignalLightBinder(MockGameObject.mock());

    expect(binder.isFlying()).toBe(false);

    binder.startTime = 1000;
    expect(binder.isFlying()).toBe(true);

    binder.startTime = null;
    expect(binder.isFlying()).toBe(false);
  });

  it("should correctly handle save/load with defaults", () => {
    const { actorGameObject, actorServerObject } = mockRegisteredActor();
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    jest.spyOn(Date, "now").mockImplementation(() => 45_000);

    binder.net_spawn(actorServerObject);
    binder.reinit();
    binder.save(netProcessor.asNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["save_from_SignalLightBinder", MAX_U32, false, 3]);

    const newBinder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    newBinder.load(netProcessor.asNetReader());

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(newBinder.startTime).toBeNull();
    expect(newBinder.isSlowFlyStarted).toBe(false);
    expect(newBinder.loadedAt).toBe(45_000);
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
    binder.save(netProcessor.asNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U32,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["save_from_SignalLightBinder", 30_000, true, 3]);

    const newBinder: SignalLightBinder = new SignalLightBinder(actorGameObject);

    newBinder.load(netProcessor.asNetReader());

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);

    expect(newBinder.startTime).toBe(70_000);
    expect(newBinder.isSlowFlyStarted).toBe(true);
    expect(newBinder.loadedAt).toBe(100_000);
    expect(newBinder.isLoaded).toBe(true);
  });
});
