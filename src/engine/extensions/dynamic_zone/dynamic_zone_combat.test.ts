import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { ServerCreatureObject } from "xray16/alias";
import { LuaArray, TName, TRate } from "xray16/lib";
import { $fromArray, $fromObject } from "xray16/macros";
import { MockAlifeHumanStalker, MockAlifeMonsterBase, MockIniFile } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { communities, TCommunity } from "@/engine/constants/communities";
import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { assignSimulationSquadToTerrain, destroySimulationData } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { resetPositionCache } from "@/engine/core/utils/position";
import { createDynamicZoneBases } from "@/engine/extensions/dynamic_zone/dynamic_zone_bases";
import {
  canDynamicZoneSquadFight,
  canDynamicZoneSquadsFight,
  createDynamicZoneCombat,
  fightDynamicZoneRound,
  getDynamicZoneMemberPower,
  IDynamicZoneCombat,
  killDynamicZoneWounded,
  releaseDynamicZoneCorpses,
  updateDynamicZoneCombat,
} from "@/engine/extensions/dynamic_zone/dynamic_zone_combat";
import { IDynamicZoneConfig, readDynamicZoneConfig } from "@/engine/extensions/dynamic_zone/dynamic_zone_config";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

/**
 * @param settings - Combat settings of the extension's `main.ltx`.
 * @returns State of offline battles with the settings, no bases protecting anyone.
 */
function mockCombat(settings: Record<string, number> = {}): IDynamicZoneCombat {
  const config: IDynamicZoneConfig = readDynamicZoneConfig(MockIniFile.mock("main.ltx", { combat: settings }));

  return createDynamicZoneCombat(config, createDynamicZoneBases(config));
}

/**
 * @param faction - Faction of the squad.
 * @param ranks - Ranks of its stalkers.
 * @returns Offline squad of the faction, registered in the simulation.
 */
function mockFighters(faction: TCommunity, ranks: Array<number>): MockSquad {
  const squad: MockSquad = MockSquad.mock();

  squad.faction = faction;
  squad.mockSetOnline(false);

  for (const rank of ranks) {
    squad.mockAddMember(MockAlifeHumanStalker.mock({ rank }));
  }

  registry.simulationObjects.set(squad.id, squad);

  return squad;
}

/**
 * @param squad - Squad.
 * @returns Its members.
 */
function getMembers(squad: MockSquad): Array<ServerCreatureObject> {
  const members: Array<ServerCreatureObject> = [];

  for (const member of squad.squad_members()) {
    members.push(member.object);
  }

  return members;
}

/**
 * Make random picks predictable: shares are the middle of their range, picks the lowest choice.
 */
function mockRandom(): void {
  jest.spyOn(math, "random").mockImplementation(((low?: number) => low ?? 0.5) as typeof math.random);
}

beforeEach(() => {
  resetRegistry();
  registerSimulator();
  mockRegisteredActor();
  destroySimulationData();
  resetPositionCache();
});

describe("createDynamicZoneCombat", () => {
  it("should keep the combat distance squared, with the first round due at once", () => {
    const combat: IDynamicZoneCombat = mockCombat({ distance: 30 });

    expect(combat.distanceSqr).toBe(900);
    expect(combat.nextRoundAt).toBe(0);
    expect(combat.power).toEqualLuaTables({});
    expect(combat.corpses).toEqualLuaArrays([]);
  });
});

describe("canDynamicZoneSquadFight", () => {
  it("should let offline squads with members fight, away from bases and without story characters", () => {
    const combat: IDynamicZoneCombat = mockCombat();
    const squad: MockSquad = mockFighters(communities.stalker, [30]);

    expect(canDynamicZoneSquadFight(combat, squad)).toBe(true);
    expect(canDynamicZoneSquadFight(combat, mockFighters(communities.stalker, []))).toBe(false);

    squad.mockSetOnline(true);
    expect(canDynamicZoneSquadFight(combat, squad)).toBe(false);

    squad.mockSetOnline(false);
    registerStoryLink(getMembers(squad)[0].id, "test_story_member");
    expect(canDynamicZoneSquadFight(combat, squad)).toBe(false);

    const story: MockSquad = mockFighters(communities.stalker, [30]);

    registerStoryLink(story.id, "test_story_squad");
    expect(canDynamicZoneSquadFight(combat, story)).toBe(false);

    const base: SmartTerrain = MockSmartTerrain.mockRegistered("test_base");
    const resident: MockSquad = mockFighters(communities.stalker, [30]);

    base.simulationProperties = $fromObject<TName, TRate>({ base: 1 });
    assignSimulationSquadToTerrain(resident, base.id);
    expect(canDynamicZoneSquadFight(combat, resident)).toBe(false);
  });
});

