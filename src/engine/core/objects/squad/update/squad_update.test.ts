import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { cond, move } from "xray16";

import { registerSimulationObject, registerSimulator } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { SquadReachTargetAction } from "@/engine/core/objects/squad/action";
import { updateMonsterSquadAction } from "@/engine/core/objects/squad/update/squad_update";
import { scriptCaptureMonster, scriptCommandMonster } from "@/engine/core/utils/scheme";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme");

describe("updateMonsterSquadAction util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    resetFunctionMock(scriptCaptureMonster);
    resetFunctionMock(scriptCommandMonster);
  });

  it("should correctly update squad reach target as commander", () => {
    const object: GameObject = MockGameObject.mock();
    const target: Squad = MockSquad.mock();
    const squad: Squad = MockSquad.mock();

    squad.assignedTargetId = target.id;
    squad.currentAction = new SquadReachTargetAction(squad);

    jest.spyOn(squad, "commander_id").mockImplementation(() => object.id());
    jest.spyOn(target, "isSimulationAvailable").mockImplementation(() => true);

    registerSimulationObject(target);
    updateMonsterSquadAction(object, squad);

    expect(scriptCaptureMonster).toHaveBeenCalledWith(object, true);
    expect(scriptCommandMonster).toHaveBeenCalledWith(
      object,
      new move(move.walk_with_leader, target.position),
      new cond(cond.move_end)
    );
  });

  it("should correctly update squad reach target as squad participant", () => {
    const object: GameObject = MockGameObject.mock();
    const commander: GameObject = MockGameObject.mock();
    const target: Squad = MockSquad.mock();
    const squad: Squad = MockSquad.mock();
    const serverCommander: ServerHumanObject = MockAlifeHumanStalker.mock({ id: commander.id() });

    squad.assignedTargetId = target.id;
    squad.currentAction = new SquadReachTargetAction(squad);

    jest.spyOn(squad, "commander_id").mockImplementation(() => commander.id());
    jest.spyOn(target, "isSimulationAvailable").mockImplementation(() => true);
    jest.spyOn(serverCommander.position, "distance_to_sqr").mockImplementation(() => 100);

    registerSimulationObject(target);
    updateMonsterSquadAction(object, squad);

    expect(scriptCaptureMonster).toHaveBeenCalledWith(object, true);
    expect(scriptCommandMonster).toHaveBeenCalledWith(
      object,
      new move(move.walk_with_leader, target.position),
      new cond(cond.move_end)
    );
  });

  it("should correctly update squad reach target as squad participant", () => {
    const object: GameObject = MockGameObject.mock();
    const commander: GameObject = MockGameObject.mock();
    const target: Squad = MockSquad.mock();
    const squad: Squad = MockSquad.mock();
    const serverCommander: ServerHumanObject = MockAlifeHumanStalker.mock({ id: commander.id() });

    squad.assignedTargetId = target.id;
    squad.currentAction = new SquadReachTargetAction(squad);

    jest.spyOn(squad, "commander_id").mockImplementation(() => commander.id());
    jest.spyOn(target, "isSimulationAvailable").mockImplementation(() => true);
    jest.spyOn(serverCommander.position, "distance_to_sqr").mockImplementation(() => 101);

    registerSimulationObject(target);
    updateMonsterSquadAction(object, squad);

    expect(scriptCaptureMonster).toHaveBeenCalledWith(object, true);
    expect(scriptCommandMonster).toHaveBeenCalledWith(
      object,
      new move(move.run_with_leader, target.position),
      new cond(cond.move_end)
    );
  });

  it("should correctly update squad without action", () => {
    const object: GameObject = MockGameObject.mock();
    const squad: Squad = MockSquad.mock();

    expect(() => updateMonsterSquadAction(object, squad)).not.toThrow();
  });
});
