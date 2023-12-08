import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph } from "xray16";

import { registerObject, updateSimulationObjectAvailability } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  isObjectArrivedToSmartTerrain,
  isSquadArrivedToSmartTerrain,
} from "@/engine/core/objects/smart_terrain/object/smart_terrain_object";
import { Squad, SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad";
import { AnyObject, GameObject, ServerCreatureObject } from "@/engine/lib/types";
import { mockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("isObjectArrivedToSmartTerrain utility", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check arrived state based on squad", () => {
    const object: ServerCreatureObject = mockServerAlifeHumanStalker();
    const squad: Squad = MockSquad.mock();
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    getManager(SimulationManager).registerSmartTerrain(smartTerrain);

    object.group_id = squad.id;
    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(isObjectArrivedToSmartTerrain(object, smartTerrain)).toBe(true);
  });

  it("should correctly check arrived state based on server object", () => {
    const serverObject: ServerCreatureObject = mockServerAlifeHumanStalker();
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(true);

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 10_001);
    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(false);

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 9999);
    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(true);

    (smartTerrain as AnyObject).m_game_vertex_id = 550;
    jest.spyOn(game_graph().vertex(550), "level_id").mockImplementation(() => 1001);
    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(false);
  });

  it("should correctly check arrived state based on object online", () => {
    const serverObject: ServerCreatureObject = mockServerAlifeHumanStalker();
    const smartTerrain: SmartTerrain = mockSmartTerrain();
    const object: GameObject = MockGameObject.mock({ idOverride: serverObject.id });

    registerObject(object);

    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(true);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 10_001);
    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(false);

    jest.spyOn(object.position(), "distance_to_sqr").mockImplementation(() => 9999);
    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(true);

    jest.spyOn(object, "game_vertex_id").mockImplementation(() => 551);
    jest.spyOn(game_graph().vertex(551), "level_id").mockImplementation(() => 1002);
    expect(isObjectArrivedToSmartTerrain(serverObject, smartTerrain)).toBe(false);
  });
});

describe("isSquadArrivedToSmartTerrain utility", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should return null on unknown status", () => {
    const squad: Squad = MockSquad.mock();

    expect(isSquadArrivedToSmartTerrain(squad)).toBeNull();
  });

  it("should correctly check arrived state based on react target action", () => {
    const squad: Squad = MockSquad.mock();
    const target: Squad = MockSquad.mock();

    updateSimulationObjectAvailability(squad);
    updateSimulationObjectAvailability(target);

    squad.assignedTargetId = target.id;
    squad.currentAction = new SquadReachTargetAction(squad);

    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(() => true);
    expect(isSquadArrivedToSmartTerrain(squad)).toBe(true);

    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(() => false);
    expect(isSquadArrivedToSmartTerrain(squad)).toBe(false);

    expect(target.isReachedBySimulationObject).toHaveBeenCalledTimes(2);
    expect(target.isReachedBySimulationObject).toHaveBeenCalledWith(squad);
  });

  it("should correctly check arrived state based stay on target action", () => {
    const squad: Squad = MockSquad.mock();

    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(isSquadArrivedToSmartTerrain(squad)).toBe(true);
  });
});
