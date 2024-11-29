import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph } from "xray16";

import { registerObject, updateSimulationObjectAvailability } from "@/engine/core/database";
import { registerSimulationTerrain } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  isObjectArrivedToTerrain,
  isSquadArrivedToTerrain,
} from "@/engine/core/objects/smart_terrain/object/smart_terrain_object";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { AnyObject, GameObject, ServerCreatureObject } from "@/engine/lib/types";
import { MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

describe("isObjectArrivedToSmartTerrain utility", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check arrived state based on squad", () => {
    const object: ServerCreatureObject = MockAlifeHumanStalker.mock();
    const squad: Squad = MockSquad.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    registerSimulationTerrain(terrain);

    object.group_id = squad.id;
    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(isObjectArrivedToTerrain(object, terrain)).toBe(true);
  });

  it("should correctly check arrived state based on server object", () => {
    const serverObject: ServerCreatureObject = MockAlifeHumanStalker.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(true);

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 10_001);
    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(false);

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 9999);
    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(true);

    (terrain as AnyObject).m_game_vertex_id = 550;
    jest.spyOn(game_graph().vertex(550), "level_id").mockImplementation(() => 1001);
    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(false);
  });

  it("should correctly check arrived state based on object online", () => {
    const serverObject: ServerCreatureObject = MockAlifeHumanStalker.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });

    registerObject(object);

    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(true);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 10_001);
    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(false);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 9999);
    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(true);

    jest.spyOn(object, "game_vertex_id").mockImplementation(() => 551);
    jest.spyOn(game_graph().vertex(551), "level_id").mockImplementation(() => 1002);
    expect(isObjectArrivedToTerrain(serverObject, terrain)).toBe(false);
  });
});

describe("isSquadArrivedToSmartTerrain utility", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should return null on unknown status", () => {
    const squad: Squad = MockSquad.mock();

    expect(isSquadArrivedToTerrain(squad)).toBeNull();
  });

  it("should correctly check arrived state based on react target action", () => {
    const squad: Squad = MockSquad.mock();
    const target: Squad = MockSquad.mock();

    updateSimulationObjectAvailability(squad);
    updateSimulationObjectAvailability(target);

    squad.assignedTargetId = target.id;
    squad.currentAction = new SquadReachTargetAction(squad);

    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(() => true);
    expect(isSquadArrivedToTerrain(squad)).toBe(true);

    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(() => false);
    expect(isSquadArrivedToTerrain(squad)).toBe(false);

    expect(target.isReachedBySimulationObject).toHaveBeenCalledTimes(2);
    expect(target.isReachedBySimulationObject).toHaveBeenCalledWith(squad);
  });

  it("should correctly check arrived state based stay on target action", () => {
    const squad: Squad = MockSquad.mock();

    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(isSquadArrivedToTerrain(squad)).toBe(true);
  });
});
