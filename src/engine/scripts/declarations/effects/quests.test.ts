import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, registerZone } from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { updateAnomalyZonesDisplay } from "@/engine/core/managers/map/utils";
import { showFreeplayDialog } from "@/engine/core/ui/game/freeplay";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject } from "@/engine/core/utils/spawn";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/map/utils");
jest.mock("@/engine/core/ui/game/freeplay");
jest.mock("@/engine/core/utils/reward");
jest.mock("@/engine/core/utils/spawn");

describe("quests effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/quests");
  });

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
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/quests");
  });

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

  it.todo("jup_b206_get_plant should get plant object");

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

  it.todo("jup_b209_place_scanner should place scanners");

  it.todo("jup_b9_heli_1_searching should handle heli search");

  it.todo("pri_a18_use_idol should handle idol usage");

  it.todo("jup_b8_heli_4_searching should handle heli search");

  it.todo("jup_b10_ufo_searching should handle ufo search");

  it.todo("zat_b101_heli_5_searching should handle heli search");

  it.todo("zat_b28_heli_3_searching should handle heli search");

  it.todo("zat_b100_heli_2_searching should handle heli search");

  it.todo("jup_teleport_actor should handle teleport");

  it.todo("jup_b219_save_pos should handle saving of position");

  it.todo("jup_b219_restore_gate should restore gate objects");

  it.todo("jup_b16_play_particle_and_sound should play particles");

  it.todo("zat_b29_create_random_infop should create random info portion");

  it.todo("give_item_b29 should give items");

  it.todo("relocate_item_b29 should relocate items");

  it.todo("jup_b202_inventory_box_relocate should relocate items");

  it.todo("jup_b10_spawn_drunk_dead_items should spawn dead drunk stalker");

  it.todo("zat_b202_spawn_random_loot should spawn random loot");

  it.todo("jup_b221_play_main should play sounds");

  it("zat_a1_tutorial_end_give should give info portions", () => {
    mockRegisteredActor();

    callXrEffect("zat_a1_tutorial_end_give", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.zat_a1_tutorial_end)).toBe(true);
  });

  it.todo("oasis_heal should heal in oasis");

  it.todo("pas_b400_play_particle should play particles");

  it.todo("pas_b400_stop_particle should stop particles");

  it.todo("damage_pri_a17_gauss should damage gauss weapon");

  it.todo("pri_a17_hard_animation_reset should reset animation");

  it.todo("jup_b217_hard_animation_reset should reset animation");

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

  it.todo("zat_b33_pic_snag_container should pick container");

  it.todo("zat_b202_spawn_b33_loot should spawn loot");

  it.todo("pri_a28_check_zones should check zones");

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

  it.todo("jup_b200_count_found should recalculate count");
});
