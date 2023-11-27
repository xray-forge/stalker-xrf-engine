import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { disposeManager, getManagerInstance, registerActor, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GameObject, TClassId, TName } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockLuaTable } from "@/fixtures/lua";
import {
  EPacketDataType,
  mockActorGameObject,
  MockGameObject,
  MockNetProcessor,
  mockServerAlifeMonsterBase,
  mockServerAlifeObject,
} from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("StatisticsManager class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize and destroy", () => {
    const statisticsManager: StatisticsManager = getManagerInstance(StatisticsManager);
    const eventsManager: EventsManager = getManagerInstance(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(10);
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
    const manager: StatisticsManager = StatisticsManager.getInstance();

    expect(manager.actorStatistics.surgesCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.SURGE_ENDED);
    EventsManager.emitEvent(EGameEvent.SURGE_SKIPPED);

    expect(manager.actorStatistics.surgesCount).toBe(2);
  });

  it("should correctly handle treasures finding", () => {
    const manager: StatisticsManager = StatisticsManager.getInstance();

    expect(manager.actorStatistics.collectedTreasuresCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, {});
    EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, {});

    expect(manager.actorStatistics.collectedTreasuresCount).toBe(2);
  });

  it("should correctly handle stalkers killing", () => {
    const manager: StatisticsManager = StatisticsManager.getInstance();
    const actor: GameObject = mockActorGameObject();

    expect(manager.actorStatistics.killedStalkersCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.STALKER_KILLED, MockGameObject.mock(), actor);
    EventsManager.emitEvent(EGameEvent.STALKER_KILLED, MockGameObject.mock(), actor);
    EventsManager.emitEvent(EGameEvent.STALKER_KILLED, MockGameObject.mock(), null);
    EventsManager.emitEvent(EGameEvent.STALKER_KILLED, MockGameObject.mock(), MockGameObject.mock());

    expect(manager.actorStatistics.killedStalkersCount).toBe(2);
  });

  it("should correctly handle tasks", () => {
    const manager: StatisticsManager = StatisticsManager.getInstance();

    expect(manager.actorStatistics.completedTasksCount).toBe(0);

    EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, {});
    EventsManager.emitEvent(EGameEvent.TASK_COMPLETED, {});

    expect(manager.actorStatistics.completedTasksCount).toBe(2);
  });

  it("should correctly handle anabiotics", () => {
    registerActor(mockActorGameObject());

    const manager: StatisticsManager = StatisticsManager.getInstance();

    expect(manager.getUsedAnabioticsCount()).toBe(0);

    EventsManager.emitEvent(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC);
    EventsManager.emitEvent(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC);

    expect(manager.getUsedAnabioticsCount()).toBe(2);
  });

  it("should correctly handle taking artefacts", () => {
    const manager: StatisticsManager = StatisticsManager.getInstance();
    const firstClient: GameObject = MockGameObject.mock({ clsid: () => clsid.art_black_drops as TClassId });
    const secondClient: GameObject = MockGameObject.mock({ clsid: () => clsid.art_bast_artefact as TClassId });
    const thirdClient: GameObject = MockGameObject.mock({ clsid: () => clsid.art_zuda as TClassId });

    mockServerAlifeObject({ id: firstClient.id(), sectionOverride: "af_first" });
    mockServerAlifeObject({ id: secondClient.id(), sectionOverride: "af_first" });
    mockServerAlifeObject({ id: thirdClient.id(), sectionOverride: "af_second" });

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
    const manager: StatisticsManager = StatisticsManager.getInstance();
    const ak74: GameObject = MockGameObject.mock();
    const desertEagle: GameObject = MockGameObject.mock();
    const desertEagleNimble: GameObject = MockGameObject.mock();
    const actor: GameObject = mockActorGameObject();
    const target: GameObject = MockGameObject.mock();

    registerActor(actor);

    mockServerAlifeObject({ id: ak74.id(), sectionOverride: weapons.wpn_ak74 });
    mockServerAlifeObject({ id: desertEagle.id(), sectionOverride: weapons.wpn_desert_eagle });
    mockServerAlifeObject({ id: desertEagleNimble.id(), sectionOverride: weapons.wpn_desert_eagle_nimble });

    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 100, MockVector.mock(), actor);
    EventsManager.emitEvent(EGameEvent.MONSTER_HIT, target, 100, MockVector.mock(), MockGameObject.mock());

    expect(manager.weaponsStatistics.length()).toBe(36);
    (manager.weaponsStatistics as unknown as MockLuaTable<unknown, unknown>).forEach((value, key) => {
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
    const manager: StatisticsManager = StatisticsManager.getInstance();
    const firstMonster: GameObject = MockGameObject.mock({ clsid: () => clsid.flesh_s, rank: () => 3 });
    const secondMonster: GameObject = MockGameObject.mock({ clsid: () => clsid.bloodsucker_s, rank: () => 15 });
    const thirdMonster: GameObject = MockGameObject.mock({ clsid: () => clsid.bloodsucker_s, rank: () => 16 });
    const actor: GameObject = mockActorGameObject();

    registerActor(actor);
    mockServerAlifeMonsterBase({ id: firstMonster.id(), rank: () => 3 });
    mockServerAlifeMonsterBase({ id: secondMonster.id(), rank: () => 15 });
    mockServerAlifeMonsterBase({ id: thirdMonster.id(), rank: () => 16 });

    expect(manager.actorStatistics.killedMonstersCount).toBe(0);
    expect(manager.actorStatistics.bestKilledMonster).toBeNull();
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(0);

    expect(() => EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, MockGameObject.mock(), actor)).toThrow();
    expect(() => {
      EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, MockGameObject.mock(), MockGameObject.mock());
    }).not.toThrow();

    expect(manager.actorStatistics.killedMonstersCount).toBe(0);
    expect(manager.actorStatistics.bestKilledMonster).toBeNull();
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(0);

    EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, firstMonster, actor);

    expect(manager.actorStatistics.killedMonstersCount).toBe(1);
    expect(manager.actorStatistics.bestKilledMonster).toBe("flesh_strong");
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(3);

    EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, secondMonster, actor);

    expect(manager.actorStatistics.killedMonstersCount).toBe(2);
    expect(manager.actorStatistics.bestKilledMonster).toBe("bloodsucker_normal");
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(15);

    EventsManager.emitEvent(EGameEvent.MONSTER_KILLED, thirdMonster, actor);

    expect(manager.actorStatistics.killedMonstersCount).toBe(3);
    expect(manager.actorStatistics.bestKilledMonster).toBe("bloodsucker_strong");
    expect(manager.actorStatistics.bestKilledMonsterRank).toBe(16);
  });

  it("should correctly save and load data", () => {
    const oldManager: StatisticsManager = getManagerInstance(StatisticsManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

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

    oldManager.save(netProcessor.asMockNetPacket());

    expect(netProcessor.dataList).toEqual([
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
    expect(netProcessor.writeDataOrder).toEqual([
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

    const newManager: StatisticsManager = getManagerInstance(StatisticsManager);

    newManager.load(netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
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
});
