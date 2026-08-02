import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { ESquadActionType } from "@/engine/core/objects/squad";
import { SquadReachTargetAction, SquadStayOnTargetAction } from "@/engine/core/objects/squad/action";
import { callXrCondition, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/squad_curr_action");
});

describe("squad_curr_action", () => {
  it("should check squad action", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const squad: MockSquad = MockSquad.createRegistered();

    squad.mockAddMember(serverObject);

    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.REACH_TARGET)
    ).toBe(false);

    squad.currentAction = new SquadReachTargetAction(squad);

    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.REACH_TARGET)
    ).toBe(true);

    squad.currentAction = new SquadStayOnTargetAction(squad);

    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.REACH_TARGET)
    ).toBe(false);
    expect(
      callXrCondition("squad_curr_action", MockGameObject.mockActor(), object, ESquadActionType.STAY_ON_TARGET)
    ).toBe(true);
  });
});
