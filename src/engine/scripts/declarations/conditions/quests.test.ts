import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject, ServerHumanObject, ServerObject } from "xray16/alias";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { storyNames } from "@/engine/constants/story_names";
import { AnomalyZoneBinder } from "@/engine/core/binders/zones";
import {
  registerAnomalyZone,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registerZone,
  registry,
} from "@/engine/core/database";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";
import { callXrCondition, mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs_zaton");
  require("@/engine/scripts/declarations/conditions/quests");
});

beforeEach(() => {
  resetRegistry();
});

describe("zat_b29_anomaly_has_af", () => {
  it("should check anomaly and artefact", () => {
    expect(callXrCondition("zat_b29_anomaly_has_af", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const object: GameObject = MockGameObject.mock();
    const anomaly: AnomalyZoneBinder = new AnomalyZoneBinder(object);
    const artefact: ServerObject = MockAlifeObject.mock();

    mockRegisteredActor();
    registerAnomalyZone(anomaly);
    registerSimulator();

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(false);

    giveInfoPortion(zatB29InfopBringTable.get(23));

    anomaly.artefactPathsByArtefactId.set(artefact.id, "test");

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(false);

    anomaly.spawnedArtefactsCount = 10;

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(false);

    jest.spyOn(artefact, "section_name").mockImplementation(() => zatB29AfTable.get(23));

    expect(
      callXrCondition(
        "zat_b29_anomaly_has_af",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        anomaly.object.name()
      )
    ).toBe(true);
  });

  it("should only check artefacts spawned in the provided anomaly zone", () => {
    mockRegisteredActor();
    registerSimulator();

    const first: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock({ name: "zat_b53_anomal_zone" }));
    const second: AnomalyZoneBinder = new AnomalyZoneBinder(MockGameObject.mock({ name: "zat_b55_anomal_zone" }));

    registerAnomalyZone(first);
    registerAnomalyZone(second);

    first.spawnedArtefactsCount = 1;
    second.spawnedArtefactsCount = 1;

    const artefact: ServerObject = MockAlifeObject.mock();

    jest.spyOn(artefact, "section_name").mockImplementation(() => zatB29AfTable.get(23));
    giveInfoPortion(zatB29InfopBringTable.get(23));

    // Artefact is spawned in the second zone only, while the global registry knows about it too.
    second.artefactPathsByArtefactId.set(artefact.id, "test");
    registry.artefacts.ways.set(artefact.id, "test");

    expect(
      callXrCondition("zat_b29_anomaly_has_af", MockGameObject.mockActor(), MockGameObject.mock(), first.object.name())
    ).toBe(false);
    expect(hasInfoPortion(first.object.name() as TInfoPortion)).toBe(false);

    expect(
      callXrCondition("zat_b29_anomaly_has_af", MockGameObject.mockActor(), MockGameObject.mock(), second.object.name())
    ).toBe(true);
    expect(hasInfoPortion(second.object.name() as TInfoPortion)).toBe(true);
  });
});

describe("jup_b221_who_will_start", () => {
  it("should report and choose available faction themes", () => {
    mockRegisteredActor();

    expect(() => callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "No such parameters in function 'jup_b221_who_will_start'"
    );
    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "ability")
    ).toBe(false);

    giveInfoPortion(infoPortions.jup_b25_freedom_flint_gone);

    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "ability")
    ).toBe(true);
    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "choose")
    ).toBe(true);

    giveInfoPortion("jup_b221_duty_main_1_played");

    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "ability")
    ).toBe(false);
  });
});

describe("pas_b400_actor_far_forward", () => {
  it("should require the actor and every squad member to be far from the escort", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const objectServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const memberObject: GameObject = MockGameObject.mock({ id: member.id });
    const squad: MockSquad = MockSquad.mock();
    const forward: GameObject = MockGameObject.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(objectServer);
    MockAlifeSimulator.addToRegistry(member);
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(objectServer);
    squad.mockAddMember(member);
    registerObject(object);
    registerObject(memberObject);
    registerStoryLink(forward.id(), "pas_b400_fwd");
    registerObject(forward);
    jest.spyOn(forward.position(), "distance_to_sqr").mockReturnValue(1);
    jest.spyOn(object.position(), "distance_to_sqr").mockReturnValue(70 * 70);
    jest.spyOn(objectServer.position, "distance_to_sqr").mockReturnValue(70 * 70);
    jest.spyOn(member.position, "distance_to_sqr").mockReturnValue(70 * 70);

    expect(callXrCondition("pas_b400_actor_far_forward", actorGameObject, object)).toBe(true);

    jest.spyOn(object.position(), "distance_to_sqr").mockReturnValue(70 * 70 - 1);
    expect(callXrCondition("pas_b400_actor_far_forward", actorGameObject, object)).toBe(false);
  });
});

