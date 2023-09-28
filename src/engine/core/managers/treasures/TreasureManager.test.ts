import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerActor, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { TreasureManager } from "@/engine/core/managers/treasures/TreasureManager";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { TREASURE_MANAGER_CONFIG_LTX, treasuresConfig } from "@/engine/core/managers/treasures/TreasuresConfig";
import { readIniTreasuresList } from "@/engine/core/managers/treasures/utils/treasures_init";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { ClientObject, ServerObject } from "@/engine/lib/types";
import { mockActorClientGameObject, mockIniFile, mockServerAlifeObject } from "@/fixtures/xray";

describe("TreasureManager class", () => {
  beforeEach(() => {
    registry.actor = null as unknown as ClientObject;
    registry.managers = new LuaTable();
    treasuresConfig.TREASURES = readIniTreasuresList(TREASURE_MANAGER_CONFIG_LTX);
  });

  it("should correctly initialize and destroy", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();
    const eventsManager: EventsManager = EventsManager.getInstance();

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

  it("should correctly initialize list of secrets", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    treasureManager.initialize();

    expect(treasuresConfig.TREASURES).toEqualLuaTables({
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

  it("should correctly handle statics shortcuts", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    jest.spyOn(treasureManager, "giveActorTreasureCoordinates").mockImplementation(() => {});
    jest.spyOn(treasureManager, "onRegisterItem").mockImplementation(() => true);

    TreasureManager.giveTreasureCoordinates("test");
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalled();

    expect(TreasureManager.registerItem(mockServerAlifeObject())).toBe(true);
    expect(treasureManager.giveActorTreasureCoordinates).toHaveBeenCalled();
  });

  it("should correctly handle spawn all in updates", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

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
    registerActor(mockActorClientGameObject());
    giveInfoPortion("info_b10_first_zone_visited");

    const treasureManager: TreasureManager = TreasureManager.getInstance();

    treasureManager.treasuresRestrictorByName.set("jup_b1_secret", 1501);
    treasureManager.initialize();

    const descriptor: ITreasureDescriptor = treasuresConfig.TREASURES.get("jup_b1_secret");

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
    registerActor(mockActorClientGameObject());

    const treasureManager: TreasureManager = TreasureManager.getInstance();

    treasureManager.initialize();

    const descriptor: ITreasureDescriptor = treasuresConfig.TREASURES.get("jup_b2_secret");

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
    const treasureManager: TreasureManager = TreasureManager.getInstance();

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
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    treasureManager.initialize();

    expect(treasureManager.getTreasuresCount()).toBe(3);
    expect(treasuresConfig.TREASURES.length()).toBe(3);
  });

  it("should correctly get treasures", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    treasureManager.initialize();

    expect(treasuresConfig.TREASURES.get("jup_b1_secret")).not.toBeNull();
    expect(treasuresConfig.TREASURES.get("jup_b1_secret")).toBe(treasuresConfig.TREASURES.get("jup_b1_secret"));
  });

  it("should correctly get given treasures count", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

    treasureManager.initialize();
    expect(treasureManager.getGivenTreasuresCount()).toBe(0);

    treasuresConfig.TREASURES.get("jup_b1_secret").given = true;
    expect(treasureManager.getGivenTreasuresCount()).toBe(1);

    treasuresConfig.TREASURES.get("jup_b2_secret").given = true;
    expect(treasureManager.getGivenTreasuresCount()).toBe(2);
  });

  it("should correctly spawn treasures", () => {
    const treasureManager: TreasureManager = TreasureManager.getInstance();

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
