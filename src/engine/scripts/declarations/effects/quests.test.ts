import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'quests' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/quests");

    checkBinding("show_freeplay_dialog");
    checkBinding("jup_b32_place_scanner");
    checkBinding("jup_b32_pda_check");
    checkBinding("pri_b306_generator_start");
    checkBinding("jup_b206_get_plant");
    checkBinding("pas_b400_switcher");
    checkBinding("jup_b209_place_scanner");
    checkBinding("jup_b9_heli_1_searching");
    checkBinding("pri_a18_use_idol");
    checkBinding("jup_b8_heli_4_searching");
    checkBinding("jup_b10_ufo_searching");
    checkBinding("zat_b101_heli_5_searching");
    checkBinding("zat_b28_heli_3_searching");
    checkBinding("zat_b100_heli_2_searching");
    checkBinding("jup_teleport_actor");
    checkBinding("jup_b219_save_pos");
    checkBinding("jup_b219_restore_gate");
    checkBinding("jup_b16_play_particle_and_sound");
    checkBinding("zat_b29_create_random_infop");
    checkBinding("give_item_b29");
    checkBinding("relocate_item_b29");
    checkBinding("jup_b202_inventory_box_relocate");
    checkBinding("jup_b10_spawn_drunk_dead_items");
    checkBinding("zat_b202_spawn_random_loot");
    checkBinding("jup_b221_play_main");
    checkBinding("zat_a1_tutorial_end_give");
    checkBinding("oasis_heal");
    checkBinding("pas_b400_play_particle");
    checkBinding("pas_b400_stop_particle");
    checkBinding("damage_pri_a17_gauss");
    checkBinding("pri_a17_hard_animation_reset");
    checkBinding("jup_b217_hard_animation_reset");
    checkBinding("pri_a18_radio_start");
    checkBinding("pri_a17_ice_climb_end");
    checkBinding("jup_b219_opening");
    checkBinding("jup_b219_entering_underpass");
    checkBinding("pri_a17_pray_start");
    checkBinding("zat_b38_open_info");
    checkBinding("zat_b38_switch_info");
    checkBinding("zat_b38_cop_dead");
    checkBinding("jup_b15_zulus_drink_anim_info");
    checkBinding("pri_a17_preacher_death");
    checkBinding("zat_b3_tech_surprise_anim_end");
    checkBinding("zat_b3_tech_waked_up");
    checkBinding("zat_b3_tech_drinked_out");
    checkBinding("pri_a28_kirillov_hq_online");
    checkBinding("pri_a20_radio_start");
    checkBinding("pri_a22_kovalski_speak");
    checkBinding("zat_b38_underground_door_open");
    checkBinding("zat_b38_jump_tonnel_info");
    checkBinding("jup_a9_cam1_actor_anim_end");
    checkBinding("pri_a28_talk_ssu_video_end");
    checkBinding("zat_b33_pic_snag_container");
    checkBinding("zat_b202_spawn_b33_loot");
    checkBinding("pri_a28_check_zones");
    checkBinding("eat_vodka_script");
    checkBinding("jup_b200_count_found");
  });
});
