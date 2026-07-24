import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { registry } from "@/engine/core/database";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectInjured, isStalkerAlive } from "@/engine/core/utils/object";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/game_save");
jest.mock("@/engine/core/utils/object");
jest.mock("@/engine/core/utils/position");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

/**
 * Re-register a clean actor, dropping any info portions given by a previous assertion.
 */
function resetActor(): GameObject {
  resetRegistry();

  return mockRegisteredActor().actorGameObject;
}

/**
 * Verify a terrain predicate queries the expected terrain and answers both membership outcomes.
 */
function checkTerrainPredicate(name: TName, terrain: TSection, expectedWhenInside: boolean): void {
  const actorGameObject: GameObject = resetActor();
  const npc: GameObject = MockGameObject.mock();

  replaceFunctionMock(isObjectInSmartTerrain, () => true);
  expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(expectedWhenInside);
  expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);

  replaceFunctionMock(isObjectInSmartTerrain, () => false);
  expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(!expectedWhenInside);
  expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);
}

/**
 * Verify an alive predicate queries the expected story object and mirrors its state.
 */
function checkAlivePredicate(name: TName, storyId: TName): void {
  replaceFunctionMock(isStalkerAlive, () => true);
  expect(callDialogsBinding(name)).toBe(true);
  expect(isStalkerAlive).toHaveBeenLastCalledWith(storyId);

  replaceFunctionMock(isStalkerAlive, () => false);
  expect(callDialogsBinding(name)).toBe(false);
  expect(isStalkerAlive).toHaveBeenLastCalledWith(storyId);
}

/**
 * Verify a dialog action creates exactly one auto-save with the expected name.
 */
function checkAutoSave(name: TName, saveName: TName): void {
  callDialogsBinding(name);

  expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  expect(createGameAutoSave).toHaveBeenCalledWith(saveName);
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

    resetActor();

    giveInfoPortion(infoPortions.pri_b305_actor_wondered_done);
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(false);
  });

  it("should stay available while any helicopter is still unsearched", () => {
    giveInfoPortion(infoPortions.jup_b9_heli_1_searched);
    giveInfoPortion(infoPortions.zat_b100_heli_2_searched);
    giveInfoPortion(infoPortions.zat_b28_heli_3_searched);
    giveInfoPortion(infoPortions.jup_b8_heli_4_searched);

    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(true);
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

  it("should also accept the decrypted blackbox as the only known clue", () => {
    giveInfoPortion(infoPortions.jup_b9_blackbox_decrypted);

    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(true);
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

  it("should stay available while any squad member is still unhired", () => {
    giveInfoPortion(infoPortions.jup_b218_monolith_hired);
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);

    expect(callDialogsBinding("quest_dialog_squad_precond")).toBe(true);
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

  it("should close once the Jupiter toolkit task also ends", () => {
    giveInfoPortion(infoPortions.jup_b217_tech_instruments_start);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b217_task_end);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(false);
  });
});

describe("monolith_leader_is_alive", () => {
  it("should check the monolith skin leader while the squad kept its faction", () => {
    replaceFunctionMock(isStalkerAlive, (name: string) => name === "jup_b4_monolith_squad_leader_monolith_skin");

    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");
  });

  it("should check the freedom skin leader once the squad joined Freedom", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, (name: string) => name === "jup_b4_monolith_squad_leader_freedom_skin");

    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(true);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_freedom_skin");
  });

  it("should check the duty skin leader once the squad joined Duty", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => false);

    expect(callDialogsBinding("monolith_leader_is_alive")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_duty_skin");
  });
});

describe("monolith_leader_dead_or_hired", () => {
  it("should accept a hired squad regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(true);
  });

  it("should invert the monolith skin leader state while the squad kept its faction", () => {
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(true);
  });

  it("should invert the faction skin leader state once the squad joined a faction", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_freedom_skin");

    resetActor();

    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    expect(callDialogsBinding("monolith_leader_dead_or_hired")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_duty_skin");
  });
});

describe("monolith_leader_dead_or_dolg", () => {
  it("should accept the Freedom faction regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);
  });

  it("should still require a dead duty skin leader once the squad joined Duty", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_duty_skin");

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);
  });

  it("should accept a hired squad and follow the monolith leader otherwise", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(true);

    resetActor();

    expect(callDialogsBinding("monolith_leader_dead_or_dolg")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");
  });
});

describe("squad_not_in_smart_b101", () => {
  it("should check the zat_b101 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b101", "zat_b101", false);
  });
});

describe("squad_not_in_smart_b103", () => {
  it("should check the zat_b103 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b103", "zat_b103", false);
  });
});

describe("squad_not_in_smart_b104", () => {
  it("should check the zat_b104 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b104", "zat_b104", false);
  });
});

describe("squad_not_in_smart_b213", () => {
  it("should check the jup_b213 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b213", "jup_b213", false);
  });
});

