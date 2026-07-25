import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { action_base, anim, level, look, move, property_storage } from "xray16";
import {
  EGameObjectMovementType,
  EGameObjectPath,
  GameObject,
  ServerCreatureObject,
  ServerGroupObject,
  ServerObject,
} from "xray16/alias";
import { Z_VECTOR } from "xray16/lib";
import {
  MockAlifeOnlineOfflineGroup,
  MockAlifeSmartZone,
  MockGameObject,
  MockObject,
  MockServerAlifeCreatureAbstract,
  MockVector,
} from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { registerSimulator } from "@/engine/core/database";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { Squad } from "@/engine/core/objects/squad";
import { ReachTaskPatrolManager } from "@/engine/core/schemes/stalker/reach_task";
import { ActionReachTaskLocation } from "@/engine/core/schemes/stalker/reach_task/actions/ActionReachTaskLocation";
import { reachTaskConfig } from "@/engine/core/schemes/stalker/reach_task/ReachTaskConfig";
import { MockSquad } from "@/fixtures/engine";

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
  const serverObject: ServerCreatureObject = MockServerAlifeCreatureAbstract.mock({ id: object.id() });
  const target: ServerGroupObject = MockAlifeOnlineOfflineGroup.mock();

  jest.spyOn(object, "best_weapon").mockImplementation(() => weapon);

  serverObject.group_id = squad.id;
  squad.assignedTargetId = target.id;

  return { action, object, weapon, squad, serverObject, target };
}

