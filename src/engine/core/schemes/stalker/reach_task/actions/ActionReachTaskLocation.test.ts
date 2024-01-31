import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { anim, look, move, property_storage } from "xray16";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { registerSimulator } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { ReachTaskPatrolManager } from "@/engine/core/schemes/stalker/reach_task";
import { ActionReachTaskLocation } from "@/engine/core/schemes/stalker/reach_task/actions/ActionReachTaskLocation";
import { reachTaskConfig } from "@/engine/core/schemes/stalker/reach_task/ReachTaskConfig";
import { Z_VECTOR } from "@/engine/lib/constants/vectors";
import {
  EGameObjectMovementType,
  EGameObjectPath,
  GameObject,
  ServerCreatureObject,
  ServerGroupObject,
} from "@/engine/lib/types";
import { MockSquad } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import {
  MockGameObject,
  MockObject,
  mockServerAlifeCreatureAbstract,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

interface IMockedActionData {
  action: ActionReachTaskLocation;
  object: GameObject;
  squad: Squad;
  weapon: GameObject;
  serverObject: ServerCreatureObject;
  target: ServerGroupObject;
}

function mockActionData(): IMockedActionData {
  const action: ActionReachTaskLocation = new ActionReachTaskLocation();
  const object: GameObject = MockGameObject.mock();
  const weapon: GameObject = MockGameObject.mock();
  const squad: Squad = MockSquad.mock();
  const serverObject: ServerCreatureObject = mockServerAlifeCreatureAbstract({ id: object.id() });
  const target: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();

  jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);

  serverObject.group_id = squad.id;
  squad.assignedTargetId = target.id;

  return { action, object, weapon, squad, serverObject, target };
}

describe("ActionReachTaskLocation", () => {
  beforeEach(() => {
    registerSimulator();
    reachTaskConfig.PATROLS = new LuaTable();
    jest.spyOn(Date, "now").mockImplementation(() => 5000);
  });

  it("should correctly initialize for squad participant", () => {
    const { object, action, target, weapon, squad } = mockActionData();

    expect(action.nextUpdateAt).toBe(0);

    action.setup(object, new property_storage());
    action.initialize();

    expect(action.reachTargetId).toBe(target.id);
    expect(action.squadId).toBe(squad.id);
    expect(action.currentState).toBe(EStalkerState.PATROL);
    expect(action.formation).toBe(EPatrolFormation.BACK);
    expect(action.levelVertexId).toBe(-1);
    expect(action.distance).toBe(0);
    expect(action.direction).toBe(Z_VECTOR);
    expect(action.nextUpdateAt).toBe(6000);

    expect(object.set_desired_direction).toHaveBeenCalled();
    expect(object.set_movement_selection_type).toHaveBeenCalledWith(EGameObjectMovementType.MASK);
    expect(object.set_item).toHaveBeenCalledWith(MockObject.idle, weapon);
    expect(object.set_body_state).toHaveBeenCalledWith(move.standing);
    expect(object.set_detail_path_type).toHaveBeenCalledWith(move.line);
    expect(object.set_mental_state).toHaveBeenCalledWith(anim.free);
    expect(object.set_movement_type).toHaveBeenCalledWith(move.walk);
    expect(object.set_dest_game_vertex_id).toHaveBeenCalledWith(target.m_game_vertex_id);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.GAME_PATH);
    expect(object.inactualize_patrol_path).toHaveBeenCalled();
    expect(object.set_sight).toHaveBeenCalledWith(look.path_dir, null, 0);

    const patrolManager: ReachTaskPatrolManager = reachTaskConfig.PATROLS.get(squad.id);

    expect(reachTaskConfig.PATROLS.length()).toBe(1);
    expect(patrolManager.objectsList.has(object.id())).toBe(true);
    expect(patrolManager.commanderId).toBeNull();
  });

  it("should correctly initialize for squad commander", () => {
    const { object, action, target, weapon, squad } = mockActionData();

    jest.spyOn(squad, "commander_id").mockImplementation(() => object.id());

    action.setup(object, new property_storage());
    action.initialize();

    expect(action.reachTargetId).toBe(target.id);
    expect(action.squadId).toBe(squad.id);
    expect(action.currentState).toBe(EStalkerState.PATROL);
    expect(action.formation).toBe(EPatrolFormation.BACK);
    expect(action.levelVertexId).toBe(-1);
    expect(action.distance).toBe(0);
    expect(action.direction).toBe(Z_VECTOR);
    expect(action.nextUpdateAt).toBe(6000);

    expect(object.set_desired_direction).toHaveBeenCalled();
    expect(object.set_movement_selection_type).toHaveBeenCalledWith(EGameObjectMovementType.MASK);
    expect(object.set_item).toHaveBeenCalledWith(MockObject.idle, weapon);
    expect(object.set_body_state).toHaveBeenCalledWith(move.standing);
    expect(object.set_detail_path_type).toHaveBeenCalledWith(move.line);
    expect(object.set_mental_state).toHaveBeenCalledWith(anim.free);
    expect(object.set_movement_type).toHaveBeenCalledWith(move.walk);
    expect(object.set_dest_game_vertex_id).toHaveBeenCalledWith(target.m_game_vertex_id);
    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.GAME_PATH);
    expect(object.inactualize_patrol_path).toHaveBeenCalled();
    expect(object.set_sight).toHaveBeenCalledWith(look.path_dir, null, 0);

    const patrolManager: ReachTaskPatrolManager = reachTaskConfig.PATROLS.get(squad.id);

    expect(reachTaskConfig.PATROLS.length()).toBe(1);
    expect(patrolManager.objectsList.has(object.id())).toBe(true);
    expect(patrolManager.commanderId).toBe(object.id());
  });

  it("should correctly finalize", () => {
    const { object, action } = mockActionData();

    action.setup(object, new property_storage());
    action.initialize();

    resetFunctionMock(object.set_movement_selection_type);

    action.finalize();

    expect(object.set_movement_selection_type).toHaveBeenCalledWith(EGameObjectMovementType.RANDOM);
  });

  it.todo("should correctly execute for squad participant");

  it.todo("should correctly execute for squad commander");

  it("should correctly switch death", () => {
    const { object, action, squad } = mockActionData();

    expect(() => action.onDeath(MockGameObject.mock())).not.toThrow();

    action.setup(object, new property_storage());
    action.initialize();

    const patrolManager: ReachTaskPatrolManager = reachTaskConfig.PATROLS.get(squad.id);

    jest.spyOn(patrolManager, "removeObjectFromPatrol").mockImplementation(jest.fn());

    action.onDeath(object);

    expect(patrolManager.removeObjectFromPatrol).toHaveBeenCalledWith(object);
  });

  it("should correctly switch offline", () => {
    const { object, action, squad } = mockActionData();

    expect(() => action.onSwitchOffline(MockGameObject.mock())).not.toThrow();

    action.setup(object, new property_storage());
    action.initialize();

    const patrolManager: ReachTaskPatrolManager = reachTaskConfig.PATROLS.get(squad.id);

    jest.spyOn(patrolManager, "removeObjectFromPatrol").mockImplementation(jest.fn());

    action.onSwitchOffline(object);

    expect(patrolManager.removeObjectFromPatrol).toHaveBeenCalledWith(object);
  });
});