describe("canDynamicZoneSquadsFight", () => {
  it("should pair enemies that are close or stay on the same target", () => {
    const combat: IDynamicZoneCombat = mockCombat();
    const stalkers: MockSquad = mockFighters(communities.stalker, [30]);
    const monolith: MockSquad = mockFighters(communities.monolith, [30]);
    const friends: MockSquad = mockFighters(communities.stalker, [30]);
    const distance = jest.spyOn(stalkers.position, "distance_to_sqr").mockImplementation(() => 400);

    expect(canDynamicZoneSquadsFight(combat, stalkers, monolith)).toBe(true);
    expect(canDynamicZoneSquadsFight(combat, monolith, stalkers)).toBe(true);
    expect(canDynamicZoneSquadsFight(combat, stalkers, friends)).toBe(false);

    distance.mockImplementation(() => 401);
    expect(canDynamicZoneSquadsFight(combat, stalkers, monolith)).toBe(false);

    stalkers.assignedTargetId = 500;
    monolith.assignedTargetId = 500;
    stalkers.currentAction = new SquadStayOnTargetAction(stalkers);
    expect(canDynamicZoneSquadsFight(combat, stalkers, monolith)).toBe(false);

    monolith.currentAction = new SquadStayOnTargetAction(monolith);
    expect(canDynamicZoneSquadsFight(combat, stalkers, monolith)).toBe(true);
  });
});

describe("getDynamicZoneMemberPower", () => {
  it("should take a stalker's rank and a mutant's rank scaled, at least one", () => {
    const combat: IDynamicZoneCombat = mockCombat({ monster_rank_factor: 8 });

    expect(getDynamicZoneMemberPower(combat, MockAlifeHumanStalker.mock({ rank: 40 }))).toBe(40);
    expect(getDynamicZoneMemberPower(combat, MockAlifeHumanStalker.mock({ rank: 0 }))).toBe(1);
    expect(getDynamicZoneMemberPower(combat, MockAlifeMonsterBase.mock({ rank: 15 }))).toBe(120);
  });
});

describe("killDynamicZoneWounded", () => {
  it("should kill the members the wounds account for, crediting a member of the other squad", () => {
    const combat: IDynamicZoneCombat = mockCombat();
    const members: LuaArray<ServerCreatureObject> = $fromArray<ServerCreatureObject>([
      MockAlifeHumanStalker.mock({ rank: 10 }),
      MockAlifeHumanStalker.mock({ rank: 20 }),
      MockAlifeHumanStalker.mock({ rank: 30 }),
    ]);
    const [weak, middle, strong] = [members.get(1), members.get(2), members.get(3)];
    const killer: ServerCreatureObject = MockAlifeHumanStalker.mock({ rank: 50 });

    mockRandom();
    jest.spyOn(weak, "on_death");
    jest.spyOn(middle, "on_death");

    killDynamicZoneWounded(combat, members, 25, $fromArray([killer]));

    expect(weak.on_death).toHaveBeenCalledWith(killer);
    expect(middle.on_death).toHaveBeenCalledWith(killer);
    expect(strong.alive()).toBe(true);
    expect(combat.corpses).toEqualLuaArrays([
      { id: weak.id, name: weak.name() },
      { id: middle.id, name: middle.name() },
    ]);
  });

  it("should kill every member once a squad has no power left", () => {
    const combat: IDynamicZoneCombat = mockCombat();
    const members: LuaArray<ServerCreatureObject> = $fromArray<ServerCreatureObject>([
      MockAlifeHumanStalker.mock({ rank: 10 }),
      MockAlifeHumanStalker.mock({ rank: 20 }),
    ]);

    killDynamicZoneWounded(combat, members, -5, $fromArray<ServerCreatureObject>([MockAlifeHumanStalker.mock()]));

    expect(members.get(1).alive()).toBe(false);
    expect(members.get(2).alive()).toBe(false);
  });
});

