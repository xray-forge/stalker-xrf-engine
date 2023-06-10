import { LTX_EXTEND, quoted } from "#/utils";

export const config = {
  zone_pick_dof: {
    near: -1500.0,
    far: 10.0,
  },
  sound: {
    occlusion_scale: 0.4,
    snd_collide_min_volume: 0.1,
    snd_collide_max_volume: 200,
  },
  demo_record: {
    speed0: 0.3,
    speed1: 3.0,
    speed2: 15.0,
    speed3: 60.0,
    ang_speed0: 0.1,
    ang_speed1: 0.5,
    ang_speed2: 7.0,
    ang_speed3: 2.0,
  },
  info_portions: {
    files: ["info_portions", "info_zaton", "info_jupiter", "info_pripyat", "info_upgrades"],
  },
  dialogs: {
    files: ["dialogs", "dialogs_zaton", "dialogs_jupiter", "dialogs_pripyat"],
  },
  encyclopedia: {
    files: "encyclopedia_infos",
  },
  profiles: {
    files: "npc_profile",
    specific_characters_files: [
      "character_desc_general",
      "character_desc_zaton",
      "character_desc_pripyat",
      "character_desc_jupiter",
      "character_desc_underpass",
    ],
  },
  inventory: {
    take_dist: 2,
    max_weight: 50,
    max_ruck: 56,
    max_belt: 5,
    slots_count: 12,
    slot_persistent_1: true,
    slot_active_1: true,
    slot_persistent_2: false,
    slot_active_2: true,
    slot_persistent_3: false,
    slot_active_3: true,
    slot_persistent_4: true,
    slot_active_4: true,
    slot_persistent_5: true,
    slot_active_5: true,
    slot_persistent_6: true,
    slot_active_6: true,
    slot_persistent_7: false,
    slot_active_7: false,
    slot_persistent_8: true,
    slot_active_8: false,
    slot_persistent_9: true,
    slot_active_9: false,
    slot_persistent_10: true,
    slot_active_10: false,
    slot_persistent_11: false,
    slot_active_11: true,
    slot_persistent_12: false,
    slot_active_12: false,
  },
  lights_hanging_lamp: {
    GroupControlSection: "spawn_group",
    $spawn: quoted("physics\\hanging lamp"),
    class: "SO_HLAMP",
    script_binding: "bind.physicObject",
  },
  lights_signal_light: {
    GroupControlSection: "spawn_group",
    $spawn: quoted("physics\\signal_light"),
    class: "SO_HLAMP",
    script_binding: "bind.signalLight",
  },
  search_light: {
    GroupControlSection: "spawn_group",
    $spawn: quoted("physics\\search light"),
    class: "O_SEARCH",
    cform: "skeleton",
    visual: "dynamics\\light\\projector.ogf",
    script_binding: "bind.physicObject",
  },
  explosion_marks: {
    wallmarks: "wm\\wm_grenade",
    dist: 0.5,
    size: 0.6,
    max_count: 5,
  },
  bloody_marks: {
    wallmarks: "wm\\wm_blood_1,wm\\wm_blood_2,wm\\wm_blood_3",
    dist: 2,
    max_size: 0.4,
    min_size: 0.06,
    nominal_hit: 0.5,
    blood_drops: "wm\\wm_blood_drop_1,wm\\wm_blood_drop_2,wm\\wm_blood_drop_3,wm\\wm_blood_drop_4",
    start_blood_size: 0.4,
    stop_blood_size: 0.025,
    blood_drop_time: 0.1,
    blood_drop_time_min: 0.3,
    blood_drop_time_max: 2.0,
    blood_drop_size: 0.1,
  },
  entity_fire_particles: {
    fire_particles: "damage_fx\\burn_creatures",
    start_burn_size: 0.0003,
    stop_burn_size: 0.0001,
    min_burn_time: 10000,
  },
  hud_cursor: {
    cross_length: 0.015,
    min_radius: 0.0,
    max_radius: 1.0,
    radius_lerp_speed: 0.08,
    cross_color: [0.7, 0.7, 0.7, 0.5],
    disp_scale: 0.08,
  },
  hud_hitmark: {
    hit_mark_texture: "ui\\ui_hud_hit_mark",
    grenade_mark_texture: "ui\\ui_hud_grenade_mark",
    /*
     * ;ui\ui_hud_hit_mark
     * ;ui\ui_hud_hit_mark_01
     * ;ui\ui_hud_hit_mark_02
     * ;ui\ui_hud_hit_mark_03
     * ;ui\ui_hud_hit_mark_04
     * ;ui\ui_hud_hit_mark_05
     * ;ui\ui_hud_hit_mark_06
     * ;ui\ui_hud_hit_mark_07
     * ;ui\ui_hud_hit_mark_08
     * ;ui\ui_hud_hit_mark_09
     * ;ui\ui_hud_hit_mark_10
     * ;ui\ui_hud_hit_mark_11
     * ;ui\ui_hud_hit_mark_12
     * ;ui\ui_hud_hit_mark_13
     * ;ui\ui_hud_hit_mark_14
     * ;ui\ui_hud_hit_mark_15
     * ;ui\ui_hud_hit_mark_16
     * ;ui\ui_hud_hit_mark_17
     * ;ui\ui_hud_hit_mark_18
     */
  },
  /**
   * ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
   * ;; inventory items
   * ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
   */
  document: {
    GroupControlSection: "spawn_group",
    $spawn: quoted("documents\\document 01"),
    class: "II_DOC",
    cform: "skeleton",
    visual: "dynamics\\equipments\\item_document_1.ogf",
    inv_name: "Document",
    inv_name_short: "Document",
    inv_weight: 1,
    inv_grid_width: 1,
    inv_grid_height: 1,
    inv_grid_x: 0,
    inv_grid_y: 0,
    cost: 0,
  },
  spectator: {
    $player: "on",
    class: "SPECT",
  },
  "??tg_event": {
    class: "EVENT",
  },
  m_car: {
    GroupControlSection: "spawn_group",
    discovery_dependency: "",
    $spawn: quoted("vehicles\\car"),
    cform: "skeleton",
    class: "SCRPTCAR",
    inv_weight: "1000",
    cost: "100000",
    inv_grid_width: 1,
    inv_grid_height: 1,
    script_binding: "bind.physicObject",
  },
  actor_firsteye_cam: {
    lim_pitch: [-1.5, 1.5],
    lim_yaw: [0, 0],
    rot_speed: [3.14, 3.14, 0],
  },
  actor_ladder_cam: {
    lim_pitch: [-1.5, 1.5],
    lim_yaw: [-1.0, 1.0],
    rot_speed: [3.14, 3.14, 0],
  },
  actor_free_cam: {
    lim_pitch: [-1.5, 1.5],
    lim_yaw: [0, 0],
    lim_zoom: [0.4, 10],
    rot_speed: [3.14, 1.0, 10],
  },
  actor_look_cam: {
    lim_pitch: [-0.7, 1],
    lim_yaw: [0, 0],
    lim_zoom: [1, 5],
    rot_speed: [3.14, 6.28, 10],
  },
  actor_look_cam_psp: {
    lim_pitch: [-0.7, 1],
    lim_yaw: [0, 0],
    lim_zoom: [1, 5],
    rot_speed: [2, 2, 2],
    offset: [0.4, 0.2, -1.1],
    autoaim_speed_y: [0.5, 3.14],
    autoaim_speed_x: [0.5, 3.14],
  },
  mounted_weapon_cam: {
    lim_pitch: [-0.5, 0.5],
    lim_yaw: [-2.0, 2.0],
    rot_speed: [3.14, 1.0, 0],
  },
  car_firsteye_cam: {
    lim_pitch: [-0.5, 0.3],
    lim_yaw: [-2.0, 2.0],
    rot_speed: [3.14, 1.0, 0],
  },
  car_free_cam: {
    lim_pitch: [-1, 1.56],
    lim_yaw: [0, 0],
    lim_zoom: [1, 10],
    rot_speed: [3.14, 1.0, 10],
  },
  car_look_cam: {
    lim_pitch: [0, 1.56],
    lim_yaw: [0, 0],
    lim_zoom: [1, 7],
    rot_speed: [25, 1.0, 10],
  },
  heli_free_cam: {
    lim_pitch: [-1.5, 1.5],
    lim_yaw: [0, 0],
    lim_zoom: [5, 25],
    rot_speed: [3.14, 1.0, 10],
  },
  heli_front_cam: {
    lim_pitch: [-1.2, 1.2],
    lim_yaw: [-1.5, 1.5],
    rot_speed: [3.14, 1.5, 0],
  },
  heli_look_cam: {
    lim_pitch: [0, 1.56],
    lim_yaw: [0, 0],
    lim_zoom: [5, 15],
    rot_speed: [3.14, 1.0, 10],
  },
  interface: {
    font_game: "font_game",
    font_small: "font_small",
  },
  graph_point: {
    class: "AI_GRAPH",
    $spawn: quoted("ai\\graph point"),
  },
  /**
   * ;-----------------------------------------------------------------
   * ; Trade
   * ;-----------------------------------------------------------------
   */
  trade: {
    buy_price_factor_hostile: 1,
    buy_price_factor_friendly: 1,
    sell_price_factor_hostile: 1,
    sell_price_factor_friendly: 1,
  },
  spawn_group_zone: {
    GroupControlSection: "spawn_group_zone",
    $spawn: quoted("ai\\group zone"),
    class: "AI_SPGRP",
  },
  spawn_group: {
    GroupControlSection: "spawn_group",
    $spawn: quoted("ai\\spawn group"),
    class: "AI_SPGRP",
  },
  level_changer: {
    GroupControlSection: "",
    $spawn: quoted("ai\\level changer"),
    class: "LVL_CHNG",
    script_binding: "bind.levelChanger",
    shape_transp_color: [255, 255, 255, 100],
    shape_edge_color: [32, 32, 32, 255],
  },
  script_zone: {
    GroupControlSection: "",
    $spawn: quoted("ai\\script zone"),
    class: "SCRIPTZN",
    script_binding: "bind.arenaZone",
  },
  physics: {
    object_damage_factor: 1.2,
  },
  stalker_names_stalker: {
    name_cnt: 104,
    last_name_cnt: 600,
  },
  stalker_names_bandit: {
    name_cnt: 38,
    last_name_cnt: 182,
  },
  stalker_names_science: {
    name_cnt: 15,
    last_name_cnt: 29,
  },
  stalker_names_private: {
    name_cnt: 1,
    last_name_cnt: 200,
  },
  stalker_names_sergeant: {
    name_cnt: 1,
    last_name_cnt: 200,
  },
  stalker_names_lieutenant: {
    name_cnt: 1,
    last_name_cnt: 200,
  },
  stalker_names_captain: {
    name_cnt: 1,
    last_name_cnt: 200,
  },
  script_object: {
    GroupControlSection: "spawn_group",
    $spawn: quoted("script\\script object"),
    $npc: "on",
    Scheduled: "on",
    Human: "off",
    cform: "skeleton",
    class: "SCRPTOBJ",
  },
  maingame_ui: {
    pda_msgs_max_show_time: 20_000,
    info_msgs_max_show_time: 10_000,
    snd_new_contact: "detectors\\contact_1",
    snd_new_contact1: "detectors\\contact_8",
  },
  hud_sound: {
    hud_sound_vol_k: 0.38,
    hud_step_sound_vol_k: 0.21,
  },
  attachable_item: {
    GroupControlSection: "spawn_group",
    discovery_dependency: "",
    $spawn: quoted("equipment\\attachable_item"),
    cform: "skeleton",
    class: "II_ATTCH",
    cost: 100,
    inv_name: "Attachable item",
    inv_name_short: "Attachable item",
    inv_weight: 0.5,
    inv_grid_width: 2,
    inv_grid_height: 1,
    inv_grid_x: 16,
    inv_grid_y: 12,
    attach_angle_offset: [0, -3.14, 1.6],
    attach_position_offset: [0.105, 0.0, 0.085],
    attach_bone_name: "bip01_head",
  },
  new_attachable_item: {
    GroupControlSection: "spawn_group",
    discovery_dependency: "",
    $spawn: "equipment\\new_attachable_item",
    cform: "skeleton",
    class: "II_BTTCH",
    cost: 100,
    inv_name: "Attachable item",
    inv_name_short: "Attachable item",
    inv_weight: 0.5,
    inv_grid_width: 2,
    inv_grid_height: 1,
    inv_grid_x: 16,
    inv_grid_y: 12,
    attach_angle_offset: [0, -3.14, 1.6],
    attach_position_offset: [0.105, 0.0, 0.085],
    attach_bone_name: "bip01_head",
  },
  hand_radio: {
    [LTX_EXTEND]: "identity_immunities",
    GroupControlSection: "spawn_group",
    discovery_dependency: "",
    $spawn: quoted("equipment\\hand_radio"),
    cform: "skeleton",
    class: "II_ATTCH",
    visual: "dynamics\\devices\\dev_fmradio\\dev_fmradio.ogf",
    cost: 0,
    inv_name: "hand_radio",
    inv_name_short: "hand_radio",
    inv_weight: 0.5,
    inv_grid_width: 2,
    inv_grid_height: 1,
    inv_grid_x: 16,
    inv_grid_y: 12,
    attach_angle_offset: [-1.5708, 0.1919, 3.1416],
    attach_position_offset: [0.075, 0.066, 0.023],
    attach_bone_name: "bip01_l_hand",
    auto_attach: false,
  },
  hand_radio_r: {
    [LTX_EXTEND]: "identity_immunities",
    GroupControlSection: "spawn_group",
    discovery_dependency: "",
    $spawn: quoted("equipment\\hand_radio_r"),
    cform: "skeleton",
    class: "II_ATTCH",
    visual: "dynamics\\devices\\dev_fmradio\\dev_fmradio.ogf",
    cost: 0,
    inv_name: "hand_radio",
    inv_name_short: "hand_radio",
    inv_weight: 0.5,
    inv_grid_width: 2,
    inv_grid_height: 1,
    inv_grid_x: 16,
    inv_grid_y: 12,
    attach_angle_offset: [1.571, 0.75, 0.0],
    attach_position_offset: [0.015, -0.084, 0.023],
    attach_bone_name: "bip01_r_hand",
    auto_attach: false,
  },
  breakable_object: {
    class: "O_BRKBL",
    remove_time: 10,
    hit_break_threthhold: 0,
    collision_break_threthhold: 2000,
    immunity_factor: 1.3,
  },
  climable_object: {
    class: "O_CLMBL",
  },
  zone_team_base: {
    $spawn: "network\\team base",
    class: "Z_TEAMBS",
    GroupControlSection: "spawn_group_zone",
  },
  multiplayer_skins: {
    stalker_killer_head_1: [0, 380],
    stalker_killer_antigas: [128, 380],
    stalker_killer_head_3: [256, 380],
    stalker_killer_mask: [384, 380],
    stalker_killer_exoskeleton: [512, 380],
    stalker_sci_killer: [640, 380],
    stalker_killer_military: [768, 380],
    stalker_sv_balon_10: [0, 705],
    stalker_sv_hood_9: [128, 705],
    stalker_sv_rukzak_3: [256, 705],
    stalker_sv_rukzak_2: [384, 705],
    stalker_sv_exoskeleton: [512, 705],
    stalker_sci_svoboda: [640, 705],
    stalker_sv_military: [768, 705],
  },
  main_ingame_indicators_thresholds: {
    radiation: [0.1, 0.25, 0.4, 0.55, 0.7],
    wounds: [0.01, 0.2, 0.4, 0.6, 0.8],
    jammed: [0.5, 0.6, 0.7, 0.8, 0.9],
    starvation: [0.5, 0.6, 0.7, 0.8, 0.9],
    fatigue: [0.3, 0.6, 0.7, 0.8, 0.9],
  },
  tutorial_conditions_thresholds: {
    max_power: 0.75,
    power: 0.1,
    bleeding: 0.4,
    satiety: 0.5,
    radiation: 0.1,
    weapon_jammed: 0.9,
    psy_health: 0.5,
  },
  squad_manager: {
    schedule_min: 1,
    schedule_max: 999,
  },
  agent_manager: {
    schedule_min: 100,
    schedule_max: 1000,
  },
  custom_script_object: {
    GroupControlSection: "spawn_group",
    discovery_dependency: "",
    $spawn: quoted("scripts\\custom_object"),
    cform: "skeleton",
    class: "NW_ATTCH",
    visual: "dynamics\\devices\\dev_fmradio\\dev_fmradio.ogf",
    cost: 0,
    inv_name: "custom_script_object",
    inv_name_short: "custom_script_object",
    inv_weight: 0.5,
    inv_grid_width: 2,
    inv_grid_height: 1,
    inv_grid_x: 16,
    inv_grid_y: 12,
    attach_angle_offset: [0, 0, 0],
    attach_position_offset: [0.08, 0.04, 0.03],
    attach_bone_name: "bip01_r_hand",
  },
  ph_skeleton_object: {
    class: "P_SKELET",
    remove_time: 120,
  },
  script: {
    current_server_entity_version: 12,
  },
  space_restrictor: {
    GroupControlSection: "spawn_group_restrictor",
    $spawn: quoted("ai\\space_restrictor"),
    class: "SPC_RS_S",
    script_binding: "bind.restrictor",
    shape_transp_color: [0, 255, 0, 24],
    shape_edge_color: [32, 32, 32, 255],
  },
  camp_zone: {
    GroupControlSection: "spawn_group_restrictor",
    $spawn: quoted("ai\\camp"),
    $prefetch: 16,
    $def_sphere: 2,
    class: "SPC_RS_S",
    script_binding: "bind.camp",
    shape_transp_color: [0, 0, 255, 24],
    shape_edge_color: [32, 32, 32, 255],
  },
  anomal_zone: {
    [LTX_EXTEND]: "space_restrictor",
    GroupControlSection: "spawn_group_zone",
    $spawn: quoted("ai\\anomal_zone"),
    $def_sphere: 2,
    $prefetch: 16,
    script_binding: "bind.anomalyZone",
    shape_transp_color: [240, 217, 182, 58],
    shape_edge_color: [32, 32, 32, 255],
  },
  collision_damage: {
    bonce_damage_factor_for_objects: 1,
  },
  pkm_visual_memory: {
    min_view_distance: 1,
    max_view_distance: 1,
    visibility_threshold: 50,
    always_visible_distance: 1,
    time_quant: 0.00001,
    decrease_value: 0.1,
    velocity_factor: 0.5,
    luminocity_factor: 0.5,
    transparency_threshold: 0.4,
    view_fov_deg: 90,
    view_aspect: 1,
    view_far_plane: 100,
  },
  details: {
    swing_normal_amp1: 0.1,
    swing_normal_amp2: 0.05,
    swing_normal_rot1: 30.0,
    swing_normal_rot2: 1.0,
    swing_normal_speed: 2.0,
    swing_fast_amp1: 0.35,
    swing_fast_amp2: 0.2,
    swing_fast_rot1: 5,
    swing_fast_rot2: 0.5,
    swing_fast_speed: 0.5,
  },
  ph_capture_visuals: {
    /*
     * ;NPC
     * ;actors\stalker_bandit\stalker_bandit_1
     * ;actors\stalker_bandit\stalker_bandit_2
     * ;actors\stalker_bandit\stalker_bandit_3
     * ;actors\stalker_bandit\stalker_bandit_3_face_1
     * ;actors\stalker_bandit\stalker_bandit_3_face_2
     * ;actors\stalker_bandit\stalker_bandit_3_mask
     * ;actors\stalker_bandit\stalker_bandit_4
     * ;actors\stalker_dolg\stalker_dolg_1
     * ;actors\stalker_dolg\stalker_dolg_2
     * ;actors\stalker_dolg\stalker_dolg_2_face_1
     * ;actors\stalker_dolg\stalker_dolg_2_face_2
     * ;actors\stalker_dolg\stalker_dolg_2_mask
     * ;actors\stalker_dolg\stalker_dolg_3
     * ;actors\stalker_dolg\stalker_dolg_4
     * ;actors\stalker_freedom\stalker_freedom_1
     * ;actors\stalker_freedom\stalker_freedom_2
     * ;actors\stalker_freedom\stalker_freedom_2_face_1
     * ;actors\stalker_freedom\stalker_freedom_2_face_2
     * ;actors\stalker_freedom\stalker_freedom_2_mask
     * ;actors\stalker_freedom\stalker_freedom_3
     * ;actors\stalker_freedom\stalker_freedom_4
     * ;actors\stalker_hero\stalker_hero_1
     * ;actors\stalker_hero\stalker_hero_stc_strelok
     * ;actors\stalker_lesnik\stalker_lesnik_1
     * ;actors\stalker_merc\stalker_merc_2
     * ;actors\stalker_merc\stalker_merc_4
     * ;actors\stalker_monolith\stalker_monolith_1
     * ;actors\stalker_monolith\stalker_monolith_2
     * ;actors\stalker_monolith\stalker_monolith_3
     * ;actors\stalker_monolith\stalker_monolith_4
     * ;actors\stalker_nebo\stalker_nebo_1
     * ;actors\stalker_nebo\stalker_nebo_2
     * ;actors\stalker_nebo\stalker_nebo_2_face_1
     * ;actors\stalker_nebo\stalker_nebo_2_face_2
     * ;actors\stalker_nebo\stalker_nebo_2_face_3
     * ;actors\stalker_nebo\stalker_nebo_2_mask
     * ;actors\stalker_nebo\stalker_nebo_3
     * ;actors\stalker_neutral\stalker_neutral_1
     * ;actors\stalker_neutral\stalker_neutral_2
     * ;actors\stalker_neutral\stalker_neutral_2_face_1
     * ;actors\stalker_neutral\stalker_neutral_2_face_2
     * ;actors\stalker_neutral\stalker_neutral_2_mask
     * ;actors\stalker_neutral\stalker_neutral_3
     * ;actors\stalker_neutral\stalker_neutral_4
     * ;actors\stalker_soldier\stalker_soldier_1
     * ;actors\stalker_soldier\stalker_soldier_2
     * ;actors\stalker_soldier\stalker_soldier_2_face_1
     * ;actors\stalker_soldier\stalker_soldier_3
     * ;actors\stalker_soldier\stalker_soldier_4
     * ;actors\stalker_trader\stalker_trader_1
     * ;actors\stalker_ucheniy\stalker_ucheniy_1
     * ;actors\stalker_zombied\stalker_zombied_1
     * ;actors\stalker_zombied\stalker_zombied_2
     * ;actors\stalker_zombied\stalker_zombied_3
     * ;actors\stalker_zombied\stalker_zombied_4
     *
     * ;Monsters
     * ;monsters\controller\controller_1
     * ;monsters\controller\controller_2
     * ;monsters\controller\controller_3
     * ;monsters\controller\controller_4
     * ;monsters\controller\controller_dead
     * ;monsters\crow\crow
     * ;monsters\dog\dog
     * ;monsters\dog\dog_bulterier
     * ;monsters\dog\dog_bulterier_dead
     * ;monsters\dog\dog_dead
     * ;monsters\dog\dog_red
     * ;monsters\dog\dog_red_dead
     * ;monsters\dog\dog_white
     * ;monsters\dog\dog_white_dead
     * ;monsters\flesh\flesh
     * ;monsters\flesh\flesh_dead
     * ;monsters\flesh\flesh_strong
     * ;monsters\krovosos\krovosos
     * ;monsters\krovosos\krovosos_dead
     * ;monsters\krovosos\krovosos_strong
     * ;monsters\krovosos\krovosos_strong_xray
     * ;monsters\krovosos\krovosos_xray
     * ;monsters\mutant_boar\mutant_boar
     * ;monsters\mutant_boar\mutant_boar_dead
     * ;monsters\mutant_boar\mutant_boar_strong
     * ;monsters\poltergeist\poltergeist
     * ;monsters\poltergeist\poltergeist_dead
     * ;monsters\poltergeist\poltergeist_strong
     * ;monsters\pseudodog\pseudodog
     * ;monsters\pseudodog\pseudodog_dead
     * ;monsters\pseudodog\pseudodog_grey
     * ;monsters\pseudodog\pseudodog_grey_dead
     * ;monsters\rat\rat_1
     * ;monsters\snork\snork
     * ;monsters\snork\snork_dead
     * ;monsters\tushkano\tushkano
     * ;monsters\tushkano\tushkano_dead
     */
  },
};