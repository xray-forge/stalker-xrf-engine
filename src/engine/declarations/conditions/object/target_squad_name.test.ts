import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator } from "@/engine/core/database";
import { callXrCondition, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/target_squad_name");
});

describe("target_squad_name", () => {
  it("should match the object's squad section or own section", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();
    const squad: MockSquad = MockSquad.mock();

    MockAlifeSimulator.addToRegistry(squad);
    object.group_id = squad.id;

    expect(
      callXrCondition("target_squad_name", MockGameObject.mockActor(), object as unknown as GameObject, "squad")
    ).toBe(true);
    expect(
      callXrCondition("target_squad_name", MockGameObject.mockActor(), object as unknown as GameObject, "merc")
    ).toBe(false);

    const standalone = MockAlifeObject.mock();

    jest.spyOn(standalone, "section_name").mockReturnValue("test_stalker");

    expect(
      callXrCondition(
        "target_squad_name",
        MockGameObject.mockActor(),
        standalone as unknown as GameObject,
        "test_stalker"
      )
    ).toBe(true);
  });
});