describe("pas_b400_actor_far_backward", () => {
  it("should require the actor and every squad member to be far from the escort", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const objectServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const member: ServerHumanObject = MockAlifeHumanStalker.mock();
    const memberObject: GameObject = MockGameObject.mock({ id: member.id });
    const squad: MockSquad = MockSquad.mock();
    const backward: GameObject = MockGameObject.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(objectServer);
    MockAlifeSimulator.addToRegistry(member);
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(objectServer);
    squad.mockAddMember(member);
    registerObject(object);
    registerObject(memberObject);
    registerStoryLink(backward.id(), "pas_b400_bwd");
    registerObject(backward);
    jest.spyOn(backward.position(), "distance_to_sqr").mockReturnValue(1);
    jest.spyOn(object.position(), "distance_to_sqr").mockReturnValue(70 * 70);
    jest.spyOn(objectServer.position, "distance_to_sqr").mockReturnValue(70 * 70);
    jest.spyOn(member.position, "distance_to_sqr").mockReturnValue(70 * 70);

    expect(callXrCondition("pas_b400_actor_far_backward", actorGameObject, object)).toBe(true);

    jest.spyOn(member.position, "distance_to_sqr").mockReturnValue(70 * 70 - 1);
    expect(callXrCondition("pas_b400_actor_far_backward", actorGameObject, object)).toBe(false);
  });
});

