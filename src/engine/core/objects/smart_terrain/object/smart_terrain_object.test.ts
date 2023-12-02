import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game_graph } from "xray16";

import { registerObject, updateSimulationObjectAvailability } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  isObjectArrivedToSmartTerrain,
  isSquadArrivedToSmartTerrain,
} from "@/engine/core/objects/smart_terrain/object/smart_terrain_object";
import { Squad, SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad";
import { AnyObject, GameObject, ServerCreatureObject } from "@/engine/lib/types";
import { mockSmartTerrain, mockSquad, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("isObjectArrivedToSmartTerrain utility", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly check arrived state based on squad", () => {
    const object: ServerCreatureObject = mockServerAlifeHumanStalker();
    const squad: Squad = mockSquad();
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    SimulationBoardManager.getInstance().registerSmartTerrain(smartTerrain);

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
    const squad: Squad = mockSquad();

    expect(isSquadArrivedToSmartTerrain(squad)).toBeNull();
  });

  it("should correctly check arrived state based on react target action", () => {
    const squad: Squad = mockSquad();
    const target: Squad = mockSquad();

    updateSimulationObjectAvailability(squad);
    updateSimulationObjectAvailability(target);

    squad.assignedTargetId = target.id;
    squad.currentAction = new SquadReachTargetAction(squad);

    jest.spyOn(target, "isSquadArrived").mockImplementation(() => true);
    expect(isSquadArrivedToSmartTerrain(squad)).toBe(true);

    jest.spyOn(target, "isSquadArrived").mockImplementation(() => false);
    expect(isSquadArrivedToSmartTerrain(squad)).toBe(false);

    expect(target.isSquadArrived).toHaveBeenCalledTimes(2);
    expect(target.isSquadArrived).toHaveBeenCalledWith(squad);
  });

  it("should correctly check arrived state based stay on target action", () => {
    const squad: Squad = mockSquad();

    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(isSquadArrivedToSmartTerrain(squad)).toBe(true);
  });
});
