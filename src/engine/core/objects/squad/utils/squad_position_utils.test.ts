import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  IRegistryOfflineState,
  registerObject,
  registerOfflineObject,
  resetStalkerState,
} from "@/engine/core/database";
import { setSquadPosition } from "@/engine/core/objects/squad/utils/squad_position_utils";
import { createVector } from "@/engine/core/utils/vector";
import { GameObject, ServerHumanObject, Vector } from "@/engine/lib/types";
import { MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockGameObject, mockLevelInterface } from "@/fixtures/xray";

jest.mock("@/engine/core/database/stalker", () => ({
  resetStalkerState: jest.fn(),
}));

describe("setSquadPosition util", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(resetStalkerState);

    jest.spyOn(mockLevelInterface, "vertex_id").mockImplementation(() => 455);
  });

  it("should correctly change current position of the squad when offline", () => {
    const squad: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();
    const newPosition: Vector = createVector(1, 2, 3);

    squad.mockSetOnline(false);
    squad.mockAddMember(first);
    squad.mockAddMember(second);

    jest.spyOn(squad, "force_change_position").mockImplementation(jest.fn());

    const firstOfflineState: IRegistryOfflineState = registerOfflineObject(first.id);
    const secondOfflineState: IRegistryOfflineState = registerOfflineObject(second.id);

    setSquadPosition(squad, newPosition);

    expect(squad.force_change_position).toHaveBeenCalledWith(newPosition);
    expect(resetStalkerState).not.toHaveBeenCalled();
    expect(first.position).toBe(newPosition);
    expect(second.position).toBe(newPosition);
    expect(firstOfflineState.levelVertexId).toBe(455);
    expect(secondOfflineState.levelVertexId).toBe(455);
  });

  it("should correctly change current position of the squad when online", () => {
    const squad: MockSquad = MockSquad.mock();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();
    const newPosition: Vector = createVector(1, 2, 3);

    squad.mockSetOnline(true);
    squad.mockAddMember(first);
    squad.mockAddMember(second);

    jest.spyOn(squad, "force_change_position").mockImplementation(jest.fn());

    const firstGameObject: GameObject = MockGameObject.mock({ id: first.id });
    const secondGameObject: GameObject = MockGameObject.mock({ id: second.id });

    const firstOfflineState: IRegistryOfflineState = registerOfflineObject(firstGameObject.id());
    const secondOfflineState: IRegistryOfflineState = registerOfflineObject(secondGameObject.id());

    registerObject(secondGameObject);
    registerObject(firstGameObject);

    setSquadPosition(squad, newPosition);

    expect(squad.force_change_position).not.toHaveBeenCalled();
    expect(resetStalkerState).toHaveBeenCalledTimes(2);
    expect(resetStalkerState).toHaveBeenCalledWith(firstGameObject);
    expect(resetStalkerState).toHaveBeenCalledWith(secondGameObject);
    expect(firstGameObject.set_npc_position).toHaveBeenCalledWith(newPosition);
    expect(firstOfflineState.levelVertexId).toBe(455);
    expect(secondGameObject.set_npc_position).toHaveBeenCalledWith(newPosition);
    expect(secondOfflineState.levelVertexId).toBe(455);
  });
});
