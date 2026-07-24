import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectInjured, isStalkerAlive } from "@/engine/core/utils/object";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { callBinding, checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/game_save");
jest.mock("@/engine/core/utils/object");
jest.mock("@/engine/core/utils/position");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs", name);
}

beforeAll(() => {
  require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_quest");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();

  resetFunctionMock(createGameAutoSave);
  resetFunctionMock(isObjectInjured);
  resetFunctionMock(isObjectInSmartTerrain);
  resetFunctionMock(isStalkerAlive);
});

describe("quest_dialog_heli_precond", () => {
  it("should hide the dialog after every helicopter was searched or the finale was completed", () => {
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b9_heli_1_searched);
    giveInfoPortion(infoPortions.zat_b100_heli_2_searched);
    giveInfoPortion(infoPortions.zat_b28_heli_3_searched);
    giveInfoPortion(infoPortions.jup_b8_heli_4_searched);
    giveInfoPortion(infoPortions.zat_b101_heli_5_searched);
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(false);

    resetRegistry();
    mockRegisteredActor();

    giveInfoPortion(infoPortions.pri_b305_actor_wondered_done);
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(false);
  });
});

describe("quest_dialog_military_precond", () => {
  it("should be available only while exactly one military clue is known", () => {
    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(false);

    giveInfoPortion(infoPortions.zat_b28_heli_3_searched);
    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b9_blackbox_decrypted);
    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(false);
  });
});

describe("quest_dialog_squad_precond", () => {
  it("should be available until every squad member has been hired", () => {
    expect(callDialogsBinding("quest_dialog_squad_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b218_monolith_hired);
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    giveInfoPortion(infoPortions.jup_a10_vano_agree_go_und);
    expect(callDialogsBinding("quest_dialog_squad_precond")).toBe(false);
  });
});

describe("quest_dialog_toolkits_precond", () => {
  it("should be available while either mechanic toolkit task is active", () => {
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(false);

    giveInfoPortion(infoPortions.zat_a2_mechanic_toolkit_search);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(true);

    giveInfoPortion(infoPortions.zat_b3_task_end);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(false);

    giveInfoPortion(infoPortions.jup_b217_tech_instruments_start);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(true);
  });
});

describe("monolith_leader_is_alive", () => {
  it("should check the leader matching the squad faction", () => {
    replaceFunctionMock(isStalkerAlive, (name: string) => name === "jup_b4_monolith_squad_leader_monolith_skin");
    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(true);

    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, (name: string) => name === "jup_b4_monolith_squad_leader_freedom_skin");
    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(true);

    resetRegistry();
    mockRegisteredActor();

    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(false);
  });
});

describe("monolith_leader_dead_or_hired", () => {
  it("should accept a hired squad or a dead current leader", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(true);

    resetRegistry();
    mockRegisteredActor();

    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(true);
  });
});

describe("monolith_leader_dead_or_dolg", () => {
  it("should accept the Freedom faction regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);
  });
});

describe("squad_not_in_smart_b101", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b101");
  });
});

describe("squad_not_in_smart_b103", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b103");
  });
});

describe("squad_not_in_smart_b104", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b104");
  });
});

describe("squad_not_in_smart_b213", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b213");
  });
});

describe("squad_not_in_smart_b214", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b214");
  });
});

describe("squad_not_in_smart_b304", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b304");
  });
});

describe("squad_not_in_smart_b303", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b303");
  });
});

describe("squad_not_in_smart_b40", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b40");
  });
});

describe("squad_not_in_smart_b18", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b18");
  });
});

describe("squad_not_in_smart_b6", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b6");
  });
});

describe("squad_not_in_smart_b205", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b205");
  });
});

describe("squad_not_in_smart_b47", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_not_in_smart_b47");
  });
});

describe("squad_in_smart_zat_base", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_in_smart_zat_base");
  });
});

describe("squad_in_smart_jup_b25", () => {
  it("should be registered", () => {
    checkDialogsBinding("squad_in_smart_jup_b25");
  });
});

describe("spartak_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("spartak_is_alive");
  });
});

describe("tesak_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("tesak_is_alive");
  });
});

describe("gonta_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("gonta_is_alive");
  });
});

