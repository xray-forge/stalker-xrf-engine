import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("'quests' effects declaration", () => {
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