describe("squad_not_in_smart_b214", () => {
  it("should check the jup_b214 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b214", "jup_b214", false);
  });
});

describe("squad_not_in_smart_b304", () => {
  it("should check the pri_b304 monsters terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b304", "pri_b304_monsters_smart_terrain", false);
  });
});

describe("squad_not_in_smart_b303", () => {
  it("should check the pri_b303 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b303", "pri_b303", false);
  });
});

describe("squad_not_in_smart_b40", () => {
  it("should check the zat_b40 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b40", "zat_b40_smart_terrain", false);
  });
});

describe("squad_not_in_smart_b18", () => {
  it("should check the zat_b18 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b18", "zat_b18", false);
  });
});

describe("squad_not_in_smart_b6", () => {
  // Named after b6 but bound to the jup_b41 terrain, same as the original game script.
  it("should check the jup_b41 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b6", "jup_b41", false);
  });
});

describe("squad_not_in_smart_b205", () => {
  it("should check the jup_b205 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b205", "jup_b205_smart_terrain", false);
  });
});

describe("squad_not_in_smart_b47", () => {
  it("should check the jup_b47 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b47", "jup_b47", false);
  });
});

describe("squad_in_smart_zat_base", () => {
  it("should check the Zaton stalker base terrain", () => {
    checkTerrainPredicate("squad_in_smart_zat_base", "zat_stalker_base_smart", true);
  });
});

describe("squad_in_smart_jup_b25", () => {
  // Named after b25 but bound to the jup_a6 terrain, same as the original game script.
  it("should check the jup_a6 terrain", () => {
    checkTerrainPredicate("squad_in_smart_jup_b25", "jup_a6", true);
  });
});

describe("spartak_is_alive", () => {
  it("should follow the zat_b7 victim state", () => {
    checkAlivePredicate("spartak_is_alive", "zat_b7_stalker_victim_1");
  });
});

describe("tesak_is_alive", () => {
  it("should follow the lost mercenary leader state", () => {
    checkAlivePredicate("tesak_is_alive", "zat_b103_lost_merc_leader");
  });
});

describe("gonta_is_alive", () => {
  // Bound to the same story object as `tesak_is_alive`, same as the original game script.
  it("should follow the lost mercenary leader state", () => {
    checkAlivePredicate("gonta_is_alive", "zat_b103_lost_merc_leader");
  });
});

describe("mityay_is_alive", () => {
  it("should follow the jup_a12 assaulter state", () => {
    checkAlivePredicate("mityay_is_alive", "jup_a12_stalker_assaulter");
  });
});

describe("dolg_can_work_for_sci", () => {
  it("should stay open until Freedom takes either bunker job", () => {
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(true);

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(false);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work);
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(false);
  });

  it("should ignore the jobs taken by Duty itself", () => {
    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work);
    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);

    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(true);
  });
});

describe("dolg_can_not_work_for_sci", () => {
  it("should invert the Duty bunker job availability", () => {
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(false);

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(true);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work);
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(true);
  });
});

describe("freedom_can_work_for_sci", () => {
  it("should stay open until Duty takes either bunker job", () => {
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(true);

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work);
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(false);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(false);
  });

  it("should ignore the jobs taken by Freedom itself", () => {
    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work);

    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(true);
  });
});

describe("freedom_can_not_work_for_sci", () => {
  it("should invert the Freedom bunker job availability", () => {
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(false);

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work);
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(true);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(true);
  });
});

describe("monolith_leader_dead_or_freedom", () => {
  it("should accept the Duty faction regardless of leader status", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_duty);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);
  });

  it("should still require a dead freedom skin leader once the squad joined Freedom", () => {
    giveInfoPortion(infoPortions.jup_b4_monolith_squad_in_freedom);
    replaceFunctionMock(isStalkerAlive, () => true);

    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_freedom_skin");

    replaceFunctionMock(isStalkerAlive, () => false);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);
  });

  it("should accept a hired squad and follow the monolith leader otherwise", () => {
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    replaceFunctionMock(isStalkerAlive, () => true);
    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(true);

    resetActor();

    expect(callDialogsBinding("monolith_leader_dead_or_freedom")).toBe(false);
    expect(isStalkerAlive).toHaveBeenLastCalledWith("jup_b4_monolith_squad_leader_monolith_skin");
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

  it("should leave an already healthy actor untouched", () => {
    const { actorGameObject } = mockRegisteredActor({ bleeding: 0, health: 1, power: 1, radiation: 0 });

    callDialogsBinding("medic_magic_potion");

    expect(actorGameObject.health).toBe(1);
    expect(actorGameObject.power).toBe(1);
    expect(actorGameObject.radiation).toBe(0);
    expect(actorGameObject.bleeding).toBe(0);
  });
});