describe("mityay_is_alive", () => {
  it("should be registered", () => {
    checkDialogsBinding("mityay_is_alive");
  });
});

describe("dolg_can_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("dolg_can_work_for_sci");
  });
});

describe("dolg_can_not_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("dolg_can_not_work_for_sci");
  });
});

describe("freedom_can_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("freedom_can_work_for_sci");
  });
});

describe("freedom_can_not_work_for_sci", () => {
  it("should be registered", () => {
    checkDialogsBinding("freedom_can_not_work_for_sci");
  });
});

describe("monolith_leader_dead_or_freedom", () => {
  it("should be registered", () => {
    checkDialogsBinding("monolith_leader_dead_or_freedom");
  });
});

describe("medic_magic_potion", () => {
  it("should be registered", () => {
    checkDialogsBinding("medic_magic_potion");
  });
});

describe("actor_needs_bless", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_needs_bless");
  });
});

describe("actor_is_damn_healthy", () => {
  it("should be registered", () => {
    checkDialogsBinding("actor_is_damn_healthy");
  });
});

describe("leave_zone_save", () => {
  it("should be registered", () => {
    checkDialogsBinding("leave_zone_save");
  });
});

describe("save_uni_travel_zat_to_jup", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_zat_to_jup");
  });
});

describe("save_uni_travel_zat_to_pri", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_zat_to_pri");
  });
});

describe("save_uni_travel_jup_to_zat", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_jup_to_zat");
  });
});

describe("save_uni_travel_jup_to_pri", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_jup_to_pri");
  });
});

describe("save_uni_travel_pri_to_zat", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_pri_to_zat");
  });
});

describe("save_uni_travel_pri_to_jup", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_uni_travel_pri_to_jup");
  });
});

describe("save_jup_b218_travel_jup_to_pas", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b218_travel_jup_to_pas");
  });
});

describe("save_pri_a17_hospital_start", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_pri_a17_hospital_start");
  });
});

describe("save_jup_a10_gonna_return_debt", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_a10_gonna_return_debt");
  });
});

describe("save_jup_b6_arrived_to_fen", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b6_arrived_to_fen");
  });
});

describe("save_jup_b6_arrived_to_ash_heap", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b6_arrived_to_ash_heap");
  });
});

describe("save_jup_b19_arrived_to_kopachy", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_jup_b19_arrived_to_kopachy");
  });
});

describe("save_zat_b106_arrived_to_chimera_lair", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_zat_b106_arrived_to_chimera_lair");
  });
});

describe("save_zat_b5_met_with_others", () => {
  it("should be registered", () => {
    checkDialogsBinding("save_zat_b5_met_with_others");
  });
});

describe("smart terrain dialog predicates", () => {
  it("should check the expected terrain for every squad dialog", () => {
    const { actorGameObject } = mockRegisteredActor();
    const npc: GameObject = MockGameObject.mock();
    const notInSmartTerrain: Array<[TName, string]> = [
      ["squad_not_in_smart_b101", "zat_b101"],
      ["squad_not_in_smart_b103", "zat_b103"],
      ["squad_not_in_smart_b104", "zat_b104"],
      ["squad_not_in_smart_b213", "jup_b213"],
      ["squad_not_in_smart_b214", "jup_b214"],
      ["squad_not_in_smart_b304", "pri_b304_monsters_smart_terrain"],
      ["squad_not_in_smart_b303", "pri_b303"],
      ["squad_not_in_smart_b40", "zat_b40_smart_terrain"],
      ["squad_not_in_smart_b18", "zat_b18"],
      ["squad_not_in_smart_b6", "jup_b41"],
      ["squad_not_in_smart_b205", "jup_b205_smart_terrain"],
      ["squad_not_in_smart_b47", "jup_b47"],
    ];

    replaceFunctionMock(isObjectInSmartTerrain, () => false);

    for (const [name, terrain] of notInSmartTerrain) {
      expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(true);
      expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);
    }

    replaceFunctionMock(isObjectInSmartTerrain, () => true);
    expect(callDialogsBinding("squad_in_smart_zat_base", [actorGameObject, npc])).toBe(true);
    expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, "zat_stalker_base_smart");
    expect(callDialogsBinding("squad_in_smart_jup_b25", [actorGameObject, npc])).toBe(true);
    expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, "jup_a6");
  });
});

