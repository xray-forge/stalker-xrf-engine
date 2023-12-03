import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  canSquadHelpActor,
  getSquadHelpActorTargetId,
  isObjectSquadCommander,
  isObjectSquadCommanderById,
} from "@/engine/core/utils/squad/squad_actions";
import { communities } from "@/engine/lib/constants/communities";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("isObjectSquadCommander utils", () => {
  beforeEach(() => {
    mockRegisteredActor();
    registerSimulator();
  });

  it("isObjectSquadCommander should correctly check if object commanding squad", () => {
    expect(isObjectSquadCommander(MockGameObject.mock())).toBe(false);
    expect(isObjectSquadCommander(MockAlifeHumanStalker.mock())).toBe(false);

    const gameObject: GameObject = MockGameObject.mock();
    const squad: Squad = MockSquad.mock();

    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: gameObject.id(),
      group_id: squad.id,
    });

    expect(isObjectSquadCommander(gameObject)).toBe(false);
    expect(isObjectSquadCommander(serverObject)).toBe(false);

    jest.spyOn(squad, "commander_id").mockImplementation(() => gameObject.id());

    expect(isObjectSquadCommander(gameObject)).toBe(true);
    expect(isObjectSquadCommander(serverObject)).toBe(true);
  });

  it("isObjectSquadCommanderById should correctly check if object commanding squad", () => {
    expect(isObjectSquadCommanderById(MockGameObject.mock().id())).toBe(false);
    expect(isObjectSquadCommanderById(MockAlifeHumanStalker.mock().id)).toBe(false);

    const gameObject: GameObject = MockGameObject.mock();
    const squad: Squad = MockSquad.mock();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: gameObject.id(),
      group_id: squad.id,
    });

    expect(isObjectSquadCommanderById(gameObject.id())).toBe(false);
    expect(isObjectSquadCommanderById(serverObject.id)).toBe(false);

    jest.spyOn(squad, "commander_id").mockImplementation(() => gameObject.id());

    expect(isObjectSquadCommanderById(gameObject.id())).toBe(true);
    expect(isObjectSquadCommanderById(serverObject.id)).toBe(true);
  });
});

describe("canSquadHelpActor util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("canSquadHelpActor should correctly check if squad can help actor with no combat / not reachable", () => {
    const squad: MockSquad = MockSquad.mock();

    expect(canSquadHelpActor(squad)).toBe(false);

    registry.actorCombat.set(1, true);
    registry.actorCombat.set(2, true);

    expect(canSquadHelpActor(squad)).toBe(false);

    squad.faction = communities.stalker;
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_stalker_help_harder");
    giveInfoPortion("sim_duty_help_harder");
    giveInfoPortion("sim_freedom_help_harder");

    squad.faction = communities.stalker;
    expect(canSquadHelpActor(squad)).toBe(true);

    squad.mockSetGameVertexId(-1);
    expect(canSquadHelpActor(squad)).toBe(false);

    squad.mockSetGameVertexId(registry.actor.game_vertex_id());
    expect(canSquadHelpActor(squad)).toBe(true);

    registry.actorCombat = new LuaTable();
    expect(canSquadHelpActor(squad)).toBe(false);
  });

  it("canSquadHelpActor should correctly check if squad can help actor with stalker achievement", () => {
    const squad: Squad = MockSquad.mock();

    expect(canSquadHelpActor(squad)).toBe(false);

    registry.actorCombat.set(1, true);
    registry.actorCombat.set(2, true);

    squad.faction = communities.stalker;
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_stalker_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);
  });

  it("canSquadHelpActor should correctly check if squad can help actor with freedom achievement", () => {
    const squad: Squad = MockSquad.mock();

    expect(canSquadHelpActor(squad)).toBe(false);

    registry.actorCombat.set(1, true);
    registry.actorCombat.set(2, true);

    squad.faction = communities.freedom;
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_freedom_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);
  });

  it("canSquadHelpActor should correctly check if squad can help actor with duty achievement", () => {
    const squad: Squad = MockSquad.mock();

    expect(canSquadHelpActor(squad)).toBe(false);

    registry.actorCombat.set(1, true);
    registry.actorCombat.set(2, true);

    squad.faction = communities.dolg;
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_duty_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);
  });
});

describe("getSquadHelpActorTargetId util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("getSquadHelpActorTargetId should correctly get based on combat/position", () => {
    const squad: MockSquad = MockSquad.mock();
    const enemySquad: MockSquad = MockSquad.mock();
    const enemy: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.faction = communities.stalker;
    enemySquad.faction = communities.bandit;

    enemySquad.mockAddMember(enemy);

    expect(getSquadHelpActorTargetId(squad)).toBeNull();

    registry.actorCombat.set(enemy.id, true);
    expect(getSquadHelpActorTargetId(squad)).toBeNull();

    giveInfoPortion("sim_stalker_help_harder");
    giveInfoPortion("sim_duty_help_harder");
    giveInfoPortion("sim_freedom_help_harder");

    expect(getSquadHelpActorTargetId(squad)).toBe(enemySquad.id);

    squad.mockSetGameVertexId(-1);
    expect(getSquadHelpActorTargetId(squad)).toBeNull();

    squad.mockSetGameVertexId(registry.actor.game_vertex_id());
    expect(getSquadHelpActorTargetId(squad)).toBe(enemySquad.id);

    registry.actorCombat = new LuaTable();
    expect(getSquadHelpActorTargetId(squad)).toBeNull();
  });

  it("getSquadHelpActorTargetId should correctly get based on community", () => {
    const squad: MockSquad = MockSquad.mock();
    const enemySquad: MockSquad = MockSquad.mock();
    const enemy: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.faction = communities.stalker;

    enemySquad.mockAddMember(enemy);

    registry.actorCombat.set(enemy.id, true);

    giveInfoPortion("sim_stalker_help_harder");
    giveInfoPortion("sim_duty_help_harder");
    giveInfoPortion("sim_freedom_help_harder");

    enemySquad.faction = communities.stalker;
    expect(getSquadHelpActorTargetId(squad)).toBeNull();

    enemySquad.faction = communities.dolg;
    expect(getSquadHelpActorTargetId(squad)).toBeNull();

    enemySquad.faction = communities.bandit;
    expect(getSquadHelpActorTargetId(squad)).toBe(enemySquad.id);

    enemySquad.faction = communities.zombied;
    expect(getSquadHelpActorTargetId(squad)).toBe(enemySquad.id);
  });

  it("getSquadHelpActorTargetId should correctly get based on distance", () => {
    const squad: MockSquad = MockSquad.mock();
    const enemySquad: MockSquad = MockSquad.mock();
    const enemy: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.faction = communities.stalker;
    enemySquad.faction = communities.zombied;

    enemySquad.mockAddMember(enemy);

    registry.actorCombat.set(enemy.id, true);

    giveInfoPortion("sim_stalker_help_harder");

    expect(getSquadHelpActorTargetId(squad)).toBe(enemySquad.id);

    jest.spyOn(squad.position, "distance_to_sqr").mockImplementation(() => 150 * 150);
    expect(getSquadHelpActorTargetId(squad)).toBeNull();

    jest.spyOn(squad.position, "distance_to_sqr").mockImplementation(() => 150 * 150 - 1);
    expect(getSquadHelpActorTargetId(squad)).toBe(enemySquad.id);
  });
});