describe("pri_a28_actor_is_far", () => {
  it("should check actor state", () => {
    expect(() => callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Unexpected actor distance check - no squad existing."
    );

    const squad: MockSquad = MockSquad.createRegistered();
    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerSimulator();
    registerStoryLink(squad.id, "pri_a16_military_squad");

    expect(callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);

    squad.mockAddMember(first);
    squad.mockAddMember(second);

    jest.spyOn(first.position, "distance_to_sqr").mockImplementation(() => 150 * 150 - 1);
    jest.spyOn(second.position, "distance_to_sqr").mockImplementation(() => 150 * 150 - 1);

    expect(callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    jest.spyOn(first.position, "distance_to_sqr").mockImplementation(() => 150 * 150 + 1);
    jest.spyOn(second.position, "distance_to_sqr").mockImplementation(() => 150 * 150 + 1);

    expect(callXrCondition("pri_a28_actor_is_far", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
  });
});

describe("jup_b25_senya_spawn_condition", () => {
  it("should require quest progress and the Soroka search", () => {
    mockRegisteredActor();

    expect(callXrCondition("jup_b25_senya_spawn_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    giveInfoPortion(infoPortions.jup_b16_oasis_found);
    expect(callXrCondition("jup_b25_senya_spawn_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    giveInfoPortion(infoPortions.zat_b106_search_soroka);
    expect(callXrCondition("jup_b25_senya_spawn_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );
  });
});

describe("jup_b25_flint_gone_condition", () => {
  it("should check flint gone condition", () => {
    mockRegisteredActor();

    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    giveInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    disableInfoPortion(infoPortions.jup_b25_flint_blame_done_to_duty);
    giveInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    disableInfoPortion(infoPortions.jup_b25_flint_blame_done_to_freedom);
    giveInfoPortion(infoPortions.zat_b106_found_soroka_done);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    disableInfoPortion(infoPortions.zat_b106_found_soroka_done);
    expect(callXrCondition("jup_b25_flint_gone_condition", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );
  });
});

describe("zat_b103_actor_has_needed_food", () => {
  it("should accept delegated inventory checks and completed tasks", () => {
    const { actorGameObject: actor } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const hasNeededFood = jest.fn<() => boolean>().mockReturnValue(false);

    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food = hasNeededFood;

    expect(callXrCondition("zat_b103_actor_has_needed_food", actor, object)).toBe(false);
    expect(hasNeededFood).toHaveBeenCalledWith(actor, object);

    giveInfoPortion(infoPortions.zat_b103_merc_task_done);
    expect(callXrCondition("zat_b103_actor_has_needed_food", actor, object)).toBe(true);

    hasNeededFood.mockReturnValue(true);
    disableInfoPortion(infoPortions.zat_b103_merc_task_done);
    expect(callXrCondition("zat_b103_actor_has_needed_food", actor, object)).toBe(true);
  });
});

describe("zat_b29_rivals_dialog_precond", () => {
  it("should require a rival squad inside a target zone", () => {
    const object: GameObject = MockGameObject.mock();
    const member: ServerHumanObject = MockAlifeHumanStalker.mock({ id: object.id() });
    const squad: MockSquad = MockSquad.mock();
    const zone: GameObject = MockGameObject.mock({ name: "zat_b29_sr_1" });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(member);
    MockAlifeSimulator.addToRegistry(squad);
    squad.mockAddMember(member);
    jest.spyOn(squad, "section_name").mockReturnValue("zat_b29_stalker_rival_default_1_squad");
    registerZone(zone);
    jest.spyOn(zone, "inside").mockReturnValue(true);

    expect(callXrCondition("zat_b29_rivals_dialog_precond", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(zone, "inside").mockReturnValue(false);
    expect(callXrCondition("zat_b29_rivals_dialog_precond", MockGameObject.mockActor(), object)).toBe(false);
  });
});

describe("jup_b202_actor_treasure_not_in_steal", () => {
  it("should check treasure state", () => {
    mockRegisteredActor();

    expect(
      callXrCondition("jup_b202_actor_treasure_not_in_steal", MockGameObject.mockActor(), MockGameObject.mock())
    ).toBe(true);

    giveInfoPortion(infoPortions.jup_b52_actor_items_can_be_stolen);

    expect(
      callXrCondition("jup_b202_actor_treasure_not_in_steal", MockGameObject.mockActor(), MockGameObject.mock())
    ).toBe(false);

    giveInfoPortion(infoPortions.jup_b202_actor_items_returned);

    expect(
      callXrCondition("jup_b202_actor_treasure_not_in_steal", MockGameObject.mockActor(), MockGameObject.mock())
    ).toBe(true);
  });
});

describe("jup_b47_npc_online", () => {
  it("should check npc online state", () => {
    expect(callXrCondition("jup_b47_npc_online", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(
      false
    );

    const object: GameObject = MockGameObject.mock();

    registerSimulator();
    registerObject(object);
    registerStoryLink(object.id(), "test-sid");

    expect(callXrCondition("jup_b47_npc_online", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(
      false
    );

    MockAlifeHumanStalker.mock({ id: object.id() });

    expect(callXrCondition("jup_b47_npc_online", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(
      true
    );
  });
});

describe("zat_b7_is_night", () => {
  it("should check day state", () => {
    expect(callXrCondition("zat_b7_is_night", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("zat_b7_is_night", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 23);
    expect(callXrCondition("zat_b7_is_night", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 4);
    expect(callXrCondition("zat_b7_is_night", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 22);
    expect(callXrCondition("zat_b7_is_night", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 5);
    expect(callXrCondition("zat_b7_is_night", actorGameObject, MockGameObject.mock())).toBe(false);
  });
});

describe("zat_b7_is_late_attack_time", () => {
  it("should check day state", () => {
    expect(callXrCondition("zat_b7_is_late_attack_time", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 23);
    expect(callXrCondition("zat_b7_is_late_attack_time", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 8);
    expect(callXrCondition("zat_b7_is_late_attack_time", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 22);
    expect(callXrCondition("zat_b7_is_late_attack_time", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 10);
    expect(callXrCondition("zat_b7_is_late_attack_time", actorGameObject, MockGameObject.mock())).toBe(false);
  });
});

describe("jup_b202_inventory_box_empty", () => {
  it("should check box state", () => {
    expect(() => {
      callXrCondition("jup_b202_inventory_box_empty", MockGameObject.mockActor(), MockGameObject.mock());
    }).toThrow();

    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    registerStoryLink(object.id(), storyNames.jup_b202_actor_treasure);

    jest.spyOn(object, "is_inv_box_empty").mockImplementation(() => true);
    expect(callXrCondition("jup_b202_inventory_box_empty", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      true
    );

    jest.spyOn(object, "is_inv_box_empty").mockImplementation(() => false);
    expect(callXrCondition("jup_b202_inventory_box_empty", MockGameObject.mockActor(), MockGameObject.mock())).toBe(
      false
    );
  });
});

describe("jup_b16_is_zone_active", () => {
  it("should check zone", () => {
    expect(callXrCondition("jup_b16_is_zone_active", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const zone: GameObject = MockGameObject.mock();
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("jup_b16_is_zone_active", actorGameObject, zone)).toBe(false);

    giveInfoPortion(zone.name());
    expect(callXrCondition("jup_b16_is_zone_active", actorGameObject, zone)).toBe(true);
  });
});

describe("is_jup_a12_mercs_time", () => {
  it("should check day state", () => {
    expect(callXrCondition("is_jup_a12_mercs_time", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 0);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 1);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 4);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 5);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(false);
  });
});
