import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CALifeSmartTerrainTask } from "xray16";

import { getManager, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { assignSimulationSquadToTerrain, releaseSimulationSquad } from "@/engine/core/managers/simulation/utils";
import { SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { Squad } from "@/engine/core/objects/squad/Squad";
import { parseConditionsList, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { X_VECTOR, Y_VECTOR } from "@/engine/lib/constants/vectors";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/ini/ini_config");
jest.mock("@/engine/core/managers/simulation/utils/simulation_squads");

describe("Squad object", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();

    resetFunctionMock(assignSimulationSquadToTerrain);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const squad: Squad = MockSquad.mock();

    const onSquadRegister = jest.fn();
    const onSquadUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.SQUAD_REGISTERED, onSquadRegister);
    eventsManager.registerCallback(EGameEvent.SQUAD_UNREGISTERED, onSquadUnregister);

    squad.on_register();

    expect(onSquadRegister).toHaveBeenCalledWith(squad);
    expect(onSquadUnregister).not.toHaveBeenCalled();

    squad.on_unregister();

    expect(onSquadRegister).toHaveBeenCalledWith(squad);
    expect(onSquadUnregister).toHaveBeenCalledWith(squad);
  });

  it("should correctly handle member death when not empty", () => {
    const squad: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();
    const action: SquadStayOnTargetAction = new SquadStayOnTargetAction(squad);

    squad.currentAction = action;
    squad.deathConditionList = parseConditionsList(TRUE);

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    jest.spyOn(action, "finalize").mockImplementation(jest.fn());
    jest.spyOn(squad.storyManager, "unregisterObject").mockImplementation(jest.fn());

    squad.onMemberDeath(second);

    expect(squad.npc_count()).toBe(1);
    expect(squad.storyManager.unregisterObject).toHaveBeenCalledWith(second.id);
    expect(squad.currentAction.finalize).toHaveBeenCalledTimes(0);
    expect(pickSectionFromCondList).toHaveBeenCalledTimes(0);
    expect(releaseSimulationSquad).toHaveBeenCalledTimes(0);

    squad.onMemberDeath(first);

    expect(squad.npc_count()).toBe(0);
    expect(squad.storyManager.unregisterObject).toHaveBeenCalledWith(first.id);
    expect(squad.currentAction).toBeNull();
    expect(action.finalize).toHaveBeenCalledTimes(1);
    expect(pickSectionFromCondList).toHaveBeenCalledWith(registry.actor, squad, squad.deathConditionList);
    expect(releaseSimulationSquad).toHaveBeenCalledTimes(1);
    expect(releaseSimulationSquad).toHaveBeenCalledWith(squad);
  });

  it("should correctly handle member addition", () => {
    const squad: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(() => second);

    jest.spyOn(squad.storyManager, "registerObject").mockImplementation(jest.fn());

    expect(squad.addMember("test_section", X_VECTOR, 1000, 50)).toBe(first);
    expect(squad.npc_count()).toBe(1);
    expect(registry.simulator.create).toHaveBeenCalledWith("test_section", X_VECTOR, 1000, 50);
    expect(squad.storyManager.registerObject).toHaveBeenCalledWith(first.id);
    expect(registry.spawnedVertexes.length()).toBe(1);

    jest.spyOn(Y_VECTOR, "distance_to_sqr").mockImplementationOnce(() => Infinity);

    expect(squad.addMember("stalker_with_custom_data", Y_VECTOR, 1001, 51)).toBe(second);
    expect(squad.npc_count()).toBe(2);
    expect(registry.simulator.create).toHaveBeenCalledWith("stalker_with_custom_data", Y_VECTOR, 1001, 51);
    expect(squad.storyManager.registerObject).toHaveBeenCalledWith(second.id);
    expect(registry.spawnedVertexes.length()).toBe(1);
  });

  it("should correctly update sympathy", () => {
    const squad: MockSquad = MockSquad.mock();

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();
    const third: ServerHumanObject = MockAlifeHumanStalker.mock();
    const thirdGameObject: GameObject = MockGameObject.mock({ id: third.id });

    registerObject(thirdGameObject);

    squad.mockAddMember(first);
    squad.mockAddMember(second);
    squad.mockAddMember(third);

    expect(squad.sympathy).toBeNull();

    squad.updateSympathy();

    expect(squad.squad_members).toHaveBeenCalledTimes(0);

    squad.sympathy = 0.75;
    squad.updateSympathy();

    expect(registry.goodwill.sympathy.get(first.id)).toBe(0.75);
    expect(registry.goodwill.sympathy.get(second.id)).toBe(0.75);
    expect(registry.goodwill.sympathy.get(third.id)).toBeNull();

    expect(thirdGameObject.set_sympathy).toHaveBeenCalledWith(0.75);
  });

  it("isReachedBySimulationObject should check simulation condition", () => {
    const target: MockSquad = MockSquad.mock();
    const chaser: MockSquad = MockSquad.mock();

    expect(target.isReachedBySimulationObject(chaser)).toBe(true);

    target.mockAddMember(MockAlifeHumanStalker.mock());

    expect(target.isReachedBySimulationObject(chaser)).toBe(false);
  });

  it("getSimulationTask should create smart terrain task wrapper", () => {
    const squad: MockSquad = MockSquad.mock();

    expect(squad.getSimulationTask()).toEqual(
      new CALifeSmartTerrainTask(squad.m_game_vertex_id, squad.m_level_vertex_id)
    );
    expect(squad.getSimulationTask()).not.toEqual(new CALifeSmartTerrainTask(1, 2));
  });

  it("onSimulationTargetDeselected should be empty and non-throwable", () => {
    const squad: MockSquad = MockSquad.mock();

    expect(() => squad.onSimulationTargetDeselected(MockSquad.mock())).not.toThrow();
  });

  it("onSimulationTargetSelected should reset chasing squad", () => {
    const squad: MockSquad = MockSquad.mock();
    const chaser: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    chaser.mockAddMember(first);
    chaser.mockAddMember(second);

    jest.spyOn(chaser, "setLocationTypes").mockImplementation(jest.fn());

    registry.offlineObjects.set(first.id, { levelVertexId: 1000, activeSection: "test" });

    squad.onSimulationTargetSelected(chaser);

    expect(chaser.setLocationTypes).toHaveBeenCalled();
    expect(assignSimulationSquadToTerrain).toHaveBeenCalledWith(chaser, null);
    expect(registry.offlineObjects.length()).toBe(1);
    expect(registry.offlineObjects.get(first.id)).toEqual({ levelVertexId: null, activeSection: null });
  });
});
