import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, registerSimulator, updateSimulationObjectAvailability } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { SquadReachTargetAction } from "@/engine/core/objects/squad/action/SquadReachTargetAction";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { ServerHumanObject } from "@/engine/lib/types";
import { MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker } from "@/fixtures/xray";

describe("SquadReachTargetAction class", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize under simulation", () => {
    const manager: SimulationManager = getManager(SimulationManager);
    const squad: MockSquad = MockSquad.mock();
    const target: MockSquad = MockSquad.mock();
    const action: SquadReachTargetAction = new SquadReachTargetAction(squad);

    squad.assignedTargetId = target.id;

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    expect(action.squad).toBe(squad);
    expect(action.type).toBe(ESquadActionType.REACH_TARGET);

    jest.spyOn(target, "onSimulationTargetSelected").mockImplementation(jest.fn());
    jest.spyOn(manager, "setupObjectSquadAndGroup").mockImplementation(jest.fn());

    updateSimulationObjectAvailability(target);

    action.initialize(true);

    expect(target.onSimulationTargetSelected).toHaveBeenCalledTimes(1);
    expect(target.onSimulationTargetSelected).toHaveBeenCalledWith(squad);

    expect(manager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(2);
    expect(manager.setupObjectSquadAndGroup).toHaveBeenCalledWith(first);
    expect(manager.setupObjectSquadAndGroup).toHaveBeenCalledWith(second);
  });

  it("should correctly initialize without simulation", () => {
    const manager: SimulationManager = getManager(SimulationManager);
    const squad: MockSquad = MockSquad.mock();
    const target: MockSquad = MockSquad.mock();
    const action: SquadReachTargetAction = new SquadReachTargetAction(squad);

    squad.assignedTargetId = target.id;

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    expect(action.squad).toBe(squad);
    expect(action.type).toBe(ESquadActionType.REACH_TARGET);

    jest.spyOn(target, "onSimulationTargetSelected").mockImplementation(jest.fn());
    jest.spyOn(manager, "setupObjectSquadAndGroup").mockImplementation(jest.fn());

    action.initialize(false);

    expect(target.onSimulationTargetSelected).toHaveBeenCalledTimes(1);
    expect(target.onSimulationTargetSelected).toHaveBeenCalledWith(squad);

    expect(manager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(2);
    expect(manager.setupObjectSquadAndGroup).toHaveBeenCalledWith(first);
    expect(manager.setupObjectSquadAndGroup).toHaveBeenCalledWith(second);
  });

  it("should correctly finalize", () => {
    const squad: MockSquad = MockSquad.mock();
    const action: SquadReachTargetAction = new SquadReachTargetAction(squad);

    action.initialize(true);

    expect(() => action.finalize()).not.toThrow();
  });

  it("should correctly update without target", () => {
    const squad: MockSquad = MockSquad.mock();
    const action: SquadReachTargetAction = new SquadReachTargetAction(squad);

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    jest.spyOn(squad, "clearAssignedTarget").mockImplementation(jest.fn());

    action.initialize(true);
    expect(action.update(true)).toBe(true);

    expect(squad.clearAssignedTarget).toHaveBeenCalledTimes(1);
  });

  it("should correctly update under simulation", () => {
    const manager: SimulationManager = getManager(SimulationManager);
    const squad: MockSquad = MockSquad.mock();
    const target: MockSquad = MockSquad.mock();
    const action: SquadReachTargetAction = new SquadReachTargetAction(squad);

    squad.assignedTargetId = target.id;

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    expect(action.squad).toBe(squad);
    expect(action.type).toBe(ESquadActionType.REACH_TARGET);

    jest.spyOn(target, "onSimulationTargetSelected").mockImplementation(jest.fn());
    jest.spyOn(target, "onSimulationTargetDeselected").mockImplementation(jest.fn());
    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(jest.fn(() => false));
    jest.spyOn(manager, "setupObjectSquadAndGroup").mockImplementation(jest.fn());

    updateSimulationObjectAvailability(target);

    action.initialize(true);
    expect(action.update(true)).toBe(false);

    expect(target.isReachedBySimulationObject).toHaveBeenCalledTimes(1);
    expect(target.onSimulationTargetSelected).toHaveBeenCalledWith(squad);
    expect(target.onSimulationTargetDeselected).toHaveBeenCalledTimes(0);

    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(jest.fn(() => true));

    expect(action.update(true)).toBe(true);

    expect(target.isReachedBySimulationObject).toHaveBeenCalledTimes(2);
    expect(target.onSimulationTargetSelected).toHaveBeenCalledWith(squad);
    expect(target.onSimulationTargetDeselected).toHaveBeenCalledTimes(1);
    expect(target.onSimulationTargetDeselected).toHaveBeenCalledWith(squad);
  });

  it("should correctly update without simulation", () => {
    const manager: SimulationManager = getManager(SimulationManager);
    const squad: MockSquad = MockSquad.mock();
    const target: MockSquad = MockSquad.mock();
    const action: SquadReachTargetAction = new SquadReachTargetAction(squad);

    squad.assignedTargetId = target.id;

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    expect(action.squad).toBe(squad);
    expect(action.type).toBe(ESquadActionType.REACH_TARGET);

    jest.spyOn(target, "onSimulationTargetSelected").mockImplementation(jest.fn());
    jest.spyOn(target, "onSimulationTargetDeselected").mockImplementation(jest.fn());
    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(jest.fn(() => false));
    jest.spyOn(manager, "setupObjectSquadAndGroup").mockImplementation(jest.fn());

    action.initialize(false);

    expect(action.update(false)).toBe(false);

    expect(target.isReachedBySimulationObject).toHaveBeenCalledTimes(1);
    expect(target.onSimulationTargetSelected).toHaveBeenCalledWith(squad);
    expect(target.onSimulationTargetDeselected).toHaveBeenCalledTimes(0);

    jest.spyOn(target, "isReachedBySimulationObject").mockImplementation(jest.fn(() => true));

    expect(action.update(false)).toBe(true);

    expect(target.isReachedBySimulationObject).toHaveBeenCalledTimes(2);
    expect(target.onSimulationTargetSelected).toHaveBeenCalledWith(squad);
    expect(target.onSimulationTargetDeselected).toHaveBeenCalledTimes(1);
    expect(target.onSimulationTargetDeselected).toHaveBeenCalledWith(squad);
  });
});