describe("fightDynamicZoneRound", () => {
  it("should fight one battle per squad, both sides striking at once, wounds carrying to the next round", () => {
    const combat: IDynamicZoneCombat = mockCombat();
    const monolith: MockSquad = mockFighters(communities.monolith, [50, 50]);
    const stalkers: MockSquad = mockFighters(communities.stalker, [30]);
    const others: MockSquad = mockFighters(communities.stalker, [40]);
    const [lone] = getMembers(stalkers);

    mockRandom();

    fightDynamicZoneRound(combat);

    // Monolith deal 100 x 0.5 to the lone stalker, who deals 30 x 0.5 back; the other stalkers find no free enemy.
    expect(combat.power).toEqualLuaTables({ [monolith.id]: 85, [stalkers.id]: -20 });
    expect(lone.alive()).toBe(false);
    expect(getMembers(monolith).every((it) => it.alive())).toBe(true);
    expect(getMembers(others)[0].alive()).toBe(true);

    stalkers.mockRemoveMember(lone);
    fightDynamicZoneRound(combat);

    // Monolith keep their wounds against the other stalkers: 85 - 40 x 0.5.
    expect(combat.power).toEqualLuaTables({ [monolith.id]: 65, [others.id]: -2.5 });
  });

  it("should leave online squads and lone factions alone", () => {
    const combat: IDynamicZoneCombat = mockCombat();
    const monolith: MockSquad = mockFighters(communities.monolith, [50]);

    mockFighters(communities.monolith, [50]);
    mockFighters(communities.stalker, [30]).mockSetOnline(true);

    fightDynamicZoneRound(combat);

    expect(combat.power).toEqualLuaTables({});
    expect(getMembers(monolith)[0].alive()).toBe(true);
  });
});

describe("updateDynamicZoneCombat", () => {
  it("should fight a round once the interval passes", () => {
    const combat: IDynamicZoneCombat = mockCombat({ scan_interval: 30 });

    mockFighters(communities.monolith, [50]);
    mockFighters(communities.stalker, [20]);
    mockRandom();
    replaceFunctionMock(time_global, () => 1_000);

    updateDynamicZoneCombat.call(combat);

    expect(combat.nextRoundAt).toBe(31_000);
    expect(combat.corpses.length()).toBe(1);

    updateDynamicZoneCombat.call(combat);

    expect(combat.corpses.length()).toBe(1);
  });
});

describe("releaseDynamicZoneCorpses", () => {
  it("should release the oldest offline bodies over the limit, dropping those already gone", () => {
    const combat: IDynamicZoneCombat = mockCombat({ corpse_limit: 1 });
    const online: ServerCreatureObject = MockAlifeHumanStalker.mock({ alive: false, online: true });
    const reused: ServerCreatureObject = MockAlifeHumanStalker.mock({ online: false });
    const renamed: ServerCreatureObject = MockAlifeHumanStalker.mock({ alive: false, online: false });
    const body: ServerCreatureObject = MockAlifeHumanStalker.mock({ alive: false, online: false });

    combat.corpses = $fromArray([
      { id: 65_000, name: "test_gone" },
      { id: online.id, name: online.name() },
      { id: reused.id, name: reused.name() },
      { id: renamed.id, name: "test_renamed" },
      { id: body.id, name: body.name() },
    ]);

    releaseDynamicZoneCorpses(combat);

    expect(registry.simulator.release).toHaveBeenCalledTimes(1);
    expect(registry.simulator.release).toHaveBeenCalledWith(body, true);
    expect(combat.corpses).toEqualLuaArrays([{ id: online.id, name: online.name() }]);
  });
});
