import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { AnyObject, Z_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EPatrolFormation } from "@/engine/core/ai/patrol";
import { EStalkerState } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { reachTaskConfig } from "@/engine/core/schemes/stalker/reach_task/ReachTaskConfig";
import { ReachTaskPatrolManager } from "@/engine/core/schemes/stalker/reach_task/ReachTaskPatrolManager";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/squad", () => ({ getObjectSquad: jest.fn(() => null) }));

/**
 * Report a squad with the given commander for every object passed to `getObjectSquad`.
 */
function withSquadCommander(commanderId: number): void {
  const squad: AnyObject = { commander_id: () => commanderId };

  replaceFunctionMock(getObjectSquad, () => squad as unknown as Squad);
}

/**
 * Register objects as server-side stand-ins resolvable through the simulator and `level.object_by_id`.
 */
function registerPatrolObjects(objects: Array<GameObject>): void {
  const byId: Record<number, GameObject> = {};

  objects.forEach((it) => (byId[it.id()] = it));

  registry.simulator = {
    object: jest.fn((id: number) => byId[id] ?? null),
  } as unknown as AnyObject as typeof registry.simulator;

  replaceFunctionMock(level.object_by_id, (id: number) => byId[id] ?? null);
}

describe("ReachTaskPatrolManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(getObjectSquad);
    resetFunctionMock(level.object_by_id);
    resetFunctionMock(level.vertex_in_direction);
    resetFunctionMock(level.vertex_position);
    replaceFunctionMock(getObjectSquad, () => null);
  });

  it("should correctly initialize", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);

    expect(manager.targetId).toBe(400);
    expect(manager.currentState).toBe(EStalkerState.PATROL);
    expect(manager.commanderId).toBe(-1);
    expect(manager.formation).toBe(EPatrolFormation.BACK);
    expect(manager.commanderLid).toBe(-1);
    expect(manager.commanderDir).toBe(Z_VECTOR);
    expect(manager.objectsCount).toBe(0);
    expect(manager.objectsList).toEqualLuaTables({});
  });

  it("should not add dead or duplicated objects", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const dead: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(dead, "alive").mockImplementation(() => false);
    withSquadCommander(object.id());
    registerPatrolObjects([object]);

    manager.addObjectToPatrol(dead);
    expect(manager.objectsCount).toBe(0);

    manager.addObjectToPatrol(object);
    expect(manager.objectsCount).toBe(1);

    manager.addObjectToPatrol(object);
    expect(manager.objectsCount).toBe(1);
  });

  it("should mark added squad commander", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander]);

    manager.addObjectToPatrol(commander);

    expect(manager.commanderId).toBe(commander.id());
    expect(manager.isCommander(commander.id())).toBe(true);
    expect(manager.isCommander(commander.id() + 1)).toBe(false);
  });

  it("should assign formation slots to non commander members", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();
    const member: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);

    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    const slot = manager.objectsList.get(member.id());

    expect(slot.dir).toBe(reachTaskConfig.FORMATIONS.back[1].dir);
    expect(slot.dist).toBe(reachTaskConfig.FORMATIONS.back[1].dist);
    expect(slot.vertex_id).toBe(-1);
    expect(slot.accepted).toBe(true);
  });

  it("should stop resetting positions for members without squad", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander]);
    manager.addObjectToPatrol(commander);

    replaceFunctionMock(getObjectSquad, () => null);

    expect(() => manager.resetPositions()).not.toThrow();
  });

  it("should remove objects from patrol", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();
    const member: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);

    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    manager.removeObjectFromPatrol(member);
    expect(manager.objectsCount).toBe(1);
    expect(manager.objectsList.has(member.id())).toBe(false);

    // Removing an unknown object is a no-op.
    manager.removeObjectFromPatrol(member);
    expect(manager.objectsCount).toBe(1);
  });

  it("should reset commander when it leaves the patrol", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander]);

    manager.addObjectToPatrol(commander);
    manager.removeObjectFromPatrol(commander);

    expect(manager.objectsCount).toBe(0);
    expect(manager.commanderId).toBe(-1);
  });

  it("should validate formation on change", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);

    expect(() => manager.setFormation(null as never)).toThrow("Invalid formation (nil) for PatrolManager[400]");
    expect(() => manager.setFormation("diamond" as never)).toThrow("Invalid formation (diamond) for PatrolManager");

    manager.setFormation(EPatrolFormation.LINE);

    expect(manager.formation).toBe(EPatrolFormation.LINE);
  });

  it("should validate arguments when resolving commander", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();
    const member: GameObject = MockGameObject.mock();

    expect(() => manager.getCommander(null as never)).toThrow("Invalid NPC on call");
    expect(() => manager.getCommander(member)).toThrow("can't present in PatrolManager[400]");

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    expect(() => manager.getCommander(commander)).toThrow("Patrol commander called function");
    expect(manager.getCommander(member)).toBe(commander);
  });

  it("should validate arguments when resolving orders", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();
    const member: GameObject = MockGameObject.mock();
    const stranger: GameObject = MockGameObject.mock();

    expect(() => manager.getObjectOrders(null as never)).toThrow("Invalid NPC on call");

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    expect(() => manager.getObjectOrders(stranger)).toThrow("can't present in PatrolManager[400]");
    expect(() => manager.getObjectOrders(commander)).toThrow("Patrol commander called function");
  });

  it("should return own position as orders without a known commander", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const member: GameObject = MockGameObject.mock();

    const [vertexId, direction, state] = manager.getObjectOrders(member);

    expect(vertexId).toBe(member.level_vertex_id());
    expect(direction).toBe(member.direction());
    expect(state).toBe(EStalkerState.PATROL);
  });

  it("should compute formation orders relative to the commander", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const member: GameObject = MockGameObject.mock({ position: MockVector.create(1, 0, 0) });

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    replaceFunctionMock(level.vertex_in_direction, () => 900);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(0, 0, 0));

    const [vertexId, , state] = manager.getObjectOrders(member);

    expect(vertexId).toBe(900);
    expect(manager.objectsList.get(member.id()).vertex_id).toBe(900);
    expect(state).toBe(EStalkerState.PATROL);
  });

  it("should accelerate members that fall behind the commander", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const member: GameObject = MockGameObject.mock({ position: MockVector.create(100, 0, 0) });

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    replaceFunctionMock(level.vertex_in_direction, () => 900);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(0, 0, 0));

    manager.currentState = EStalkerState.WALK;

    const [, , state] = manager.getObjectOrders(member);

    expect(state).toBe(EStalkerState.RUN);
  });

  it("should keep current state for falling behind members without acceleration mapping", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const member: GameObject = MockGameObject.mock({ position: MockVector.create(100, 0, 0) });

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    replaceFunctionMock(level.vertex_in_direction, () => 900);
    replaceFunctionMock(level.vertex_position, () => MockVector.create(0, 0, 0));

    manager.currentState = EStalkerState.THREAT;

    const [, , state] = manager.getObjectOrders(member);

    expect(state).toBe(EStalkerState.THREAT);
  });

  it("should apply commander orders only", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();
    const member: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    manager.setObjectOrders(member, EStalkerState.RUSH, EPatrolFormation.BACK);
    expect(manager.currentState).toBe(EStalkerState.PATROL);

    manager.setObjectOrders(commander, EStalkerState.RUSH, EPatrolFormation.BACK);

    expect(manager.currentState).toBe(EStalkerState.RUSH);
    expect(manager.formation).toBe(EPatrolFormation.BACK);
    expect(manager.commanderLid).toBe(commander.level_vertex_id());
    expect(manager.commanderDir).toBe(commander.direction());
  });

  it("should fail switching to a formation without a configured template", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();
    const member: GameObject = MockGameObject.mock();

    withSquadCommander(commander.id());
    registerPatrolObjects([commander, member]);
    manager.addObjectToPatrol(commander);
    manager.addObjectToPatrol(member);

    // Only the `back` formation has a template in `reachTaskConfig.FORMATIONS`.
    expect(() => manager.setFormation(EPatrolFormation.LINE)).toThrow();
    expect(() => manager.setFormation(EPatrolFormation.AROUND)).toThrow();
  });

  it("should fail applying orders from a dead commander", () => {
    const manager: ReachTaskPatrolManager = new ReachTaskPatrolManager(400);
    const commander: GameObject = MockGameObject.mock();

    jest.spyOn(commander, "alive").mockImplementation(() => false);

    expect(() => manager.setObjectOrders(commander, EStalkerState.RUSH, EPatrolFormation.BACK)).toThrow(
      "NPC commander possible dead in PatrolManager[400]"
    );
  });
});
