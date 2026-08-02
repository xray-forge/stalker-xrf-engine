import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { callXrCondition, MockSquad } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_squad_commander");
});

describe("is_squad_commander", () => {
  it("should recognize the squad commander and reject other members", () => {
    const squad: MockSquad = MockSquad.mock();
    const commander: ServerHumanObject = MockAlifeHumanStalker.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const commanderObject: GameObject = MockGameObject.mock({ id: commander.id });
    const memberObject: GameObject = MockGameObject.mock({ id: member.id });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(squad);
    MockAlifeSimulator.addToRegistry(commander);
    MockAlifeSimulator.addToRegistry(member);
    squad.mockAddMember(commander);
    squad.mockAddMember(member);
    jest.spyOn(squad, "commander_id").mockReturnValue(commander.id);

    expect(callXrCondition("is_squad_commander", MockGameObject.mockActor(), commanderObject)).toBe(true);
    expect(callXrCondition("is_squad_commander", MockGameObject.mockActor(), memberObject)).toBe(false);
  });
});
