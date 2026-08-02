import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { squadSections } from "@/engine/constants/squad_sections";
import { zoneNames } from "@/engine/constants/zone_names";
import { registerSimulator, registerZone } from "@/engine/core/database";
import { callXrCondition, MockSquad } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/zat_b29_rivals_dialog_precond");
});

describe("zat_b29_rivals_dialog_precond", () => {
  it("should require a rival squad inside a target zone", () => {
    const object: GameObject = MockGameObject.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const squad: MockSquad = MockSquad.mock();
    const zone: GameObject = MockGameObject.mock({ name: zoneNames.zat_b29_sr_1 });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(member);
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(member);
    jest.spyOn(squad, "section_name").mockReturnValue(squadSections.zat_b29_stalker_rival_default_1_squad);
    registerZone(zone);
    jest.spyOn(zone, "inside").mockReturnValue(true);

    expect(callXrCondition("zat_b29_rivals_dialog_precond", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(zone, "inside").mockReturnValue(false);
    expect(callXrCondition("zat_b29_rivals_dialog_precond", MockGameObject.mockActor(), object)).toBe(false);
  });
});