describe("actor_needs_bless", () => {
  it("should follow the actor injury state", () => {
    replaceFunctionMock(isObjectInjured, () => true);
    expect(callDialogsBinding("actor_needs_bless")).toBe(true);

    replaceFunctionMock(isObjectInjured, () => false);
    expect(callDialogsBinding("actor_needs_bless")).toBe(false);
  });
});

describe("actor_is_damn_healthy", () => {
  it("should invert the actor injury state", () => {
    replaceFunctionMock(isObjectInjured, () => true);
    expect(callDialogsBinding("actor_is_damn_healthy")).toBe(false);

    replaceFunctionMock(isObjectInjured, () => false);
    expect(callDialogsBinding("actor_is_damn_healthy")).toBe(true);
  });
});

describe("leave_zone_save", () => {
  it("should create the zone to reality auto-save", () => {
    checkAutoSave("leave_zone_save", "st_save_uni_zone_to_reality");
  });
});

describe("save_uni_travel_zat_to_jup", () => {
  it("should create the Zaton to Jupiter auto-save", () => {
    checkAutoSave("save_uni_travel_zat_to_jup", "st_save_uni_travel_zat_to_jup");
  });
});

describe("save_uni_travel_zat_to_pri", () => {
  it("should create the Zaton to Pripyat auto-save", () => {
    checkAutoSave("save_uni_travel_zat_to_pri", "st_save_uni_travel_zat_to_pri");
  });
});

describe("save_uni_travel_jup_to_zat", () => {
  it("should create the Jupiter to Zaton auto-save", () => {
    checkAutoSave("save_uni_travel_jup_to_zat", "st_save_uni_travel_jup_to_zat");
  });
});

describe("save_uni_travel_jup_to_pri", () => {
  it("should create the Jupiter to Pripyat auto-save", () => {
    checkAutoSave("save_uni_travel_jup_to_pri", "st_save_uni_travel_jup_to_pri");
  });
});

describe("save_uni_travel_pri_to_zat", () => {
  it("should create the Pripyat to Zaton auto-save", () => {
    checkAutoSave("save_uni_travel_pri_to_zat", "st_save_uni_travel_pri_to_zat");
  });
});

describe("save_uni_travel_pri_to_jup", () => {
  it("should create the Pripyat to Jupiter auto-save", () => {
    checkAutoSave("save_uni_travel_pri_to_jup", "st_save_uni_travel_pri_to_jup");
  });
});

describe("save_jup_b218_travel_jup_to_pas", () => {
  it("should create the Jupiter to underpass auto-save", () => {
    checkAutoSave("save_jup_b218_travel_jup_to_pas", "st_save_jup_b218_travel_jup_to_pas");
  });
});

describe("save_pri_a17_hospital_start", () => {
  it("should create the hospital start auto-save", () => {
    checkAutoSave("save_pri_a17_hospital_start", "st_save_pri_a17_hospital_start");
  });
});

describe("save_jup_a10_gonna_return_debt", () => {
  it("should create the return debt auto-save and remember it", () => {
    checkAutoSave("save_jup_a10_gonna_return_debt", "st_save_jup_a10_gonna_return_debt");

    expect(registry.actor.has_info(infoPortions.jup_a10_avtosave)).toBe(true);
  });

  it("should save only once", () => {
    callDialogsBinding("save_jup_a10_gonna_return_debt");
    callDialogsBinding("save_jup_a10_gonna_return_debt");

    expect(createGameAutoSave).toHaveBeenCalledTimes(1);
  });

  it("should skip the save when it already happened", () => {
    giveInfoPortion(infoPortions.jup_a10_avtosave);

    callDialogsBinding("save_jup_a10_gonna_return_debt");

    expect(createGameAutoSave).not.toHaveBeenCalled();
  });
});

describe("save_jup_b6_arrived_to_fen", () => {
  it("should create the fen arrival auto-save", () => {
    checkAutoSave("save_jup_b6_arrived_to_fen", "st_save_jup_b6_arrived_to_fen");
  });
});

describe("save_jup_b6_arrived_to_ash_heap", () => {
  it("should create the ash heap arrival auto-save", () => {
    checkAutoSave("save_jup_b6_arrived_to_ash_heap", "st_save_jup_b6_arrived_to_ash_heap");
  });
});

describe("save_jup_b19_arrived_to_kopachy", () => {
  it("should create the Kopachy arrival auto-save", () => {
    checkAutoSave("save_jup_b19_arrived_to_kopachy", "st_save_jup_b19_arrived_to_kopachy");
  });
});

describe("save_zat_b106_arrived_to_chimera_lair", () => {
  it("should create the chimera lair arrival auto-save", () => {
    checkAutoSave("save_zat_b106_arrived_to_chimera_lair", "st_save_zat_b106_arrived_to_chimera_lair");
  });
});

describe("save_zat_b5_met_with_others", () => {
  it("should create the zat_b5 meeting auto-save", () => {
    checkAutoSave("save_zat_b5_met_with_others", "st_save_zat_b5_met_with_others");
  });
});
