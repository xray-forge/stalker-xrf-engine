import { beforeEach, describe, expect, it } from "@jest/globals";
import { callback, clsid } from "xray16";

import { ArenaZoneBinder } from "@/engine/core/binders/zones/ArenaZoneBinder";
import { registerSimulator, registry } from "@/engine/core/database";
import { GameObject, ServerHumanObject, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import {
  EPacketDataType,
  MockAlifeHumanStalker,
  MockAlifeObject,
  MockGameObject,
  MockNetProcessor,
  MockObjectBinder,
} from "@/fixtures/xray";

describe("CampZoneBinder class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArenaZoneBinder = new ArenaZoneBinder(object);

    expect(binder.savedObjects).toEqualLuaTables({});
  });

  it("should correctly handle going online and offline", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: ArenaZoneBinder = new ArenaZoneBinder(object);

    binder.net_spawn(serverObject);

    expect(object.set_callback).toHaveBeenCalledTimes(2);
    expect(object.set_callback).toHaveBeenCalledWith(callback.zone_enter, binder.onEnterArenaZone, binder);
    expect(object.set_callback).toHaveBeenCalledWith(callback.zone_exit, binder.onExitArenaZone, binder);

    expect(registry.zones.length()).toBe(1);
    expect(registry.zones.get(object.name())).toBe(object);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(object.id()).object).toBe(object);

    binder.net_destroy();

    expect(object.set_callback).toHaveBeenCalledTimes(4);
    expect(object.set_callback).toHaveBeenCalledWith(callback.zone_enter, null);
    expect(object.set_callback).toHaveBeenCalledWith(callback.zone_exit, null);

    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online and offline when spawn flag is falsy", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: ArenaZoneBinder = new ArenaZoneBinder(object);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    binder.net_spawn(serverObject);

    expect(object.set_callback).toHaveBeenCalledTimes(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle save/load", () => {
    const object: GameObject = MockGameObject.mock();
    const netProcessor: MockNetProcessor = new MockNetProcessor();
    const binder: ArenaZoneBinder = new ArenaZoneBinder(object);

    binder.savedObjects.set(10, true);
    binder.savedObjects.set(11, true);

    binder.save(netProcessor.asNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual(["save_from_ArenaZoneBinder", 2, 10, 11, 4]);

    const newBinder: ArenaZoneBinder = new ArenaZoneBinder(object);

    newBinder.load(netProcessor.asNetReader());

    expect(newBinder.savedObjects).toEqualLuaTables({ 10: true, 11: true });

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it("should correctly purge items", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArenaZoneBinder = new ArenaZoneBinder(object);

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    binder.savedObjects.set(first.id, true);
    binder.savedObjects.set(second.id, true);

    binder.purgeItems();

    expect(registry.simulator.release).toHaveBeenCalledTimes(2);
    expect(registry.simulator.release).toHaveBeenCalledWith(first, true);
    expect(registry.simulator.release).toHaveBeenCalledWith(second, true);
    expect(binder.savedObjects).toEqualLuaTables({});
  });

  it("should correctly enter and leave zone event", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: ArenaZoneBinder = new ArenaZoneBinder(object);

    const actor: GameObject = MockGameObject.mockActor();
    const stalker: GameObject = MockGameObject.mock({ clsid: clsid.script_stalker });
    const monster: GameObject = MockGameObject.mock({ clsid: clsid.snork_s });
    const lamp: GameObject = MockGameObject.mock({ clsid: clsid.hanging_lamp });
    const physicDestroyable: GameObject = MockGameObject.mock({ clsid: clsid.obj_phys_destroyable });
    const physic: GameObject = MockGameObject.mock({ clsid: clsid.obj_physic });

    binder.onEnterArenaZone(object, actor);
    binder.onEnterArenaZone(object, stalker);
    binder.onEnterArenaZone(object, monster);
    binder.onEnterArenaZone(object, lamp);
    binder.onEnterArenaZone(object, physicDestroyable);
    binder.onEnterArenaZone(object, physic);

    expect(binder.savedObjects.length()).toBe(2);
    expect(binder.savedObjects).toEqualLuaTables({ [stalker.id()]: true, [monster.id()]: true });

    binder.onExitArenaZone(object, actor);
    binder.onExitArenaZone(object, stalker);
    binder.onExitArenaZone(object, monster);

    expect(binder.savedObjects.length()).toBe(0);
  });
});