describe("named stalker dialog predicates", () => {
  it("should query the correct story object", () => {
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("spartak_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("zat_b7_stalker_victim_1");
    expect(callDialogsBinding("tesak_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("zat_b103_lost_merc_leader");
    expect(callDialogsBinding("gonta_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("zat_b103_lost_merc_leader");
    expect(callDialogsBinding("mityay_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_a12_stalker_assaulter");
  });
});

describe("scientist bunker dialog predicates", () => {
  it("should make the Duty and Freedom conditions complementary", () => {
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(true);
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(false);
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(true);
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(false);

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(false);
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(true);
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(false);
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(true);
  });
});

describe("monolith_leader_dead_or_freedom", () => {
  it("should accept a dead leader, a hired squad, or the Duty faction", () => {
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(false);

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);

    resetRegistry();
    mockRegisteredActor();

    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);
  });
});

describe("medic_magic_potion", () => {
  it("should fully restore the actor", () => {
    const { actorGameObject } = mockRegisteredActor({ bleeding: 0.5, health: 0.4, power: 0.3, radiation: 0.2 });

    callDialogsBinding("medic_magic_potion");

    expect(actorGameObject.health).toBe(1);
    expect(actorGameObject.power).toBe(1);
    expect(actorGameObject.radiation).toBe(0);
    expect(actorGameObject.bleeding).toBe(0);
  });
});

describe("actor injury dialog predicates", () => {
  it("should expose complementary injured and healthy conditions", () => {
    replaceFunctionMock(isObjectInjured, () => true);
    expect(callDialogsBinding("actor_needs_bless")).toBe(true);
    expect(callDialogsBinding("actor_is_damn_healthy")).toBe(false);

    replaceFunctionMock(isObjectInjured, () => false);
    expect(callDialogsBinding("actor_needs_bless")).toBe(false);
    expect(callDialogsBinding("actor_is_damn_healthy")).toBe(true);
  });
});

describe("quest autosaves", () => {
  it("should create the expected save for each dialog action", () => {
    const saves: Array<[TName, string]> = [
      ["leave_zone_save", "st_save_uni_zone_to_reality"],
      ["save_uni_travel_zat_to_jup", "st_save_uni_travel_zat_to_jup"],
      ["save_uni_travel_zat_to_pri", "st_save_uni_travel_zat_to_pri"],
      ["save_uni_travel_jup_to_zat", "st_save_uni_travel_jup_to_zat"],
      ["save_uni_travel_jup_to_pri", "st_save_uni_travel_jup_to_pri"],
      ["save_uni_travel_pri_to_zat", "st_save_uni_travel_pri_to_zat"],
      ["save_uni_travel_pri_to_jup", "st_save_uni_travel_pri_to_jup"],
      ["save_jup_b218_travel_jup_to_pas", "st_save_jup_b218_travel_jup_to_pas"],
      ["save_pri_a17_hospital_start", "st_save_pri_a17_hospital_start"],
      ["save_jup_b6_arrived_to_fen", "st_save_jup_b6_arrived_to_fen"],
      ["save_jup_b6_arrived_to_ash_heap", "st_save_jup_b6_arrived_to_ash_heap"],
      ["save_jup_b19_arrived_to_kopachy", "st_save_jup_b19_arrived_to_kopachy"],
      ["save_zat_b106_arrived_to_chimera_lair", "st_save_zat_b106_arrived_to_chimera_lair"],
      ["save_zat_b5_met_with_others", "st_save_zat_b5_met_with_others"],
    ];

    for (const [name, saveName] of saves) {
      callDialogsBinding(name);
      expect(createGameAutoSave).toHaveBeenLastCalledWith(saveName);
    }
  });
});

describe("save_jup_a10_gonna_return_debt", () => {
  it("should save only once", () => {
    callDialogsBinding("save_jup_a10_gonna_return_debt");
    callDialogsBinding("save_jup_a10_gonna_return_debt");

    expect(createGameAutoSave).toHaveBeenCalledTimes(1);
    expect(createGameAutoSave).toHaveBeenCalledWith("st_save_jup_a10_gonna_return_debt");
  });
});
