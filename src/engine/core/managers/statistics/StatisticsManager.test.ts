import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { disposeManager, getManager, registerActor, registerSimulator } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { AnyObject, GameObject, TName } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockLuaTable } from "@/fixtures/lua";
import {
  EPacketDataType,
  MockAlifeMonsterBase,
  MockAlifeObject,
  MockGameObject,
  MockNetProcessor,
  MockVector,
} from "@/fixtures/xray";

describe("StatisticsManager", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize and destroy", () => {
    const statisticsManager: StatisticsManager = getManager(StatisticsManager);
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(11);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.TASK_COMPLETED)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_ITEM_TAKE)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.SURGE_SKIPPED)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.SURGE_ENDED)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.TREASURE_FOUND)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.STALKER_HIT)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.STALKER_DEATH)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.MONSTER_HIT)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.MONSTER_DEATH)).toBe(1);

    expect(statisticsManager.takenArtefacts).toEqualLuaTables(new LuaTable());
    expect(statisticsManager.actorStatistics).toEqual({
      surgesCount: 0,
      completedTasksCount: 0,
      killedMonstersCount: 0,
      killedStalkersCount: 0,
      collectedTreasuresCount: 0,
      collectedArtefactsCount: 0,
      bestKilledMonster: null,
      bestKilledMonsterRank: 0,
      favoriteWeapon: null,
      collectedArtefacts: new LuaTable(),
    });

    disposeManager(StatisticsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly handle surges", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);

    expect(manager.actorStatistics.surgesCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.SURGE_ENDED);
    EventsManager.emitEvent(EGameEvent.SURGE_SKIPPED);

    expect(manager.actorStatistics.surgesCount).toBe(2);
  });

  it("should correctly handle treasures finding", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);

    expect(manager.actorStatistics.collectedTreasuresCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, {});
    EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, {});

    expect(manager.actorStatistics.collectedTreasuresCount).toBe(2);
  });

  it("should correctly handle stalkers killing", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);
    const actor: GameObject = MockGameObject.mockActor();

    expect(manager.actorStatistics.killedStalkersCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.STALKER_DEATH, MockGameObject.mock(), actor);
    EventsManager.emitEvent(EGameEvent.STALKER_DEATH, MockGameObject.mock(), actor);
    EventsManager.emitEvent(EGameEvent.STALKER_DEATH, MockGameObject.mock(), null);
    EventsManager.emitEvent(EGameEvent.STALKER_DEATH, MockGameObject.mock(), MockGameObject.mock());

    expect(manager.actorStatistics.killedStalkersCount).toBe(2);
  });

  it("should correctly handle tasks", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);

    expect(manager.actorStatistics.completedTasksCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, {});
    EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, {});

    expect(manager.actorStatistics.completedTasksCount).toBe(2);
  });

  it("should correctly handle anabiotics", () => {
    registerActor(MockGameObject.mockActor());

    const manager: StatisticsManager = getManager(StatisticsManager);

    expect(manager.getUsedAnabioticsCount()).toBe(0);

    EventsManager.emitEvent(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC);
    EventsManager.emitEvent(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC);

    expect(manager.getUsedAnabioticsCount()).toBe(2);
  });

  it("should correctly handle taking artefacts", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);
    const firstClient: GameObject = MockGameObject.mock({ clsid: clsid.art_black_drops });
    const secondClient: GameObject = MockGameObject.mock({ clsid: clsid.art_bast_artefact });
    const thirdClient: GameObject = MockGameObject.mock({ clsid: clsid.art_zuda });

    MockAlifeObject.mock({ id: firstClient.id(), section: "af_first" });
    MockAlifeObject.mock({ id: secondClient.id(), section: "af_first" });
    MockAlifeObject.mock({ id: thirdClient.id(), section: "af_second" });

    expect(manager.actorStatistics.collectedArtefactsCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, MockGameObject.mock());
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, firstClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, firstClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, firstClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, firstClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, secondClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, secondClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, secondClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, thirdClient);
    EventsManager.emitEvent(EGameEvent.ACTOR_ITEM_TAKE, thirdClient);

    expect(manager.actorStatistics.collectedArtefactsCount).toBe(3);
    expect(manager.actorStatistics.collectedArtefacts.length()).toBe(2);
    expect(manager.actorStatistics.collectedArtefacts.has("af_first")).toBe(true);
    expect(manager.actorStatistics.collectedArtefacts.has("af_second")).toBe(true);
  });

  it("should correctly handle dealing damage to an object", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);
    const ak74: GameObject = MockGameObject.mock();
    const desertEagle: GameObject = MockGameObject.mock();
    const desertEagleNimble: GameObject = MockGameObject.mock();
    const actor: GameObject = MockGameObject.mockActor();
    const target: GameObject = MockGameObject.mock();

    registerActor(actor);

    MockAlifeObject.mock({ id: ak74.id(), section: weapons.wpn_ak74 });
    MockAlifeObject.mock({ id: desertEagle.id(), section: weapons.wpn_desert_eagle });
    MockAlifeObject.mock({ id: desertEagleNimble.id(), section: weapons.wpn_desert_eagle_nimble });

    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 100, MockVector.mock(), actor);
    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 100, MockVector.mock(), MockGameObject.mock());

    expect(manager.weaponsStatistics.length()).toBe(36);
    (manager.weaponsStatistics as unknown as MockLuaTable).forEach((value, key) => {
      expect(value).toBe(0);
    });
    expect(manager.actorStatistics.favoriteWeapon).toBeNull();

    replaceFunctionMock(actor.active_item, () => ak74);

    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 100, MockVector.mock(), actor);
    EventsManager.emitEvent(EGameEvent.STALKER_HIT, target, 150, MockVector.mock(), actor);
    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 150, MockVector.mock(), MockGameObject.mock());

    expect(manager.weaponsStatistics.get("ak74")).toBe(250);
    expect(manager.weaponsStatistics.get("desert")).toBe(0);
    expect(manager.actorStatistics.favoriteWeapon).toBe("wpn_ak74");

    replaceFunctionMock(actor.active_item, () => desertEagle);

    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 100, MockVector.mock(), actor);
    expect(manager.actorStatistics.favoriteWeapon).toBe("wpn_ak74");
    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 300, MockVector.mock(), actor);
    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 300, MockVector.mock(), MockGameObject.mock());

    expect(manager.weaponsStatistics.get("ak74")).toBe(250);
    expect(manager.weaponsStatistics.get("desert")).toBe(400);
    expect(manager.actorStatistics.favoriteWeapon).toBe("wpn_desert_eagle");

    replaceFunctionMock(actor.active_item, () => desertEagleNimble);

    EventsManager.emitEvent(EGameEvent.STALKER_HIT, target, 100, MockVector.mock(), actor);

    expect(manager.weaponsStatistics.get("ak74")).toBe(250);
    expect(manager.weaponsStatistics.get("desert")).toBe(500);
    expect(manager.actorStatistics.favoriteWeapon).toBe("wpn_desert_eagle");
    expect(manager.weaponsStatistics.length()).toBe(36);
  });

  it("should correctly handle monster kills", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);
    const firstMonster: GameObject = MockGameObject.mock({ clsid: clsid.flesh_s, rank: 3 });
    const secondMonster: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s, rank: 15 });
    const thirdMonster: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s, rank: 16 });
    const actor: GameObject = MockGameObject.mockActor();

    registerActor(actor);
    MockAlifeMonsterBase.mock({ id: firstMonster.id(), rank: 3 });
    MockAlifeMonsterBase.mock({ id: secondMonster.id(), rank: 15 });
    MockAlifeMonsterBase.mock({ id: thirdMonster.id(), rank: 16 });

    expect(manager.actorStatistics.killedMonstersCount).toBe(0);
    expect(manager.actorStatistics.bestKilledMonster).toBeNull();
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(0);

    expect(() => EventsManager.emitEvent(EGameEvent.MONSTER_DEATH, MockGameObject.mock(), actor)).toThrow();
    expect(() => {
      EventsManager.emitEvent(EGameEvent.MONSTER_DEATH, MockGameObject.mock(), MockGameObject.mock());
    }).not.toThrow();

    expect(manager.actorStatistics.killedMonstersCount).toBe(0);
    expect(manager.actorStatistics.bestKilledMonster).toBeNull();
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(0);

    EventsManager.emitEvent(EGameEvent.MONSTER_DEATH, firstMonster, actor);

    expect(manager.actorStatistics.killedMonstersCount).toBe(1);
    expect(manager.actorStatistics.bestKilledMonster).toBe("flesh_strong");
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(3);

    EventsManager.emitEvent(EGameEvent.MONSTER_DEATH, secondMonster, actor);

    expect(manager.actorStatistics.killedMonstersCount).toBe(2);
    expect(manager.actorStatistics.bestKilledMonster).toBe("bloodsucker_normal");
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(15);

    EventsManager.emitEvent(EGameEvent.MONSTER_DEATH, thirdMonster, actor);

    expect(manager.actorStatistics.killedMonstersCount).toBe(3);
    expect(manager.actorStatistics.bestKilledMonster).toBe("bloodsucker_strong");
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(16);
  });

  it("should correctly save and load data", () => {
    const oldManager: StatisticsManager = getManager(StatisticsManager);
    const processor: MockNetProcessor = new MockNetProcessor();

    oldManager.actorStatistics = {
      collectedArtefacts: $fromObject<TName, boolean>({ af_1: true, af_2: true }),
      collectedArtefactsCount: 10,
      collectedTreasuresCount: 24,
      killedMonstersCount: 30,
      killedStalkersCount: 4,
      bestKilledMonsterRank: 16,
      surgesCount: 1,
      completedTasksCount: 40,
      favoriteWeapon: "wpn_ak74",
      bestKilledMonster: "bloodsucker_strong",
    };

    oldManager.save(processor.asNetPacket());

    expect(processor.dataList).toEqual([
      1,
      40,
      30,
      4,
      24,
      10,
      16,
      "bloodsucker_strong",
      "wpn_ak74",
      36,
      "abakan",
      0,
      "ak74",
      0,
      "ak74u",
      0,
      "beretta",
      0,
      "bm16",
      0,
      "colt1911",
      0,
      "desert",
      0,
      "f1",
      0,
      "fn2000",
      0,
      "fort",
      0,
      "g36",
      0,
      "gauss",
      0,
      "groza",
      0,
      "hpsa",
      0,
      "knife",
      0,
      "l85",
      0,
      "lr300",
      0,
      "mp5",
      0,
      "pb",
      0,
      "pkm",
      0,
      "pm",
      0,
      "protecta",
      0,
      "rg",
      0,
      "rgd5",
      0,
      "rpg7",
      0,
      "sig220",
      0,
      "sig550",
      0,
      "spas12",
      0,
      "svd",
      0,
      "svu",
      0,
      "toz34",
      0,
      "usp45",
      0,
      "val",
      0,
      "vintorez",
      0,
      "walther",
      0,
      "wincheaster1300",
      0,
      2,
      "af_1",
      true,
      "af_2",
      true,
      0,
    ]);
    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.U32,
      EPacketDataType.U16,
      EPacketDataType.U16,
      EPacketDataType.U32,
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.STRING,
      EPacketDataType.F32,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U8,
    ]);

    disposeManager(StatisticsManager);

    const newManager: StatisticsManager = getManager(StatisticsManager);

    newManager.load(processor.asNetProcessor());

    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
    expect(newManager).not.toBe(oldManager);

    expect(newManager.actorStatistics).toEqualLuaTables({
      collectedArtefacts: $fromObject<TName, boolean>({ af_1: true, af_2: true }),
      collectedArtefactsCount: 10,
      collectedTreasuresCount: 24,
      killedMonstersCount: 30,
      killedStalkersCount: 4,
      bestKilledMonsterRank: 16,
      surgesCount: 1,
      completedTasksCount: 40,
      favoriteWeapon: "wpn_ak74",
      bestKilledMonster: "bloodsucker_strong",
    });
  });

  it("should correctly handle debug dump event", () => {
    const manager: StatisticsManager = getManager(StatisticsManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ StatisticsManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ StatisticsManager: expect.any(Object) });
  });
});
