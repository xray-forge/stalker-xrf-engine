import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { disposeManager, getManager, registerActor } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { removeTreasureMapSpot } from "@/engine/core/managers/map/utils";
import { ETreasureState, NotificationManager } from "@/engine/core/managers/notifications";
import { TREASURE_MANAGER_CONFIG_LTX, treasureConfig } from "@/engine/core/managers/treasures/TreasureConfig";
import { TreasureManager } from "@/engine/core/managers/treasures/TreasureManager";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { readIniTreasuresList } from "@/engine/core/managers/treasures/utils/treasures_init";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { AnyObject, GameObject, ServerObject, TName, TNumberId } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockAlifeObject, MockGameObject, MockIniFile, MockNetProcessor } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/map/utils");

describe("TreasureManager", () => {
  beforeEach(() => {
    resetRegistry();

    treasureConfig.ENHANCED_MODE_ENABLED = true;
    treasureConfig.TREASURES = readIniTreasuresList(TREASURE_MANAGER_CONFIG_LTX);
  });

  it("should have proper configuration", () => {
    expect(treasureConfig.TREASURES).toEqualLuaTables({
      jup_b1_secret: {
        checked: false,
        type: ETreasureType.RARE,
        empty: parseConditionsList("{+info_b10_first_zone_visited} true, false"),
        given: false,
        refreshing: null,
        items: {
          wpn_abakan: {
            "1": {
              count: 1,
              itemsIds: null,
              probability: 1,
            },
          },
          wpn_addon_scope: {
            "1": {
              count: 1,
              itemsIds: null,
              probability: 1,
            },
          },
        },
        itemsToFindRemain: 0,
      },
      jup_b2_secret: {
        checked: false,
        type: ETreasureType.EPIC,
        empty: null,
        given: false,
        items: {
          wpn_abakan: {
            "1": {
              count: 2,
              itemsIds: null,
              probability: 1,
            },
          },
        },
        itemsToFindRemain: 0,
        refreshing: parseConditionsList("true"),
      },
      jup_b3_secret: {
        checked: false,
        empty: null,
        given: false,
        type: ETreasureType.RARE,
        items: {
          wpn_abakan: {
            "1": {
              count: 1,
              itemsIds: null,
              probability: 1,
            },
          },
          wpn_addon_scope: {
            "1": {
              count: 1,
              itemsIds: null,
              probability: 1,
            },
          },
        },
        itemsToFindRemain: 0,
        refreshing: null,
      },
    });
  });

  it("should correctly initialize and destroy", () => {
    const manager: TreasureManager = getManager(TreasureManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    manager.initialize();

    expect(eventsManager.getSubscribersCount()).toBe(4);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_ITEM_TAKE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.RESTRICTOR_ZONE_REGISTERED)).toBe(1);

    manager.destroy();

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle statics shortcuts", () => {
    const manager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(manager, "giveActorTreasureCoordinates").mockImplementation(() => {});
    jest.spyOn(manager, "onRegisterItem").mockImplementation(() => true);

    TreasureManager.giveTreasureCoordinates("test");
    expect(manager.giveActorTreasureCoordinates).toHaveBeenCalled();

    expect(TreasureManager.registerItem(MockAlifeObject.mock())).toBe(true);
    expect(manager.giveActorTreasureCoordinates).toHaveBeenCalled();
  });

  it("should correctly handle spawn all in updates", () => {
    const manager: TreasureManager = getManager(TreasureManager);

    manager.initialize();

    jest.spyOn(Date, "now").mockImplementation(() => 1000);
    manager.areItemsSpawned = true;
    manager["spawnTreasures"] = jest.fn();

    manager.update();

    expect(manager["spawnTreasures"]).not.toHaveBeenCalled();
    expect(manager.lastUpdatedAt).toBe(1000);

    manager.lastUpdatedAt = -1000;
    manager.areItemsSpawned = false;

    manager.update();

    expect(manager["spawnTreasures"]).toHaveBeenCalled();
    expect(manager.lastUpdatedAt).toBe(1000);
  });

  it("should correctly handle empty state in updates", () => {
    registerActor(MockGameObject.mockActor());
    giveInfoPortion("info_b10_first_zone_visited");

    const manager: TreasureManager = getManager(TreasureManager);

    manager.treasuresRestrictorByName.set("jup_b1_secret", 1501);
    manager.initialize();

    const descriptor: ITreasureDescriptor = treasureConfig.TREASURES.get("jup_b1_secret");

    manager.update();

    expect(level.map_remove_object_spot).not.toHaveBeenCalled();

    expect(descriptor.empty).not.toBeNull();
    expect(descriptor.checked).toBe(false);

    manager.lastUpdatedAt = -1000;
    descriptor.given = true;
    manager.update();

    expect(removeTreasureMapSpot).toHaveBeenCalledWith(1501, descriptor);
    expect(descriptor.empty).toBeNull();
    expect(descriptor.checked).toBe(true);
  });

  it("should correctly handle refresh state in updates", () => {
    registerActor(MockGameObject.mockActor());

    const manager: TreasureManager = getManager(TreasureManager);

    manager.initialize();

    const descriptor: ITreasureDescriptor = treasureConfig.TREASURES.get("jup_b2_secret");

    descriptor.given = true;
    descriptor.checked = true;

    manager.update();

    expect(descriptor.checked).toBe(false);
    expect(descriptor.given).toBe(false);
  });

  it("should correctly register restrictors", () => {
    const notSecret: ServerObject = MockAlifeObject.mock();
    const secret: ServerObject = MockAlifeObject.mock({
      spawnIni: MockIniFile.mock("spawn.ini", { secret: {} }),
    });
    const manager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(manager, "onRegisterRestrictor");

    manager.initialize();

    EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_REGISTERED, notSecret);

    expect(manager.onRegisterRestrictor).toHaveBeenCalledWith(notSecret);
    expect(manager.treasuresRestrictorByName.length()).toBe(0);

    EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_REGISTERED, secret);

    expect(manager.onRegisterRestrictor).toHaveBeenNthCalledWith(2, secret);
    expect(manager.treasuresRestrictorByName.length()).toBe(1);
  });

  it("should correctly get treasures", () => {
    const manager: TreasureManager = getManager(TreasureManager);

    manager.initialize();

    expect(treasureConfig.TREASURES.get("jup_b1_secret")).not.toBeNull();
    expect(treasureConfig.TREASURES.get("jup_b1_secret")).toBe(treasureConfig.TREASURES.get("jup_b1_secret"));
  });

  it("should correctly spawn treasures", () => {
    const manager: TreasureManager = getManager(TreasureManager);

    manager.initialize();

    manager["spawnTreasure"] = jest.fn();

    manager["spawnTreasures"]();
    expect(manager["spawnTreasure"]).toHaveBeenCalledTimes(3);

    manager["spawnTreasures"]();
    expect(manager["spawnTreasure"]).toHaveBeenCalledTimes(3);

    expect(manager["spawnTreasure"]).toHaveBeenNthCalledWith(1, "jup_b1_secret");
    expect(manager["spawnTreasure"]).toHaveBeenNthCalledWith(2, "jup_b2_secret");
    expect(manager["spawnTreasure"]).toHaveBeenNthCalledWith(3, "jup_b3_secret");
  });

  it.todo("should correctly register items");

  it.todo("should correctly spawn treasure");

  it.todo("should correctly give actor coordinates");

  it.todo("should correctly give actor random coordinates");

  it("should correctly handle actor taking item", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const notificationManager: NotificationManager = getManager(NotificationManager);
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    expect(() => treasureManager.onActorItemTake(first)).not.toThrow();

    jest.spyOn(notificationManager, "sendTreasureNotification").mockImplementation(jest.fn());
    jest.spyOn(eventsManager, "emitEvent").mockImplementation(jest.fn());

    treasureManager.treasuresRestrictorByItem.set(second.id(), 55);
    treasureManager.treasuresRestrictorByName.set("jup_b1_secret", 55);

    treasureManager.onActorItemTake(second);

    const treasure: ITreasureDescriptor = treasureConfig.TREASURES.get("jup_b1_secret");

    expect(treasure.itemsToFindRemain).toBe(-1);
    expect(treasure.checked).toBe(true);

    expect(removeTreasureMapSpot).toHaveBeenCalledWith(55, treasure);
    expect(notificationManager.sendTreasureNotification).toHaveBeenCalledWith(ETreasureState.FOUND_TREASURE);
    expect(eventsManager.emitEvent).toHaveBeenCalledWith(EGameEvent.TREASURE_FOUND, treasure);
  });

  it("should correctly handle save and load", () => {
    const manager: TreasureManager = getManager(TreasureManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    manager.areItemsSpawned = true;
    manager.treasuresRestrictorByItem = $fromObject<TNumberId, TNumberId>({ 10: 200, 11: 300 });
    manager.treasuresRestrictorByName = $fromObject<TName, TNumberId>({
      jup_b1_secret: 55,
      jup_b2_secret: 66,
    });

    treasureConfig.TREASURES.get("jup_b1_secret").itemsToFindRemain = 4;
    treasureConfig.TREASURES.get("jup_b1_secret").given = true;
    treasureConfig.TREASURES.get("jup_b2_secret").given = true;
    treasureConfig.TREASURES.get("jup_b3_secret").checked = true;

    manager.save(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U16,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
      EPacketDataType.U16,
    ]);
    expect(processor.dataList).toEqual([
      true,
      2,
      10,
      200,
      11,
      300,
      3,
      // First treasure.
      55,
      true,
      false,
      4,
      // Second treasure.
      66,
      true,
      false,
      0,
      // Third treasure.
      -1,
      false,
      true,
      0,
      19,
    ]);

    disposeManager(TreasureManager);

    treasureConfig.TREASURES = readIniTreasuresList(TREASURE_MANAGER_CONFIG_LTX);

    const newManager: TreasureManager = getManager(TreasureManager);

    newManager.treasuresRestrictorByName = $fromObject<TName, TNumberId>({
      jup_b1_secret: 55,
      jup_b2_secret: 66,
    });

    newManager.load(processor.asNetReader());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);

    expect(newManager.areItemsSpawned).toBe(true);
    expect(newManager.treasuresRestrictorByItem).toEqualLuaTables({
      10: 200,
      11: 300,
    });

    expect(treasureConfig.TREASURES.length()).toBe(3);
    expect(treasureConfig.TREASURES.get("jup_b1_secret")).toEqualLuaTables({
      given: true,
      checked: false,
      refreshing: null,
      type: ETreasureType.RARE,
      empty: expect.any(Object),
      items: expect.any(Object),
      itemsToFindRemain: 4,
    });
    expect(treasureConfig.TREASURES.get("jup_b2_secret")).toEqualLuaTables({
      given: true,
      checked: false,
      refreshing: expect.any(Object),
      type: ETreasureType.EPIC,
      empty: expect.any(Object),
      items: expect.any(Object),
      itemsToFindRemain: 0,
    });
    expect(treasureConfig.TREASURES.get("jup_b3_secret")).toEqualLuaTables({
      given: false,
      checked: false,
      refreshing: expect.any(Object),
      type: ETreasureType.RARE,
      empty: expect.any(Object),
      items: expect.any(Object),
      itemsToFindRemain: 0,
    });
  });

  it("should correctly handle debug dump event", () => {
    const manager: TreasureManager = getManager(TreasureManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ TreasureManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ TreasureManager: expect.any(Object) });
  });
});
