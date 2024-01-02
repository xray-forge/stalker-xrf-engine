import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { getManager, registerActor } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { TREASURE_MANAGER_CONFIG_LTX, treasureConfig } from "@/engine/core/managers/treasures/TreasureConfig";
import { TreasureManager } from "@/engine/core/managers/treasures/TreasureManager";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { readIniTreasuresList } from "@/engine/core/managers/treasures/utils/treasures_init";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject, mockIniFile, mockServerAlifeObject } from "@/fixtures/xray";

describe("TreasureManager class", () => {
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
    const treasureManager: TreasureManager = getManager(TreasureManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    treasureManager.initialize();

    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_ITEM_TAKE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.RESTRICTOR_ZONE_REGISTERED)).toBe(1);
    expect(eventsManager.getSubscribersCount()).toBe(3);

    treasureManager.destroy();

    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(0);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_ITEM_TAKE)).toBe(0);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.RESTRICTOR_ZONE_REGISTERED)).toBe(0);
    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle statics shortcuts", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(() => {});
    jest.spyOn(treasureManager, "onRegisterItem").mockImplementation(() => true);

    TreasureManager.giveTreasureCoordinates("test");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalled();

    expect(TreasureManager.registerItem(mockServerAlifeObject())).toBe(true);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalled();
  });

  it("should correctly handle spawn all in updates", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.initialize();

    jest.spyOn(Date, "now").mockImplementation(() => 1000);
    treasureManager.areItemsSpawned = true;
    treasureManager["spawnTreasures"] = jest.fn();

    treasureManager.update();

    expect(treasureManager["spawnTreasures"]).not.toHaveBeenCalled();
    expect(treasureManager.lastUpdatedAt).toBe(1000);

    treasureManager.lastUpdatedAt = -1000;
    treasureManager.areItemsSpawned = false;

    treasureManager.update();

    expect(treasureManager["spawnTreasures"]).toHaveBeenCalled();
    expect(treasureManager.lastUpdatedAt).toBe(1000);
  });

  it("should correctly handle empty state in updates", () => {
    registerActor(MockGameObject.mockActor());
    giveInfoPortion("info_b10_first_zone_visited");

    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.treasuresRestrictorByName.set("jup_b1_secret", 1501);
    treasureManager.initialize();

    const descriptor: ITreasureDescriptor = treasureConfig.TREASURES.get("jup_b1_secret");

    treasureManager.update();

    expect(level.map_remove_object_spot).not.toHaveBeenCalled();

    expect(descriptor.empty).not.toBeNull();
    expect(descriptor.checked).toBe(false);

    treasureManager.lastUpdatedAt = -1000;
    descriptor.given = true;
    treasureManager.update();

    expect(level.map_remove_object_spot).toHaveBeenCalledWith(1501, "treasure_rare");
    expect(descriptor.empty).toBeNull();
    expect(descriptor.checked).toBe(true);
  });

  it("should correctly handle refresh state in updates", () => {
    registerActor(MockGameObject.mockActor());

    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.initialize();

    const descriptor: ITreasureDescriptor = treasureConfig.TREASURES.get("jup_b2_secret");

    descriptor.given = true;
    descriptor.checked = true;

    treasureManager.update();

    expect(descriptor.checked).toBe(false);
    expect(descriptor.given).toBe(false);
  });

  it("should correctly register restrictors", () => {
    const notSecret: ServerObject = mockServerAlifeObject();
    const secret: ServerObject = mockServerAlifeObject({
      spawn_ini: () => mockIniFile("spawn.ini", { secret: {} }),
    });
    const treasureManager: TreasureManager = getManager(TreasureManager);

    jest.spyOn(treasureManager, "onRegisterRestrictor");

    treasureManager.initialize();

    EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_REGISTERED, notSecret);

    expect(treasureManager.onRegisterRestrictor).toHaveBeenCalledWith(notSecret);
    expect(treasureManager.treasuresRestrictorByName.length()).toBe(0);

    EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_REGISTERED, secret);

    expect(treasureManager.onRegisterRestrictor).toHaveBeenNthCalledWith(2, secret);
    expect(treasureManager.treasuresRestrictorByName.length()).toBe(1);
  });

  it("should correctly get treasures count", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.initialize();

    expect(treasureManager.getTreasuresCount()).toBe(3);
    expect(treasureConfig.TREASURES.length()).toBe(3);
  });

  it("should correctly get treasures", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.initialize();

    expect(treasureConfig.TREASURES.get("jup_b1_secret")).not.toBeNull();
    expect(treasureConfig.TREASURES.get("jup_b1_secret")).toBe(treasureConfig.TREASURES.get("jup_b1_secret"));
  });

  it("should correctly get given treasures count", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.initialize();
    expect(treasureManager.getGivenTreasuresCount()).toBe(0);

    treasureConfig.TREASURES.get("jup_b1_secret").given = true;
    expect(treasureManager.getGivenTreasuresCount()).toBe(1);

    treasureConfig.TREASURES.get("jup_b2_secret").given = true;
    expect(treasureManager.getGivenTreasuresCount()).toBe(2);
  });

  it("should correctly spawn treasures", () => {
    const treasureManager: TreasureManager = getManager(TreasureManager);

    treasureManager.initialize();

    treasureManager["spawnTreasure"] = jest.fn();

    treasureManager["spawnTreasures"]();
    expect(treasureManager["spawnTreasure"]).toHaveBeenCalledTimes(3);

    treasureManager["spawnTreasures"]();
    expect(treasureManager["spawnTreasure"]).toHaveBeenCalledTimes(3);

    expect(treasureManager["spawnTreasure"]).toHaveBeenNthCalledWith(1, "jup_b1_secret");
    expect(treasureManager["spawnTreasure"]).toHaveBeenNthCalledWith(2, "jup_b2_secret");
    expect(treasureManager["spawnTreasure"]).toHaveBeenNthCalledWith(3, "jup_b3_secret");
  });

  it.todo("should correctly register items");

  it.todo("should correctly spawn treasure");

  it.todo("should correctly give actor coordinates");

  it.todo("should correctly give actor random coordinates");

  it.todo("should correctly handle actor taking item");

  it.todo("should correctly handle save and load");
});