describe("ActionReachTaskLocation", () => {
  beforeEach(() => {
    registerSimulator();
    reachTaskConfig.PATROLS = new LuaTable();
    surgeConfig.IS_STARTED = false;
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

  it("should execute base action while movement update is throttled", () => {
    const { object, action } = mockActionData();

    action.setup(object, new property_storage());
    action.initialize();

    const baseActionExecute = jest.spyOn(action_base.prototype, "execute");

    action.execute();

    expect(baseActionExecute).toHaveBeenCalledTimes(1);

    baseActionExecute.mockRestore();
  });

  it("should delegate updates to the squad participant movement flow", () => {
    const { action, object, squad } = mockActionData();

    action.setup(object, new property_storage());
    action.initialize();

    jest.spyOn(Date, "now").mockImplementation(() => 6000);
    jest.spyOn(action, "executeSquadCommander").mockImplementation(() => {});
    jest.spyOn(action, "executeSquadSoldier").mockImplementation(() => {});

    action.execute();

    expect(action.executeSquadSoldier).toHaveBeenCalledWith(squad, undefined);
    expect(action.executeSquadCommander).not.toHaveBeenCalled();
    expect(action.nextUpdateAt).toBe(6000 + reachTaskConfig.PATROL_UPDATE_PERIOD);
  });

  it("should delegate updates to the squad commander movement flow", () => {
    const { action, object, squad } = mockActionData();

    jest.spyOn(squad, "commander_id").mockReturnValue(object.id());

    action.setup(object, new property_storage());
    action.initialize();

    jest.spyOn(Date, "now").mockImplementation(() => 6000);
    jest.spyOn(action, "executeSquadCommander").mockImplementation(() => {});
    jest.spyOn(action, "executeSquadSoldier").mockImplementation(() => {});

    action.execute();

    expect(action.executeSquadCommander).toHaveBeenCalledWith(squad, undefined);
    expect(action.executeSquadSoldier).not.toHaveBeenCalled();
    expect(action.nextUpdateAt).toBe(6000 + reachTaskConfig.PATROL_UPDATE_PERIOD);
  });

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

  it("should head to another game vertex as commander", () => {
    const { object, action, squad, target } = mockActionData();

    jest.spyOn(squad, "commander_id").mockImplementation(() => object.id());
    jest.spyOn(object, "game_vertex_id").mockImplementation(() => target.m_game_vertex_id + 1);

    action.setup(object, new property_storage());
    action.initialize();

    resetFunctionMock(object.set_path_type);
    resetFunctionMock(object.set_dest_level_vertex_id);

    action.executeSquadCommander(squad, target as unknown as TSimulationObject);

    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.GAME_PATH);
    expect(object.set_dest_game_vertex_id).toHaveBeenCalledWith(target.m_game_vertex_id);
    expect(object.set_dest_level_vertex_id).not.toHaveBeenCalled();
  });

  it("should move to the target level position as commander", () => {
    const { object, action, squad, target } = mockActionData();

    jest.spyOn(squad, "commander_id").mockImplementation(() => object.id());
    jest.spyOn(object, "game_vertex_id").mockImplementation(() => target.m_game_vertex_id);

    action.setup(object, new property_storage());
    action.initialize();

    resetFunctionMock(object.set_path_type);

    action.executeSquadCommander(squad, target as unknown as TSimulationObject);

    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(target.m_level_vertex_id);
    expect(object.set_desired_position).toHaveBeenCalledWith(target.position);
  });

  it("should pick the nearest accessible position for an unreachable target", () => {
    const { object, action, squad, target } = mockActionData();

    jest.spyOn(squad, "commander_id").mockImplementation(() => object.id());
    jest.spyOn(object, "game_vertex_id").mockImplementation(() => target.m_game_vertex_id);
    jest.spyOn(object, "accessible").mockImplementation(() => false);
    jest.spyOn(object, "accessible_nearest").mockImplementation(() => $multi(777, MockVector.create(7, 0, 0)));

    action.setup(object, new property_storage());
    action.initialize();

    action.executeSquadCommander(squad, target as unknown as TSimulationObject);

    expect(object.set_dest_level_vertex_id).toHaveBeenCalledWith(777);
  });

  it("should skip commander movement while talking or without target", () => {
    const { object, action, squad, target } = mockActionData();

    jest.spyOn(squad, "commander_id").mockImplementation(() => object.id());
    jest.spyOn(object, "is_talking").mockImplementation(() => true);

    action.setup(object, new property_storage());
    action.initialize();

    resetFunctionMock(object.set_dest_level_vertex_id);

    action.executeSquadCommander(squad, target as unknown as TSimulationObject);
    action.executeSquadCommander(squad, null);

    expect(object.set_dest_level_vertex_id).not.toHaveBeenCalled();
  });

  it("should follow the commander movement type without a target", () => {
    const { object, action, squad } = mockActionData();
    const commander: GameObject = MockGameObject.mock();

    action.setup(object, new property_storage());
    action.initialize();

    jest.spyOn(squad, "commander_id").mockImplementation(() => commander.id());
    jest.spyOn(level, "object_by_id").mockImplementation(() => commander);

    resetFunctionMock(object.set_movement_type);

    action.executeSquadSoldier(squad, null);

    expect(object.set_path_type).toHaveBeenCalledWith(EGameObjectPath.LEVEL_PATH);
    expect(object.set_movement_type).toHaveBeenCalledWith(commander.movement_type());
    expect(object.set_mental_state).toHaveBeenCalledWith(commander.mental_state());
  });

  it("should stand still when the commander stands still", () => {
    const { object, action, squad } = mockActionData();
    // A squad target short-circuits soldier movement, so a non-squad simulation target is used here.
    const target: ServerObject = MockAlifeSmartZone.mock();
    const commander: GameObject = MockGameObject.mock();

    jest.spyOn(commander, "movement_type").mockImplementation(() => move.stand);

    action.setup(object, new property_storage());
    action.initialize();

    jest.spyOn(squad, "commander_id").mockImplementation(() => commander.id());
    jest.spyOn(level, "object_by_id").mockImplementation(() => commander);

    resetFunctionMock(object.set_movement_type);

    action.executeSquadSoldier(squad, target as unknown as TSimulationObject);

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);
  });

  it("should choose run or walk by distance to the order position", () => {
    const { object, action, squad } = mockActionData();
    // A squad target short-circuits soldier movement, so a non-squad simulation target is used here.
    const target: ServerObject = MockAlifeSmartZone.mock();
    const commander: GameObject = MockGameObject.mock();

    jest.spyOn(commander, "movement_type").mockImplementation(() => move.walk);
    jest.spyOn(object, "position").mockImplementation(() => MockVector.create(0, 0, 0));

    action.setup(object, new property_storage());
    action.initialize();

    jest.spyOn(squad, "commander_id").mockImplementation(() => commander.id());
    jest.spyOn(level, "object_by_id").mockImplementation(() => commander);
    jest.spyOn(level, "vertex_position").mockImplementation(() => MockVector.create(100, 0, 0));

    resetFunctionMock(object.set_movement_type);
    action.executeSquadSoldier(squad, target as unknown as TSimulationObject);
    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);

    jest.spyOn(level, "vertex_position").mockImplementation(() => MockVector.create(1, 0, 0));

    resetFunctionMock(object.set_movement_type);
    action.executeSquadSoldier(squad, target as unknown as TSimulationObject);
    expect(object.set_movement_type).toHaveBeenCalledWith(move.walk);
  });
});
