import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyCallablesModule, getExtern, TRUE } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import {
  MockAlifeObject,
  MockAlifeObjectPhysic,
  MockAlifeSimulator,
  MockGameObject,
  MockParticleObject,
  MockPatrol,
  MockVector,
} from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";
import { questItems } from "@/engine/constants/items/quest_items";
import {
  getManager,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registerZone,
  registry,
} from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { updateAnomalyZonesDisplay } from "@/engine/core/managers/map/utils";
import { showFreeplayDialog } from "@/engine/core/ui/game/freeplay";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { giveItemsToActor, takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject, spawnObjectInObject, spawnSquadInSmart } from "@/engine/core/utils/spawn";
import { callXrEffect, checkXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/managers/map/utils");
jest.mock("@/engine/core/ui/game/freeplay");
jest.mock("@/engine/core/utils/reward");
jest.mock("@/engine/core/utils/spawn");
jest.mock("@/engine/core/utils/game_save");

function mockActorInsideZone(name: string): GameObject {
  const { actorGameObject } = mockRegisteredActor();
  const zone: GameObject = MockGameObject.mock({ name });

  registerZone(zone);
  jest.spyOn(zone, "inside").mockReturnValue(true);

  return actorGameObject;
}

beforeAll(() => {
  require("@/engine/scripts/declarations/effects/quests");
});

describe("quests effects declaration", () => {
  it("should correctly inject external methods for game", () => {
    checkXrEffect("show_freeplay_dialog");
    checkXrEffect("jup_b32_place_scanner");
    checkXrEffect("jup_b32_pda_check");
    checkXrEffect("pri_b306_generator_start");
    checkXrEffect("jup_b206_get_plant");
    checkXrEffect("pas_b400_switcher");
    checkXrEffect("jup_b209_place_scanner");
    checkXrEffect("jup_b9_heli_1_searching");
    checkXrEffect("pri_a18_use_idol");
    checkXrEffect("jup_b8_heli_4_searching");
    checkXrEffect("jup_b10_ufo_searching");
    checkXrEffect("zat_b101_heli_5_searching");
    checkXrEffect("zat_b28_heli_3_searching");
    checkXrEffect("zat_b100_heli_2_searching");
    checkXrEffect("jup_teleport_actor");
    checkXrEffect("jup_b219_save_pos");
    checkXrEffect("jup_b219_restore_gate");
    checkXrEffect("jup_b16_play_particle_and_sound");
    checkXrEffect("zat_b29_create_random_infop");
    checkXrEffect("give_item_b29");
    checkXrEffect("relocate_item_b29");
    checkXrEffect("jup_b202_inventory_box_relocate");
    checkXrEffect("jup_b10_spawn_drunk_dead_items");
    checkXrEffect("zat_b202_spawn_random_loot");
    checkXrEffect("jup_b221_play_main");
    checkXrEffect("zat_a1_tutorial_end_give");
    checkXrEffect("oasis_heal");
    checkXrEffect("pas_b400_play_particle");
    checkXrEffect("pas_b400_stop_particle");
    checkXrEffect("damage_pri_a17_gauss");
    checkXrEffect("pri_a17_hard_animation_reset");
    checkXrEffect("jup_b217_hard_animation_reset");
    checkXrEffect("pri_a18_radio_start");
    checkXrEffect("pri_a17_ice_climb_end");
    checkXrEffect("jup_b219_opening");
    checkXrEffect("jup_b219_entering_underpass");
    checkXrEffect("pri_a17_pray_start");
    checkXrEffect("zat_b38_open_info");
    checkXrEffect("zat_b38_switch_info");
    checkXrEffect("zat_b38_cop_dead");
    checkXrEffect("jup_b15_zulus_drink_anim_info");
    checkXrEffect("pri_a17_preacher_death");
    checkXrEffect("zat_b3_tech_surprise_anim_end");
    checkXrEffect("zat_b3_tech_waked_up");
    checkXrEffect("zat_b3_tech_drinked_out");
    checkXrEffect("pri_a28_kirillov_hq_online");
    checkXrEffect("pri_a20_radio_start");
    checkXrEffect("pri_a22_kovalski_speak");
    checkXrEffect("zat_b38_underground_door_open");
    checkXrEffect("zat_b38_jump_tonnel_info");
    checkXrEffect("jup_a9_cam1_actor_anim_end");
    checkXrEffect("pri_a28_talk_ssu_video_end");
    checkXrEffect("zat_b33_pic_snag_container");
    checkXrEffect("zat_b202_spawn_b33_loot");
    checkXrEffect("pri_a28_check_zones");
    checkXrEffect("eat_vodka_script");
    checkXrEffect("jup_b200_count_found");
  });
});

describe("quests effects implementation", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(showFreeplayDialog);
  });

  it("show_freeplay_dialog should show freeplay dialog", () => {
    expect(() => {
      callXrEffect("show_freeplay_dialog", MockGameObject.mockActor(), MockGameObject.mock(), "");
    }).toThrow("Expected text message to be provided for 'show_freeplay_dialog' effect.");

    callXrEffect("show_freeplay_dialog", MockGameObject.mockActor(), MockGameObject.mock(), "test-text-1", TRUE);
    expect(showFreeplayDialog).toHaveBeenCalledWith("message_box_yes_no", "test-text-1");

    callXrEffect("show_freeplay_dialog", MockGameObject.mockActor(), MockGameObject.mock(), "test-text-2");
    expect(showFreeplayDialog).toHaveBeenCalledWith("message_box_ok", "test-text-2");
  });

  it("jup_b32_place_scanner should place scanners", () => {
    mockRegisteredActor();

    const object: GameObject = MockGameObject.mock({ name: "jup_b32_sr_scanner_place_5" });

    jest.spyOn(object, "inside").mockImplementation(() => true);

    callXrEffect("jup_b32_place_scanner", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hasInfoPortion("jup_b32_scanner_5_placed")).toBe(false);
    expect(hasInfoPortion("jup_b32_scanner_5_placed")).toBe(false);

    registerZone(object);
    callXrEffect("jup_b32_place_scanner", MockGameObject.mockActor(), MockGameObject.mock());

    expect(hasInfoPortion("jup_b32_scanner_5_placed")).toBe(true);
    expect(hasInfoPortion(infoPortions.jup_b32_tutorial_done)).toBe(true);
    expect(takeItemFromActor).toHaveBeenCalledWith(questItems.jup_b32_scanner_device);
    expect(spawnObject).toHaveBeenCalledWith("jup_b32_ph_scanner", "jup_b32_scanner_place_5");
  });

  it("jup_b32_pda_check should check pda", () => {
    const manager: MapDisplayManager = getManager(MapDisplayManager);

    callXrEffect("jup_b32_pda_check", MockGameObject.mockActor(), MockGameObject.mock());

    expect(updateAnomalyZonesDisplay).toHaveBeenCalledTimes(1);
  });

  it("pri_b306_generator_start should start generators", () => {
    mockRegisteredActor();

    callXrEffect("pri_b306_generator_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_b306_lift_generator_used)).toBe(false);

    const object: GameObject = MockGameObject.mock({ name: "pri_b306_sr_generator" });

    registerZone(object);

    jest.spyOn(object, "inside").mockImplementation(() => true);

    callXrEffect("pri_b306_generator_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_b306_lift_generator_used)).toBe(true);
  });

  it("jup_b206_get_plant should grant the plant and destroy its world object in the quest zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b206_sr_quest_line");
    const object: GameObject = MockGameObject.mock();
    const destroyObject = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").destroy_object = destroyObject;

    callXrEffect("jup_b206_get_plant", actor, object);

    expect(hasInfoPortion(infoPortions.jup_b206_anomalous_grove_has_plant)).toBe(true);
    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.jup_b206_plant);
    expect(destroyObject).toHaveBeenCalledWith(actor, object, ["story", "jup_b206_plant_ph", null]);
  });

  it("pas_b400_switcher should handle pass switcher", () => {
    mockRegisteredActor();

    callXrEffect("pas_b400_switcher", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pas_b400_switcher_use)).toBe(false);

    const object: GameObject = MockGameObject.mock({ name: "pas_b400_sr_switcher" });

    registerZone(object);

    jest.spyOn(object, "inside").mockImplementation(() => true);

    callXrEffect("pas_b400_switcher", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pas_b400_switcher_use)).toBe(true);
  });

  it("jup_b209_place_scanner should save, place, and consume the scanner in the hypotheses zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b209_hypotheses");

    callXrEffect("jup_b209_place_scanner", actor, MockGameObject.mock());

    expect(createGameAutoSave).toHaveBeenCalledWith("st_save_jup_b209_placed_mutant_scanner");
    expect(hasInfoPortion(infoPortions.jup_b209_scanner_placed)).toBe(true);
    expect(takeItemFromActor).toHaveBeenCalledWith(questItems.jup_b209_monster_scanner);
    expect(spawnObject).toHaveBeenCalledWith("jup_b209_ph_scanner", "jup_b209_scanner_place_point");
  });

  it("jup_b9_heli_1_searching should mark the first Jupiter helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b9_heli_1");

    callXrEffect("jup_b9_heli_1_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.jup_b9_heli_1_searching)).toBe(true);
  });

  it("pri_a18_use_idol should start the run camera in the idol restrictor", () => {
    const actor: GameObject = mockActorInsideZone("pri_a18_use_idol_restrictor");

    callXrEffect("pri_a18_use_idol", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.pri_a18_run_cam)).toBe(true);
  });

  it("jup_b8_heli_4_searching should mark the fourth Jupiter helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b8_heli_4");

    callXrEffect("jup_b8_heli_4_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.jup_b8_heli_4_searching)).toBe(true);
  });

  it("jup_b10_ufo_searching should start the memory quest and grant its item in the restrictor", () => {
    const actor: GameObject = mockActorInsideZone("jup_b10_ufo_restrictor");

    callXrEffect("jup_b10_ufo_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.jup_b10_ufo_memory_started)).toBe(true);
    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.jup_b10_ufo_memory);
  });

  it("zat_b101_heli_5_searching should mark the fifth Zaton helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("zat_b101_heli_5");

    callXrEffect("zat_b101_heli_5_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.zat_b101_heli_5_searching)).toBe(true);
  });

  it("zat_b28_heli_3_searching should mark the third Zaton helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("zat_b28_heli_3");

    callXrEffect("zat_b28_heli_3_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.zat_b28_heli_3_searching)).toBe(true);
  });

  it("zat_b100_heli_2_searching should mark the second Zaton helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("zat_b100_heli_2");

    callXrEffect("zat_b100_heli_2_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.zat_b100_heli_2_searching)).toBe(true);
  });

  it("jup_teleport_actor should preserve the actor offset between teleport patrol points", () => {
    const actor: GameObject = MockGameObject.mockActor({ position: MockVector.mock(12, 5, 8) });

    MockPatrol.setup({
      jup_b16_teleport_in: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "in", position: MockVector.create(10, 1, 3) }],
      },
      jup_b16_teleport_out: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "out", position: MockVector.create(50, 20, 30) }],
      },
    });

    callXrEffect("jup_teleport_actor", actor, MockGameObject.mock());

    expect(actor.set_actor_position).toHaveBeenCalledWith(expect.objectContaining({ x: 52, y: 24, z: 35 }));
  });

  it("jup_b219_save_pos should retain the gate position and release its server object", () => {
    const gate: GameObject = MockGameObject.mock();
    const serverGate = MockAlifeObject.mock({ id: gate.id() });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverGate);
    registerStoryLink(gate.id(), "jup_b219_gate_id");

    callXrEffect("jup_b219_save_pos", MockGameObject.mockActor(), MockGameObject.mock());

    expect(registry.simulator.release).toHaveBeenCalledWith(serverGate, true);
  });

  it("jup_b219_restore_gate should recreate a saved gate with its original positioning", () => {
    const gate: GameObject = MockGameObject.mock({ levelVertexId: 25, gameVertexId: 44 });
    const serverGate = MockAlifeObject.mock({ id: gate.id() });
    const restoredGate = MockAlifeObjectPhysic.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverGate);
    registerStoryLink(gate.id(), "jup_b219_gate_id");
    jest.spyOn(restoredGate, "set_yaw");
    jest.spyOn(registry.simulator, "create").mockReturnValue(restoredGate);

    callXrEffect("jup_b219_save_pos", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("jup_b219_restore_gate", MockGameObject.mockActor(), MockGameObject.mock());

    expect(registry.simulator.create).toHaveBeenCalledWith("jup_b219_gate", gate.position(), 25, 44);
    expect(restoredGate.set_yaw).toHaveBeenCalledWith(0);
  });

  it("jup_b16_play_particle_and_sound should play the requested particle at the patrol point", () => {
    const object: GameObject = MockGameObject.mock({ name: "jup_b16_teleport" });

    MockParticleObject.REGISTRY.clear();
    MockPatrol.setup({
      jup_b16_teleport_particle: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "particle-point", position: MockVector.create(1, 2, 3) }],
      },
    });

    callXrEffect("jup_b16_play_particle_and_sound", MockGameObject.mockActor(), object, 4);

    expect(MockParticleObject.REGISTRY.get("anomaly2\\teleport_out_00")?.play_at_pos).toHaveBeenCalledWith(
      MockVector.mock(1, 2, 3)
    );
  });

  it("zat_b29_create_random_infop should retain exactly the requested number of candidate info portions", () => {
    const { actorGameObject } = mockRegisteredActor();

    getExtern<AnyCallablesModule>("xr_effects").zat_b29_create_random_infop(
      actorGameObject,
      MockGameObject.mock(),
      $fromArray([1, "test_infop_a", "test_infop_b"])
    );

    expect(hasInfoPortion("test_infop_a") === hasInfoPortion("test_infop_b")).toBe(false);
  });

  it("give_item_b29 should request the active artefact from the marked anomaly zone", () => {
    const { actorGameObject } = mockRegisteredActor();
    const pickArtefact = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").pick_artefact_from_anomaly = pickArtefact;
    giveInfoPortion("zat_b29_bring_af_16");
    giveInfoPortion("zat_b55_anomal_zone");

    callXrEffect("give_item_b29", actorGameObject, MockGameObject.mock(), "target-story");

    expect(pickArtefact).toHaveBeenCalledWith(actorGameObject, null, [
      "target-story",
      "zat_b55_anomal_zone",
      artefacts.af_gravi,
    ]);
    expect(hasInfoPortion("zat_b55_anomal_zone")).toBe(false);
  });

  it("relocate_item_b29 should transfer the active artefact between resolved story objects", () => {
    const { actorGameObject } = mockRegisteredActor();
    const artefact: GameObject = MockGameObject.mock({ section: artefacts.af_gravi });
    const from: GameObject = MockGameObject.mock({ inventory: [[artefacts.af_gravi, artefact]] });
    const to: GameObject = MockGameObject.mock();

    giveInfoPortion("zat_b29_bring_af_16");
    registerStoryLink(from.id(), "from-story");
    registerStoryLink(to.id(), "to-story");

    callXrEffect("relocate_item_b29", actorGameObject, MockGameObject.mock(), "from-story", "to-story");

    expect(from.transfer_item).toHaveBeenCalledWith(artefact, to);
  });

  it("jup_b202_inventory_box_relocate should transfer every item from the actor box to Snag's box", () => {
    const from: GameObject = MockGameObject.mock();
    const to: GameObject = MockGameObject.mock();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(from.id(), "jup_b202_actor_treasure");
    registerStoryLink(to.id(), "jup_b202_snag_treasure");
    replaceFunctionMock(from.iterate_inventory_box, (callback) => {
      callback(from, first);
      callback(from, second);
    });

    callXrEffect("jup_b202_inventory_box_relocate", MockGameObject.mockActor(), MockGameObject.mock());

    expect(from.transfer_item).toHaveBeenNthCalledWith(1, first, to);
    expect(from.transfer_item).toHaveBeenNthCalledWith(2, second, to);
  });

  it("jup_b10_spawn_drunk_dead_items should spawn the complete loot set or the counter-selected box item", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const box = MockAlifeObject.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(box);

    callXrEffect("jup_b10_spawn_drunk_dead_items", actorGameObject, object);

    expect(registry.simulator.create).toHaveBeenCalledTimes(44);
    expect(registry.simulator.create).toHaveBeenCalledWith(
      questItems.jup_b10_ufo_memory_2,
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );

    registerStoryLink(box.id, "ufo-box");
    setPortableStoreValue(ACTOR_ID, "jup_b10_ufo_counter", 2);
    callXrEffect("jup_b10_spawn_drunk_dead_items", actorGameObject, object, "ufo-box");

    expect(registry.simulator.create).toHaveBeenLastCalledWith("wpn_sig550_luckygun", MockVector.mock(), 0, 0, box.id);
  });

  it("zat_b202_spawn_random_loot should select weighted loot groups without selecting a group twice", () => {
    const random = jest.spyOn(math, "random");

    random
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(3)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(4)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(5)
      .mockReturnValueOnce(1);

    callXrEffect("zat_b202_spawn_random_loot", MockGameObject.mockActor(), MockGameObject.mock());

    expect(spawnObjectInObject).toHaveBeenCalledTimes(19);
    expect(spawnObjectInObject).toHaveBeenNthCalledWith(1, "bandage", null);
    expect(spawnObjectInObject).toHaveBeenNthCalledWith(19, "ammo_9x39_ap", null);

    random.mockRestore();
  });

  it("jup_b221_play_main should play the first eligible faction theme and record it", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();
    const playSound = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").play_sound = playSound;
    giveInfoPortion(infoPortions.jup_b25_freedom_flint_gone);

    callXrEffect("jup_b221_play_main", actorGameObject, object, "duty");

    expect(playSound).toHaveBeenCalledWith(actorGameObject, object, ["jup_b221_duty_main_1", null, null]);
    expect(hasInfoPortion("jup_b221_duty_main_1_played")).toBe(true);
    expect(getPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme")).toBe("1");
  });

  it("zat_a1_tutorial_end_give should give info portions", () => {
    mockRegisteredActor();

    callXrEffect("zat_a1_tutorial_end_give", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_a1_tutorial_end)).toBe(true);
  });

  it("oasis_heal should send vanilla condition deltas to xray actor properties", () => {
    const { actorGameObject: actor } = mockRegisteredActor({
      bleeding: 0.25,
      health: 0.5,
      power: 0.5,
      radiation: 0.25,
      satiety: 0.5,
    });

    callXrEffect("oasis_heal", MockGameObject.mockActor(), MockGameObject.mock());

    expect(actor.health).toBe(0.505);
    expect(actor.power).toBe(0.51);
    expect(actor.radiation).toBe(0.2);
    expect(actor.bleeding).toBe(0.2);
    expect(actor.satiety).toBe(0.51);
  });

  it("oasis_heal should not send health, power, radiation or bleeding deltas when thresholds are not met", () => {
    const { actorGameObject: actor } = mockRegisteredActor({
      bleeding: 0,
      health: 1,
      power: 1,
      radiation: 0,
      satiety: 0.5,
    });

    callXrEffect("oasis_heal", MockGameObject.mockActor(), MockGameObject.mock());

    expect(actor.health).toBe(1);
    expect(actor.power).toBe(1);
    expect(actor.radiation).toBe(0);
    expect(actor.bleeding).toBe(0);
    expect(actor.satiety).toBe(0.51);
  });

  it("pas_b400_play_particle should start acidic particles on the registered actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    callXrEffect("pas_b400_play_particle", actorGameObject, MockGameObject.mock());

    expect(actorGameObject.start_particles).toHaveBeenCalledWith("zones\\zone_acidic_idle", "bip01_head");
  });

  it("pas_b400_stop_particle should stop acidic particles on the registered actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    callXrEffect("pas_b400_stop_particle", actorGameObject, MockGameObject.mock());

    expect(actorGameObject.stop_particles).toHaveBeenCalledWith("zones\\zone_acidic_idle", "bip01_head");
  });

  it("damage_pri_a17_gauss should break the registered quest rifle", () => {
    const gauss: GameObject = MockGameObject.mock();

    registerStoryLink(gauss.id(), questItems.pri_a17_gauss_rifle);

    callXrEffect("damage_pri_a17_gauss", MockGameObject.mockActor(), MockGameObject.mock());

    expect(gauss.set_condition).toHaveBeenCalledWith(0);
  });

  it("pri_a17_hard_animation_reset should reset the Pripyat fall-down animation", () => {
    const object: GameObject = MockGameObject.mock();
    const animationController = { setControl: jest.fn(), setState: jest.fn() };
    const stateController = { animationController, setState: jest.fn() };

    registerObject(object).stateController = stateController as never;

    callXrEffect("pri_a17_hard_animation_reset", MockGameObject.mockActor(), object);

    expect(stateController.setState).toHaveBeenCalledWith("pri_a17_fall_down", null, null, null, null);
    expect(animationController.setState).toHaveBeenNthCalledWith(1, null, true);
    expect(animationController.setState).toHaveBeenNthCalledWith(2, "pri_a17_fall_down", null);
    expect(animationController.setControl).toHaveBeenCalledTimes(1);
  });

  it("jup_b217_hard_animation_reset should reset the Jupiter nitro animation", () => {
    const object: GameObject = MockGameObject.mock();
    const animationController = { setControl: jest.fn(), setState: jest.fn() };
    const stateController = { animationController, setState: jest.fn() };

    registerObject(object).stateController = stateController as never;

    callXrEffect("jup_b217_hard_animation_reset", MockGameObject.mockActor(), object);

    expect(stateController.setState).toHaveBeenCalledWith("jup_b217_nitro_straight", null, null, null, null);
    expect(animationController.setState).toHaveBeenNthCalledWith(1, null, true);
    expect(animationController.setState).toHaveBeenNthCalledWith(2, "jup_b217_nitro_straight", null);
    expect(animationController.setControl).toHaveBeenCalledTimes(1);
  });

  it("pri_a18_radio_start should start radio", () => {
    mockRegisteredActor();

    callXrEffect("pri_a18_radio_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a18_radio_start)).toBe(true);
  });

  it("pri_a17_ice_climb_end should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a17_ice_climb_end", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a17_ice_climb_end)).toBe(true);
  });

  it("jup_b219_opening should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_b219_opening", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_b219_opening)).toBe(true);
  });

  it("jup_b219_entering_underpass should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_b219_entering_underpass", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_b219_entering_underpass)).toBe(true);
  });

  it("pri_a17_pray_start should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a17_pray_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a17_pray_start)).toBe(true);
  });

  it("zat_b38_open_info should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b38_open_info", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b38_open_info)).toBe(true);
  });

  it("zat_b38_switch_info should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b38_switch_info", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b38_switch_info)).toBe(true);
  });

  it("zat_b38_cop_dead should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b38_cop_dead", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b38_cop_dead)).toBe(true);
  });

  it("jup_b15_zulus_drink_anim_info should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_b15_zulus_drink_anim_info", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_b15_zulus_drink_anim_info)).toBe(true);
  });

  it("pri_a17_preacher_death should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a17_preacher_death", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a17_preacher_death)).toBe(true);
  });

  it("zat_b3_tech_surprise_anim_end should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b3_tech_surprise_anim_end", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b3_tech_surprise_anim_end)).toBe(true);
  });

  it("zat_b3_tech_waked_up should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b3_tech_waked_up", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b3_tech_waked_up)).toBe(true);
  });

  it("zat_b3_tech_drinked_out should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b3_tech_drinked_out", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b3_tech_drinked_out)).toBe(true);
  });

  it("pri_a28_kirillov_hq_online should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a28_kirillov_hq_online", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a28_kirillov_hq_online)).toBe(true);
  });

  it("pri_a20_radio_start should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a20_radio_start", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a20_radio_start)).toBe(true);
  });

  it("pri_a22_kovalski_speak should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a22_kovalski_speak", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a22_kovalski_speak)).toBe(true);
  });

  it("zat_b38_underground_door_open should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b38_underground_door_open", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b38_underground_door_open)).toBe(true);
  });

  it("zat_b38_jump_tonnel_info should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("zat_b38_jump_tonnel_info", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_b38_jump_tonnel_info)).toBe(true);
  });

  it("jup_a9_cam1_actor_anim_end should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("jup_a9_cam1_actor_anim_end", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.jup_a9_cam1_actor_anim_end)).toBe(true);
  });

  it("pri_a28_talk_ssu_video_end should give info portion", () => {
    mockRegisteredActor();

    callXrEffect("pri_a28_talk_ssu_video_end", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pri_a28_talk_ssu_video_end)).toBe(true);
  });

  it("zat_b33_pic_snag_container should grant the safe container and notify the actor in the tutor zone", () => {
    const actor: GameObject = mockActorInsideZone("zat_b33_tutor");
    const playSound = jest.fn();

    getExtern<AnyCallablesModule>("xr_effects").play_sound = playSound;

    callXrEffect("zat_b33_pic_snag_container", actor, MockGameObject.mock());

    expect(giveItemsToActor).toHaveBeenCalledWith(questItems.zat_b33_safe_container);
    expect(hasInfoPortion(infoPortions.zat_b33_find_package)).toBe(true);
    expect(playSound).toHaveBeenCalledWith(actor, registry.zones.get("zat_b33_tutor"), ["pda_news", null, null]);
  });

  it("zat_b202_spawn_b33_loot should create every unclaimed reward in its target containers", () => {
    const stalkerBox: GameObject = MockGameObject.mock();
    const treasureBox: GameObject = MockGameObject.mock();

    registerStoryLink(stalkerBox.id(), "jup_b202_stalker_snag");
    registerStoryLink(treasureBox.id(), "jup_b202_snag_treasure");

    callXrEffect("zat_b202_spawn_b33_loot", MockGameObject.mockActor(), MockGameObject.mock());

    expect(spawnObjectInObject).toHaveBeenCalledWith("wpn_fort_snag", stalkerBox.id());
    expect(spawnObjectInObject).toHaveBeenCalledWith("af_soul", treasureBox.id());
    expect(spawnObjectInObject).toHaveBeenCalledWith("helm_hardhat_snag", treasureBox.id());
  });

  it("pri_a28_check_zones should choose the farthest monolith zone and spawn its squad", () => {
    const { actorGameObject } = mockRegisteredActor({ position: MockVector.mock(0, 0, 0) });
    const first = MockAlifeObject.mock({ id: 101, position: MockVector.mock(1, 0, 0) });
    const second = MockAlifeObject.mock({ id: 102, position: MockVector.mock(5, 0, 0) });
    const third = MockAlifeObject.mock({ id: 103, position: MockVector.mock(3, 0, 0) });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(first);
    MockAlifeSimulator.addToRegistry(second);
    MockAlifeSimulator.addToRegistry(third);
    registerStoryLink(first.id, "pri_a28_sr_mono_add_1");
    registerStoryLink(second.id, "pri_a28_sr_mono_add_2");
    registerStoryLink(third.id, "pri_a28_sr_mono_add_3");

    callXrEffect("pri_a28_check_zones", actorGameObject, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.pri_a28_wave_2_spawned)).toBe(true);
    expect(spawnSquadInSmart).toHaveBeenCalledWith("pri_a28_heli_mono_add_2", "pri_a28_heli");
  });

  it("eat_vodka_script should handle vodka", () => {
    const actor: MockGameObject = MockGameObject.createActor();
    const item: GameObject = MockGameObject.mock({ section: "vodka_script" });

    jest.spyOn(actor, "eat").mockImplementation(() => {});

    callXrEffect("eat_vodka_script", actor.asGameObject(), MockGameObject.mock());
    expect(actor.eat).not.toHaveBeenCalled();

    actor.objectInventory.set(item.section(), item);

    callXrEffect("eat_vodka_script", actor.asGameObject(), MockGameObject.mock());
    expect(actor.eat).toHaveBeenCalledWith(item);
  });

  it("jup_b200_count_found should count carried materials together with the saved counter", () => {
    const { actorGameObject } = mockRegisteredActor();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    registerStoryLink(first.id(), "jup_b200_material_1");
    registerStoryLink(second.id(), "jup_b200_material_2");
    jest.spyOn(first, "parent").mockReturnValue(actorGameObject);
    jest.spyOn(second, "parent").mockReturnValue(actorGameObject);
    setPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_brought_counter", 3);

    callXrEffect("jup_b200_count_found", actorGameObject, MockGameObject.mock());

    expect(getPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_found_counter")).toBe(5);
  });
});
