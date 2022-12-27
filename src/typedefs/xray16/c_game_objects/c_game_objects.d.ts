export {};

declare global {
  /**
   C++ class CGameObject : DLL_Pure,ISheduled,ICollidable,IRenderable {
    CGameObject ();

    function Visual() const;

    function getEnabled() const;

    function _construct();

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Export(net_packet&);

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;

  /**
   *  C++ class game_object {
   *     const action_type_count = 6;
   *     const alifeMovementTypeMask = 0;
   *     const alifeMovementTypeRandom = 1;
   *     const animation = 2;
   *     const dialog_pda_msg = 0;
   *     const dummy = -1;
   *     const enemy = 2;
   *     const friend = 0;
   *     const game_path = 0;
   *     const info_pda_msg = 1;
   *     const level_path = 1;
   *     const movement = 0;
   *     const neutral = 1;
   *     const no_path = 3;
   *     const no_pda_msg = 2;
   *     const object = 5;
   *     const particle = 4;
   *     const patrol_path = 2;
   *     const relation_attack = 1;
   *     const relation_fight_help_human = 2;
   *     const relation_fight_help_monster = 4;
   *     const relation_kill = 0;
   *     const sound = 3;
   *     const watch = 1;
   *
   *     property bleeding;
   *     property health;
   *     property morale;
   *     property power;
   *     property psy_health;
   *     property radiation;
   *
   *     function memory_time(const game_object&);
   *
   *     function dont_has_info(string);
   *
   *     function max_ignore_monster_distance(const number&);
   *     function max_ignore_monster_distance() const;
   *
   *     function best_item();
   *
   *     function disable_info_portion(string);
   *
   *     function add_animation(string, boolean, boolean);
   *     function add_animation(string, boolean, vector, vector, boolean);
   *
   *     function get_script() const;
   *
   *     function enable_night_vision(boolean);
   *
   *     function buy_supplies(ini_file*, string);
   *
   *     function sound_voice_prefix() const;
   *
   *     function use_smart_covers_only() const;
   *     function use_smart_covers_only(boolean);
   *
   *     function external_sound_start(string);
   *
   *     function get_dest_smart_cover_name();
   *
   *     function memory_visible_objects() const;
   *
   *     function who_hit_name();
   *
   *     function lookout_max_time(number);
   *     function lookout_max_time() const;
   *
   *     function in_current_loophole_fov(vector) const;
   *
   *     function disable_trade();
   *
   *     function active_item();
   *
   *     function mental_state() const;
   *
   *     function clear_animations();
   *
   *     function can_throw_grenades() const;
   *     function can_throw_grenades(boolean);
   *
   *     function set_enemy(game_object*);
   *
   *     function set_smart_cover_target_default(boolean);
   *
   *     function get_physics_object();
   *
   *     function switch_to_talk();
   *
   *     function idle_max_time(number);
   *     function idle_max_time() const;
   *
   *     function base_out_restrictions();
   *
   *     function weapon_is_scope();
   *
   *     function iterate_inventory_box(function<void>, object);
   *
   *     function set_smart_cover_target_selector(function<void>);
   *     function set_smart_cover_target_selector(function<void>, object);
   *     function set_smart_cover_target_selector();
   *
   *     function debug_planner(const action_planner*);
   *
   *     function best_weapon();
   *
   *     function active_slot();
   *
   *     function who_hit_section_name();
   *
   *     function inventory_for_each(const function<void>&);
   *
   *     function disable_talk();
   *
   *     function relation(game_object*);
   *
   *     function set_previous_point(number);
   *
   *     function set_item(enum MonsterSpace::EObjectAction);
   *     function set_item(enum MonsterSpace::EObjectAction, game_object*);
   *     function set_item(enum MonsterSpace::EObjectAction, game_object*, number);
   *     function set_item(enum MonsterSpace::EObjectAction, game_object*, number, number);
   *
   *     function set_smart_cover_target_fire();
   *
   *     function set_community_goodwill(string, number);
   *
   *     function team() const;
   *
   *     function get_smart_cover_description() const;
   *
   *     function set_ammo_elapsed(number);
   *
   *     function active_zone_contact(number);
   *
   *     function set_smart_cover_target_lookout();
   *
   *     function action_count() const;
   *
   *     function set_dest_smart_cover(string);
   *     function set_dest_smart_cover();
   *
   *     function get_dest_smart_cover();
   *
   *     function get_current_outfit_protection(number);
   *
   *     function restore_sound_threshold();
   *
   *     function object_count() const;
   *
   *     function is_talk_enabled();
   *
   *     function animation_slot() const;
   *
   *     function get_current_direction();
   *
   *     function action() const;
   *
   *     function give_talk_message(string, string, string);
   *
   *     function not_yet_visible_objects() const;
   *
   *     function set_mental_state(enum MonsterSpace::EMentalState);
   *
   *     function squad() const;
   *
   *     function reset_action_queue();
   *
   *     function burer_set_force_gravi_attack(boolean);
   *
   *     function can_select_weapon() const;
   *     function can_select_weapon(boolean);
   *
   *     function set_actor_direction(number);
   *
   *     function drop_item(game_object*);
   *
   *     function add_restrictions(string, string);
   *
   *     function get_monster_hit_info();
   *
   *     function memory_hit_objects() const;
   *
   *     function bind_object(object_binder*);
   *
   *     function weapon_silencer_status();
   *
   *     function get_bone_id(string) const;
   *
   *     function binded_object();
   *
   *     function path_completed() const;
   *
   *     function active_detector() const;
   *
   *     function release_stand_sleep_animation();
   *
   *     function set_fastcall(const function<boolean>&, object);
   *
   *     function set_smart_cover_target(vector);
   *     function set_smart_cover_target(game_object*);
   *     function set_smart_cover_target();
   *
   *     function set_start_point(number);
   *
   *     function set_fov(number);
   *
   *     function set_path_type(enum MovementManager::EPathType);
   *
   *     function weapon_strapped() const;
   *
   *     function get_ammo_total() const;
   *
   *     function best_danger();
   *
   *     function restore_max_ignore_monster_distance();
   *
   *     function set_collision_off(boolean);
   *
   *     function enable_memory_object(game_object*, boolean);
   *
   *     function lookout_min_time(number);
   *     function lookout_min_time() const;
   *
   *     function get_current_outfit() const;
   *
   *     function animation_count() const;
   *
   *     function disable_inv_upgrade();
   *
   *     function memory_sound_objects() const;
   *
   *     function activate_slot(number);
   *
   *     function get_hanging_lamp();
   *
   *     function get_force_anti_aim();
   *
   *     function enable_inv_upgrade();
   *
   *     function set_smart_cover_target_idle();
   *
   *     function invulnerable() const;
   *     function invulnerable(boolean);
   *
   *     function movement_type() const;
   *
   *     function explode(number);
   *
   *     function remove_home();
   *
   *     function condition() const;
   *
   *     function switch_to_trade();
   *
   *     function set_dest_level_vertex_id(number);
   *
   *     function deadbody_closed(boolean);
   *
   *     function eat(game_object*);
   *
   *     function clsid() const;
   *
   *     function register_door_for_npc();
   *
   *     function get_script_name() const;
   *
   *     function set_sympathy(number);
   *
   *     function torch_enabled() const;
   *
   *     function sympathy();
   *
   *     function spawn_ini() const;
   *
   *     function drop_item_and_teleport(game_object*, vector);
   *
   *     function get_campfire();
   *
   *     function get_movement_speed() const;
   *
   *     function set_body_state(enum MonsterSpace::EBodyState);
   *
   *     function in_loophole_fov(string, string, vector) const;
   *
   *     function set_invisible(boolean);
   *
   *     function in_smart_cover() const;
   *
   *     function has_info(string);
   *
   *     function set_enemy_callback();
   *     function set_enemy_callback(const function<boolean>&);
   *     function set_enemy_callback(const function<boolean>&, object);
   *
   *     function play_sound(number);
   *     function play_sound(number, number);
   *     function play_sound(number, number, number);
   *     function play_sound(number, number, number, number);
   *     function play_sound(number, number, number, number, number);
   *     function play_sound(number, number, number, number, number, number);
   *
   *     function get_visual_name() const;
   *
   *     function set_movement_selection_type(enum ESelectionType);
   *
   *     function disable_anomaly();
   *
   *     function motivation_action_manager(game_object*);
   *
   *     function bone_position(string) const;
   *
   *     function object(string);
   *     function object(number);
   *
   *     function fov() const;
   *
   *     function set_default_panic_threshold();
   *
   *     function set_actor_relation_flags(flags32);
   *
   *     function character_name();
   *
   *     function lock_door_for_npc();
   *
   *     function hide_weapon();
   *
   *     function is_body_turning() const;
   *
   *     function set_dest_game_vertex_id(number);
   *
   *     function marked_dropped(game_object*);
   *
   *     function set_character_rank(number);
   *
   *     function patrol_path_make_inactual();
   *
   *     function fake_death_stand_up();
   *
   *     function character_rank();
   *
   *     function remove_sound(number);
   *
   *     function set_detail_path_type(enum DetailPathManager::EDetailPathType);
   *
   *     function extrapolate_length() const;
   *     function extrapolate_length(number);
   *
   *     function death_sound_enabled(boolean);
   *     function death_sound_enabled() const;
   *
   *     function play_cycle(string);
   *     function play_cycle(string, boolean);
   *
   *     function weapon_is_grenadelauncher();
   *
   *     function set_capture_anim(game_object*, string, const vector&, number);
   *
   *     function character_icon();
   *
   *     function patrol();
   *
   *     function story_id() const;
   *
   *     function in_restrictions();
   *
   *     function unlock_door_for_npc();
   *
   *     function buy_item_condition_factor(number);
   *
   *     function visibility_threshold() const;
   *
   *     function sniper_update_rate(boolean);
   *     function sniper_update_rate() const;
   *
   *     function section() const;
   *
   *     function get_current_point_index();
   *
   *     function stop_particles(string, string);
   *
   *     function set_alien_control(boolean);
   *
   *     function inv_box_can_take(boolean);
   *
   *     function set_patrol_path(
   *       string,
   *       enum PatrolPathManager::EPatrolStartType,
   *       enum PatrolPathManager::EPatrolRouteType,
   *       boolean
   *      );
   *
   *     function allow_sprint(boolean);
   *
   *     function special_danger_move(boolean);
   *     function special_danger_move();
   *
   *     function is_level_changer_enabled();
   *
   *     function enable_level_changer(boolean);
   *
   *     function actor_look_at_point(vector);
   *
   *     function make_item_active(game_object*);
   *
   *     function set_const_force(const vector&, number, number);
   *
   *     function sell_condition(ini_file*, string);
   *     function sell_condition(number, number);
   *
   *     function aim_bone_id(string);
   *     function aim_bone_id() const;
   *
   *     function restore_default_start_dialog();
   *
   *     function change_team(number, number, number);
   *
   *     function set_trader_sound(string, string);
   *
   *     function aim_time(game_object*, number);
   *     function aim_time(game_object*);
   *
   *     function direction() const;
   *
   *     function kill(game_object*);
   *
   *     function cost() const;
   *
   *     function get_artefact();
   *
   *     function body_state() const;
   *
   *     function skip_transfer_enemy(boolean);
   *
   *     function see(const game_object*);
   *     function see(string);
   *
   *     function critically_wounded();
   *
   *     function idle_min_time(number);
   *     function idle_min_time() const;
   *
   *     function info_add(string);
   *
   *     function sight_params();
   *
   *     function unload_magazine();
   *
   *     function set_character_community(string, number, number);
   *
   *     function take_items_enabled(boolean);
   *     function take_items_enabled() const;
   *
   *     function set_sight(enum SightManager::ESightType, vector*, number);
   *     function set_sight(enum SightManager::ESightType, boolean, boolean);
   *     function set_sight(enum SightManager::ESightType, vector&, boolean);
   *     function set_sight(enum SightManager::ESightType, vector*);
   *     function set_sight(game_object*);
   *     function set_sight(game_object*, boolean);
   *     function set_sight(game_object*, boolean, boolean);
   *     function set_sight(game_object*, boolean, boolean, boolean);
   *
   *     function set_visual_memory_enabled(boolean);
   *
   *     function wounded() const;
   *     function wounded(boolean);
   *
   *     function remove_restrictions(string, string);
   *
   *     function get_holder_class();
   *
   *     function money();
   *
   *     function disable_hit_marks(boolean);
   *     function disable_hit_marks() const;
   *
   *     function is_there_items_to_pickup() const;
   *
   *     function location_on_path(number, vector*);
   *
   *     function weapon_unstrapped() const;
   *
   *     function sound_prefix() const;
   *     function sound_prefix(string);
   *
   *     function set_task_state(enum ETaskState, string);
   *
   *     function show_condition(ini_file*, string);
   *
   *     function add_sound(string, number, enum ESoundTypes, number, number, number);
   *     function add_sound(string, number, enum ESoundTypes, number, number, number, string);
   *
   *     function max_health() const;
   *
   *     function restore_ignore_monster_threshold();
   *
   *     function set_queue_size(number);
   *
   *     function buy_condition(ini_file*, string);
   *     function buy_condition(number, number);
   *
   *     function make_object_visible_somewhen(game_object*);
   *
   *     function jump(const vector&, number);
   *
   *     function restore_weapon();
   *
   *     function inv_box_can_take_status();
   *
   *     function force_visibility_state(number);
   *
   *     function night_vision_enabled() const;
   *
   *     function start_particles(string, string);
   *
   *     function enable_vision(boolean);
   *
   *     function vertex_in_direction(number, vector, number) const;
   *
   *     function set_dest_loophole(string);
   *     function set_dest_loophole();
   *
   *     function detail_path_type() const;
   *
   *     function group_throw_time_interval() const;
   *     function group_throw_time_interval(number);
   *
   *     function is_inv_box_empty();
   *
   *     function target_body_state() const;
   *
   *     function info_clear();
   *
   *     function head_orientation() const;
   *
   *     function inside(const vector&, number) const;
   *     function inside(const vector&) const;
   *
   *     function set_nonscript_usable(boolean);
   *
   *     function set_tip_text_default();
   *
   *     function set_tip_text(string);
   *
   *     function get_current_holder();
   *
   *     function get_physics_shell() const;
   *
   *     function set_actor_position(vector);
   *
   *     function unregister_in_combat();
   *
   *     function remove_all_restrictions();
   *
   *     function get_car();
   *
   *     function in_current_loophole_range(vector) const;
   *
   *     function mass() const;
   *
   *     function active_sound_count();
   *     function active_sound_count(boolean);
   *
   *     function get_anomaly_power();
   *
   *     function enable_anomaly();
   *
   *     function item_in_slot(number) const;
   *
   *     function get_actor_relation_flags() const;
   *
   *     function is_trade_enabled();
   *
   *     function set_sound_mask(number);
   *
   *     function community_goodwill(string);
   *
   *     function vision_enabled() const;
   *
   *     function is_door_locked_for_npc() const;
   *
   *     function fake_death_fall_down();
   *
   *     function mark_item_dropped(game_object*);
   *
   *     function ignore_monster_threshold(number);
   *     function ignore_monster_threshold() const;
   *
   *     function target_movement_type() const;
   *
   *     function attachable_item_enabled() const;
   *
   *     function change_character_reputation(number);
   *
   *     function character_reputation();
   *
   *     function sniper_fire_mode(boolean);
   *     function sniper_fire_mode() const;
   *
   *     function set_smart_cover_target_fire_no_lookout();
   *
   *     function transfer_money(number, game_object*);
   *
   *     function on_door_is_open();
   *
   *     function general_goodwill(game_object*);
   *
   *     function change_goodwill(number, game_object*);
   *
   *     function force_set_goodwill(number, game_object*);
   *
   *     function set_goodwill(number, game_object*);
   *
   *     function goodwill(game_object*);
   *
   *     function stop_talk();
   *
   *     function profile_name();
   *
   *     function get_start_dialog();
   *
   *     function set_start_dialog(string);
   *
   *     function set_level_changer_invitation(string);
   *
   *     function run_talk_dialog(game_object*, boolean);
   *
   *     function weapon_scope_status();
   *
   *     function set_custom_panic_threshold(number);
   *
   *     function weapon_grenadelauncher_status();
   *
   *     function weapon_is_silencer();
   *
   *     function allow_break_talk_dialog(boolean);
   *
   *     function is_talking();
   *
   *     function deadbody_can_take_status();
   *
   *     function switch_to_upgrade();
   *
   *     function on_door_is_closed();
   *
   *     function apply_loophole_direction_distance(number);
   *     function apply_loophole_direction_distance() const;
   *
   *     function give_money(number);
   *
   *     function set_relation(enum ALife::ERelationType, game_object*);
   *
   *     function out_restrictions();
   *
   *     function transfer_item(game_object*, game_object*);
   *
   *     function enable_attachable_item(boolean);
   *
   *     function disable_show_hide_sounds(boolean);
   *
   *     function is_inv_upgrade_enabled();
   *
   *     function enable_trade();
   *
   *     function set_trader_global_anim(string);
   *
   *     function enable_talk();
   *
   *     function set_home(string, number, number, boolean, number);
   *     function set_home(number, number, number, boolean, number);
   *
   *     function poltergeist_get_actor_ignore();
   *
   *     function give_info_portion(string);
   *
   *     function burer_get_force_gravi_attack();
   *
   *     function inv_box_closed(boolean, string);
   *
   *     function get_task(string, boolean);
   *
   *     function set_active_task(CGameTask*);
   *
   *     function get_enemy() const;
   *
   *     function set_callback(enum GameObject::ECallbackType, const function<void>&);
   *     function set_callback(enum GameObject::ECallbackType, const function<void>&, object);
   *     function set_callback(enum GameObject::ECallbackType);
   *
   *     function get_corpse() const;
   *
   *     function give_task(CGameTask*, number, boolean, number);
   *
   *     function get_task_state(string);
   *
   *     function get_enemy_strength() const;
   *
   *     function path_type() const;
   *
   *     function rank();
   *
   *     function range() const;
   *
   *     function set_anomaly_power(number);
   *
   *     function deadbody_can_take(boolean);
   *
   *     function give_talk_message2(string, string, string, string);
   *
   *     function set_vis_state(number);
   *
   *     function get_ammo_in_magazine();
   *
   *     function give_game_news(string, string, string, number, number);
   *     function give_game_news(string, string, string, number, number, number);
   *
   *     function best_enemy();
   *
   *     function death_time() const;
   *
   *     function get_visibility_state();
   *
   *     function center();
   *
   *     function best_cover(const vector&, const vector&, number, number, number);
   *
   *     function accuracy() const;
   *
   *     function set_desired_position();
   *     function set_desired_position(const vector*);
   *
   *     function poltergeist_set_actor_ignore(boolean);
   *
   *     function accessible(const vector&);
   *     function accessible(number);
   *
   *     function suitable_smart_cover(game_object*);
   *
   *     function deadbody_closed_status();
   *
   *     function set_patrol_extrapolate_callback();
   *     function set_patrol_extrapolate_callback(const function<boolean>&);
   *     function set_patrol_extrapolate_callback(const function<boolean>&, object);
   *
   *     function set_range(number);
   *
   *     function attachable_item_load_attach(string);
   *
   *     function in_loophole_range(string, string, vector) const;
   *
   *     function enable_torch(boolean);
   *
   *     function set_force_anti_aim(boolean);
   *
   *     function force_stand_sleep_animation(number);
   *
   *     function add_combat_sound(string, number, enum ESoundTypes, number, number, number, string);
   *
   *     function command(const entity_action*, boolean);
   *
   *     function hit(hit*);
   *
   *     function iterate_inventory(function<void>, object);
   *
   *     function set_condition(number);
   *
   *     function movement_enabled(boolean);
   *     function movement_enabled();
   *
   *     function berserk();
   *
   *     function accessible_nearest(const vector&, vector&);
   *
   *     function name() const;
   *
   *     function set_movement_type(enum MonsterSpace::EMovementType);
   *
   *     function character_community();
   *
   *     function group() const;
   *
   *     function alive() const;
   *
   *     function script(boolean, string);
   *
   *     function safe_cover(const vector&, number, number);
   *
   *     function can_script_capture() const;
   *
   *     function base_in_restrictions();
   *
   *     function level_vertex_id() const;
   *
   *     function set_trader_head_anim(string);
   *
   *     function unregister_door_for_npc();
   *
   *     function set_npc_position(vector);
   *
   *     function movement_target_reached();
   *
   *     function set_desired_direction();
   *     function set_desired_direction(const vector*);
   *
   *     function position() const;
   *
   *     function get_helicopter();
   *
   *     function get_sound_info();
   *
   *     function find_best_cover(vector);
   *
   *     function id() const;
   *
   *     function register_in_combat();
   *
   *     function set_sound_threshold(number);
   *
   *     function memory_position(const game_object&);
   *
   *     function set_visual_name(string);
   *
   *     function external_sound_stop();
   *
   *     function inv_box_closed_status();
   *
   *     function target_mental_state() const;
   *
   *     function parent() const;
   *
   *     function set_manual_invisibility(boolean);
   *
   *     function game_vertex_id() const;
   *
   *     function action_by_index(number);
   *
   *   };
   *
   */
  class XR_game_object {
    public static action_type_count: 6;
    public static alifeMovementTypeMask: 0;
    public static alifeMovementTypeRandom: 1;
    public static animation: 2;
    public static dialog_pda_msg: 0;
    public static dummy: -1;
    public static enemy: 2;
    public static friend: 0;
    public static game_path: 0;
    public static info_pda_msg: 1;
    public static level_path: 1;
    public static movement: 0;
    public static neutral: 1;
    public static no_path: 3;
    public static no_pda_msg: 2;
    public static object: 5;
    public static particle: 4;
    public static patrol_path: 2;
    public static relation_attack: 1;
    public static relation_fight_help_human: 2;
    public static relation_fight_help_monster: 4;
    public static relation_kill: 0;
    public static sound: 3;
    public static watch: 1;

    public bleeding: number;
    public health: number;
    public morale: number;
    public power: number;
    public psy_health: number;
    public radiation: number;

    public id(): number;

    public story_id(): unknown;
    public object(value: string): unknown;
    public object(value: number): unknown;
    public clsid(): TXR_ClsId;

    public memory_time(another: XR_game_object): unknown;

    public dont_has_info(value: string): unknown;

    public max_ignore_monster_distance(value: number): unknown;
    public max_ignore_monster_distance(): unknown;

    public best_item(): unknown;

    public disable_info_portion(value: string): unknown;

    public add_animation(value1: string, value2: boolean, value3: boolean): unknown;
    public add_animation(
      value1: string, value2: boolean, value3: XR_vector, value4: XR_vector, value: boolean
    ): unknown;

    public get_script(): unknown | null;

    public enable_night_vision(value: boolean): unknown;

    public buy_supplies(value1: unknown, value2: string): unknown;

    public sound_voice_prefix(): unknown;

    public use_smart_covers_only(): unknown;
    public use_smart_covers_only(value: boolean): unknown;

    public external_sound_start(value: string): unknown;

    public get_dest_smart_cover_name(): unknown;

    public memory_visible_objects(): unknown;

    public who_hit_name(): unknown;

    public lookout_max_time(value: number): unknown;
    public lookout_max_time(): unknown;

    public in_current_loophole_fov(vector: XR_vector): unknown;

    public disable_trade(): unknown;

    public active_item(): unknown;

    public mental_state(): unknown;

    public clear_animations(): unknown;

    public can_throw_grenades(): unknown;
    public can_throw_grenades(value: boolean): unknown;

    public set_enemy(object: XR_game_object): unknown;

    public set_smart_cover_target_default(value: boolean): unknown;

    public get_physics_object(): unknown;

    public switch_to_talk(): unknown;

    public idle_max_time(time: number): unknown;
    public idle_max_time(): unknown;

    public base_out_restrictions(): unknown;

    public weapon_is_scope(): unknown;

    public iterate_inventory_box(cb: () => void, object: XR_game_object): unknown;

    public set_smart_cover_target_selector(cb: () => void): unknown;
    public set_smart_cover_target_selector(cb: () => void, object: XR_game_object): unknown;
    public set_smart_cover_target_selector(): unknown;

    public debug_planner(action_planner: unknown): unknown;

    public best_weapon(): unknown;

    public active_slot(): unknown;

    public who_hit_section_name(): unknown;

    public inventory_for_each(cb: () => void): unknown;

    public disable_talk(): unknown;

    public relation(game_object: XR_game_object): unknown;

    public set_previous_point(point: number): unknown;

    public set_item(action: unknown /* enum MonsterSpace::EObjectAction */): unknown;
    public set_item(action: unknown /* enum MonsterSpace::EObjectAction */, game_object: XR_game_object): unknown;
    public set_item(
      action: unknown /* enum MonsterSpace::EObjectAction */,
      game_object: XR_game_object,
      value: number
    ): unknown;
    public set_item(
      action: unknown /* enum MonsterSpace::EObjectAction */,
      game_object: XR_game_object,
      value1: number,
      value2: number
    ): unknown;

    public set_smart_cover_target_fire(): unknown;

    public set_community_goodwill(first: string, second: number): unknown;

    public team(): unknown;

    public get_smart_cover_description(): unknown;

    public set_ammo_elapsed(value: number): unknown;

    public active_zone_contact(value: number): unknown;

    public set_smart_cover_target_lookout(): unknown;

    public action_count(): unknown;

    public set_dest_smart_cover(value: string): unknown;
    public set_dest_smart_cover(): unknown;

    public get_dest_smart_cover(): unknown;

    public get_current_outfit_protection(value: number): unknown;

    public restore_sound_threshold(): unknown;

    public object_count(): unknown;

    public is_talk_enabled(): unknown;

    public animation_slot(): unknown;

    public get_current_direction(): unknown;

    public action(): unknown;

    public give_talk_message(value1: string, value2: string, value3: string): unknown;

    public not_yet_visible_objects(): unknown;

    public set_mental_state(state: unknown /** EMentalState */): unknown;

    public squad(): unknown;

    public reset_action_queue(): unknown;

    public burer_set_force_gravi_attack(value: boolean): unknown;

    public can_select_weapon(): unknown;
    public can_select_weapon(value: boolean): unknown;

    public set_actor_direction(value: number): unknown;

    public drop_item(game_object: XR_game_object): unknown;

    public add_restrictions(value1: string, value2: string): unknown;

    public get_monster_hit_info(): unknown;

    public memory_hit_objects(): unknown;

    public bind_object(binder: unknown /** base binder */): unknown;

    public weapon_silencer_status(): unknown;

    public get_bone_id(value: string): unknown;

    public binded_object(): unknown;

    public path_completed(): unknown;

    public active_detector(): unknown;

    public release_stand_sleep_animation(): unknown;

    public set_fastcall(cb: () => boolean, object: XR_game_object): unknown;

    public set_smart_cover_target(vector: XR_vector): unknown;
    public set_smart_cover_target(game_object: XR_game_object): unknown;
    public set_smart_cover_target(): unknown;

    public set_start_point(point: number): unknown;

    public set_fov(fov: number): unknown;

    public set_path_type(type: unknown /** enum MovementManager::EPathType */): unknown;

    public weapon_strapped(): unknown;

    public get_ammo_total(): unknown;

    public best_danger(): unknown;

    public restore_max_ignore_monster_distance(): unknown;

    public set_collision_off(value: boolean): unknown;

    public enable_memory_object(game_object: XR_game_object, value: boolean): unknown;

    public lookout_min_time(time: number): unknown;
    public lookout_min_time(): unknown;

    public get_current_outfit(): unknown;

    public animation_count(): unknown;

    public disable_inv_upgrade(): unknown;

    public memory_sound_objects(): unknown;

    public activate_slot(index: number): unknown;

    public get_hanging_lamp(): unknown;

    public get_force_anti_aim(): unknown;

    public enable_inv_upgrade(): unknown;

    public set_smart_cover_target_idle(): unknown;

    public invulnerable(): unknown;
    public invulnerable(value: boolean): unknown;

    public movement_type(): unknown;

    public explode(value: number): unknown;

    public remove_home(): unknown;

    public condition(): unknown;

    public switch_to_trade(): unknown;

    public set_dest_level_vertex_id(value: number): unknown;

    public deadbody_closed(value: boolean): unknown;

    public eat(game_object: XR_game_object): unknown;

    public register_door_for_npc(): unknown;

    public get_script_name(): unknown;

    public set_sympathy(value: number): unknown;

    public torch_enabled(): unknown;

    public sympathy(): unknown;

    public spawn_ini(): XR_ini_file;

    public drop_item_and_teleport(game_object: XR_game_object, vector: XR_vector): unknown;

    public get_campfire(): unknown;

    public get_movement_speed(): unknown;

    public set_body_state(state: unknown /** enum MonsterSpace::EBodyState */): unknown;

    public in_loophole_fov(value1: string, valu2:string, value3:XR_vector): unknown;

    public set_invisible(value: boolean): unknown;

    public in_smart_cover(): unknown;

    public has_info(value: string): unknown;

    public set_enemy_callback(): unknown;
    public set_enemy_callback(cb: () => boolean): unknown;
    public set_enemy_callback(cb: () => boolean, object: XR_game_object): unknown;

    public play_sound(value1:number): unknown;
    public play_sound(value1:number, value2:number): unknown;
    public play_sound(value1:number, value2:number, value3:number): unknown;
    public play_sound(value1:number, value2:number, value3:number, value4:number): unknown;
    public play_sound(value1:number, value2:number, value3:number, value4:number, value5:number): unknown;
    public play_sound(
      value1:number, value2:number, value3:number, value4:number, value5:number, value6:number
    ): unknown;

    public get_visual_name(): unknown;

    public set_movement_selection_type(type: unknown /** enum ESelectionType */): unknown;

    public disable_anomaly(): unknown;

    public motivation_action_manager(game_object: XR_game_object): unknown;

    public bone_position(value: string): unknown;

    public fov(): unknown;

    public set_default_panic_threshold(): unknown;

    public set_actor_relation_flags(value: unknown /** flags32 */): unknown;

    public character_name(): unknown;

    public lock_door_for_npc(): unknown;

    public hide_weapon(): unknown;

    public is_body_turning(): unknown;

    public set_dest_game_vertex_id(value: number): unknown;

    public marked_dropped(game_object: XR_game_object): unknown;

    public set_character_rank(value: number): unknown;

    public patrol_path_make_inactual(): unknown;

    public fake_death_stand_up(): unknown;

    public character_rank(): unknown;

    public remove_sound(value: number): unknown;

    public set_detail_path_type(type: unknown /** enum DetailPathManager::EDetailPathType */): unknown;

    public extrapolate_length(): unknown;
    public extrapolate_length(value: number): unknown;

    public death_sound_enabled(value: boolean): unknown;
    public death_sound_enabled(): unknown;

    public play_cycle(value: string): unknown;
    public play_cycle(value1: string, value2: boolean): unknown;

    public weapon_is_grenadelauncher(): unknown;

    public set_capture_anim(game_object: XR_game_object, value1: string, vector: XR_vector, value2: number): unknown;

    public character_icon(): unknown;

    public patrol(): unknown;

    public in_restrictions(): unknown;

    public unlock_door_for_npc(): unknown;

    public buy_item_condition_factor(value: number): unknown;

    public visibility_threshold(): unknown;

    public sniper_update_rate(value: boolean): unknown;
    public sniper_update_rate(): unknown;

    public section(): unknown;

    public get_current_point_index(): unknown;

    public stop_particles(value1: string, value2: string): unknown;

    public set_alien_control(value: boolean): unknown;

    public inv_box_can_take(value: boolean): unknown;

    public set_patrol_path(
     value1: string,
    type1: unknown /** enum PatrolPathManager::EPatrolStartType*/,
    type2: unknown /** enum PatrolPathManager::EPatrolRouteType*/,
    value2: boolean
  ): unknown;

    public allow_sprint(value: boolean): unknown;

    public special_danger_move(value: boolean): unknown;
    public special_danger_move(): unknown;

    public is_level_changer_enabled(): unknown;

    public enable_level_changer(value: boolean): unknown;

    public actor_look_at_point(vector: XR_vector): unknown;

    public make_item_active(game_object: XR_game_object): unknown;

    public set__force(vector: XR_vector, value1: number, value2: number): unknown;

    public sell_condition(ini_file: unknown, value: string): unknown;
    public sell_condition(value1: number, value2: number): unknown;

    public aim_bone_id(value: string): unknown;
    public aim_bone_id(): unknown;

    public restore_default_start_dialog(): unknown;

    public change_team(value1: number, value2: number, value3: number): unknown;

    public set_trader_sound(value1: string, value2: string): unknown;

    public aim_time(game_object: XR_game_object, value: number): unknown;
    public aim_time(game_object: XR_game_object): unknown;

    public direction(): unknown;

    public kill(game_object: XR_game_object): unknown;

    public cost(): unknown;

    public get_artefact(): unknown;

    public body_state(): unknown;

    public skip_transfer_enemy(value: boolean): unknown;

    public see(game_object: XR_game_object): unknown;
    public see(value: string): unknown;

    public critically_wounded(): unknown;

    public idle_min_time(value: number): unknown;
    public idle_min_time(): unknown;

    public info_add(value: string): unknown;

    public sight_params(): unknown;

    public unload_magazine(): unknown;

    public set_character_community(value1: string, value2: number, value3: number): unknown;

    public take_items_enabled(value: boolean): unknown;
    public take_items_enabled(): unknown;

    public set_sight(type: unknown /** enum SightManager::ESightType */, vector: XR_vector, value: number): unknown;
    public set_sight(
      type: unknown /** enum SightManager::ESightType */, value1: XR_vector, value2: boolean, value3: boolean
    ): unknown;
    public set_sight(type: unknown /** enum SightManager::ESightType */, vector: XR_vector, value: boolean): unknown;
    public set_sight(type: unknown /** enum SightManager::ESightType */, vector: XR_vector): unknown;
    public set_sight(game_object: XR_game_object): unknown;
    public set_sight(game_object: XR_game_object, value: boolean): unknown;
    public set_sight(game_object: XR_game_object, value1: boolean, value2: boolean): unknown;
    public set_sight(game_object: XR_game_object, value1: boolean, value2: boolean, value3: boolean): unknown;

    public set_visual_memory_enabled(value: boolean): unknown;

    public wounded(): unknown;
    public wounded(value: boolean): unknown;

    public remove_restrictions(value1: string, value2: string): unknown;

    public get_holder_class(): unknown;

    public money(): unknown;

    public disable_hit_marks(value: boolean): void;
    public disable_hit_marks(): void;

    public is_there_items_to_pickup(): unknown;

    public location_on_path(value: number, vector: XR_vector): unknown;

    public weapon_unstrapped(): unknown;

    public sound_prefix(): unknown;
    public sound_prefix(value: string): unknown;

    public set_task_state(state: unknown /** enum ETaskState */, value: string): unknown;

    public show_condition(ini_file: unknown, value: string): unknown;

    public add_sound(
      value1: string, value2: number, type: unknown, value3: number, value4: number, value5: number
    ): unknown;
    public add_sound(
      value1: string, value2: number, type: unknown, value3: number, value4: number, value5: number, value6: string
    ): unknown;

    public max_health(): unknown;

    public restore_ignore_monster_threshold(): unknown;

    public set_queue_size(value: number): unknown;

    public buy_condition(ini_file: unknown, value: string): unknown;
    public buy_condition(value1: number, value2: number): unknown;

    public make_object_visible_somewhen(game_object: XR_game_object): unknown;

    public jump(vector: XR_vector, value: number): unknown;

    public restore_weapon(): unknown;

    public inv_box_can_take_status(): unknown;

    public force_visibility_state(value: number): unknown;

    public night_vision_enabled(): unknown;

    public start_particles(value1: string, value2: string): unknown;

    public enable_vision(value: boolean): unknown;

    public vertex_in_direction(value1: number, vector: XR_vector, value2: number): unknown;

    public set_dest_loophole(value: string): unknown;
    public set_dest_loophole(): unknown;

    public detail_path_type(): unknown;

    public group_throw_time_interval(): unknown;
    public group_throw_time_interval(value: number): unknown;

    public is_inv_box_empty(): unknown;

    public target_body_state(): unknown;

    public info_clear(): unknown;

    public head_orientation(): unknown;

    public inside(vector: XR_vector, value: number): unknown;
    public inside(vector: XR_vector): unknown;

    public set_nonscript_usable(value: boolean): unknown;

    public set_tip_text_default(): unknown;

    public set_tip_text(value: string): unknown;

    public get_current_holder(): unknown;

    public get_physics_shell(): unknown;

    public set_actor_position(vector: XR_vector): unknown;

    public unregister_in_combat(): unknown;

    public remove_all_restrictions(): unknown;

    public get_car(): unknown;

    public in_current_loophole_range(vector: XR_vector): unknown;

    public mass(): unknown;

    public active_sound_count(): unknown;
    public active_sound_count(value: boolean): unknown;

    public get_anomaly_power(): unknown;

    public enable_anomaly(): unknown;

    public item_in_slot(value: number): unknown;

    public get_actor_relation_flags(): unknown;

    public is_trade_enabled(): unknown;

    public set_sound_mask(value: number): unknown;

    public community_goodwill(value: string): unknown;

    public vision_enabled(): unknown;

    public is_door_locked_for_npc(): unknown;

    public fake_death_fall_down(): unknown;

    public mark_item_dropped(game_object: XR_game_object): unknown;

    public ignore_monster_threshold(value: number): unknown;
    public ignore_monster_threshold(): unknown;

    public target_movement_type(): unknown;

    public attachable_item_enabled(): unknown;

    public change_character_reputation(value: number): unknown;

    public character_reputation(): unknown;

    public sniper_fire_mode(value: boolean): unknown;
    public sniper_fire_mode(): unknown;

    public set_smart_cover_target_fire_no_lookout(): unknown;

    public transfer_money(value: number, game_object: XR_game_object): unknown;

    public on_door_is_open(): unknown;

    public general_goodwill(game_object: XR_game_object): number;

    public change_goodwill(value: number, game_object: XR_game_object): unknown;

    public force_set_goodwill(value: number, game_object: XR_game_object): unknown;

    public set_goodwill(value: number, game_object: XR_game_object): unknown;

    public goodwill(game_object: XR_game_object): unknown;

    public stop_talk(): void;

    public profile_name(): unknown;

    public get_start_dialog(): unknown;

    public set_start_dialog(value: string): unknown;

    public set_level_changer_invitation(value: string): unknown;

    public run_talk_dialog(game_object: XR_game_object, value: boolean): unknown;

    public weapon_scope_status(): unknown;

    public set_custom_panic_threshold(value: number): unknown;

    public weapon_grenadelauncher_status(): unknown;

    public weapon_is_silencer(): unknown;

    public allow_break_talk_dialog(value: boolean): unknown;

    public is_talking(): unknown;

    public deadbody_can_take_status(): unknown;

    public switch_to_upgrade(): unknown;

    public on_door_is_closed(): unknown;

    public apply_loophole_direction_distance(value: number): unknown;
    public apply_loophole_direction_distance(): unknown;

    public give_money(value: number): unknown;

    public set_relation(type: unknown, game_object: XR_game_object): unknown;

    public out_restrictions(): unknown;

    public transfer_item(game_object1: XR_game_object, game_object2: XR_game_object): unknown;

    public enable_attachable_item(value: boolean): unknown;

    public disable_show_hide_sounds(value: boolean): unknown;

    public is_inv_upgrade_enabled(): unknown;

    public enable_trade(): unknown;

    public set_trader_global_anim(value: string): unknown;

    public enable_talk(): unknown;

    public set_home(value1: string, value2:number, value3:number, value4:boolean, value5:number): unknown;
    public set_home(value1: number, value2:number, value3:number, value4:boolean, value5:number): unknown;

    public poltergeist_get_actor_ignore(): unknown;

    public give_info_portion(value: string): unknown;

    public burer_get_force_gravi_attack(): unknown;

    public inv_box_closed(value1: boolean, value2: string): unknown;

    public get_task(value1: string, value2: boolean): unknown;

    public set_active_task(task: unknown): unknown;

    public get_enemy(): unknown;

    public set_callback(type: unknown, cb: () => void): unknown;
    public set_callback(type: unknown, cb: () => void, object: XR_game_object): unknown;
    public set_callback(type: unknown): unknown;

    public get_corpse(): unknown;

    public give_task(task: unknown /** CGameTask */, value1: number, value2: boolean, value3: number): unknown;

    public get_task_state(value: string): unknown;

    public get_enemy_strength(): unknown;

    public path_type(): unknown;

    public rank(): unknown;

    public range(): unknown;

    public set_anomaly_power(value: number): unknown;

    public deadbody_can_take(value: boolean): unknown;

    public give_talk_message2(value1: string, value2: string, value3: string, value4: string): unknown;

    public set_vis_state(value: number): unknown;

    public get_ammo_in_magazine(): unknown;

    public give_game_news(value1: string, value2: string, value3: string, value4: number, value5: number): unknown;
    public give_game_news(
      value1: string, value2: string, value3: string, value4: number, value5: number, value6: number
    ): unknown;

    public best_enemy(): unknown;

    public death_time(): unknown;

    public get_visibility_state(): unknown;

    public center(): unknown;

    public best_cover(vector1: XR_vector, vector2: XR_vector, value3: number, value4: number, value5: number): unknown;

    public accuracy(): unknown;

    public set_desired_position(): unknown;
    public set_desired_position(vector: XR_vector): unknown;

    public poltergeist_set_actor_ignore(value: boolean): unknown;

    public accessible(vector: XR_vector): unknown;
    public accessible(value: number): unknown;

    public suitable_smart_cover(game_object: XR_game_object): unknown;

    public deadbody_closed_status(): unknown;

    public set_patrol_extrapolate_callback(): unknown;
    public set_patrol_extrapolate_callback(cb: () => boolean): unknown;
    public set_patrol_extrapolate_callback(cb: () => boolean, object: XR_game_object): unknown;

    public set_range(value: number): unknown;

    public attachable_item_load_attach(value: string): unknown;

    public in_loophole_range(value1: string, value2: string, vector: XR_vector): unknown;

    public enable_torch(value: boolean): unknown;

    public set_force_anti_aim(value: boolean): unknown;

    public force_stand_sleep_animation(value: number): unknown;

    public add_combat_sound(
      value1: string,
      value2: number,
      type: unknown /** enum ESoundTypes */,
      value3: number,
      value4: number,
      value5: number,
      value6: string
    ): unknown;

    public command(entity_action: XR_entity_action, value: boolean): unknown;

    public hit(hit: unknown): unknown;

    public iterate_inventory(cb: unknown /** function<void> */, object: XR_game_object): unknown;

    public set_condition(value: number): unknown;

    public movement_enabled(value: boolean): unknown;
    public movement_enabled(): unknown;

    public berserk(): unknown;

    public accessible_nearest(vector1: XR_vector, vector2: XR_vector): unknown;

    public name(): string;

    public set_movement_type(type: unknown /** MonsterSpace::EMovementType */): unknown;

    public character_community(): string;

    public group(): unknown;

    public alive(): boolean;

    public script(value1: boolean, scriptName: string): unknown;

    public safe_cover(vector: XR_vector, value1: number, value2: number): unknown;

    public can_script_capture(): unknown;

    public base_in_restrictions(): unknown;

    public level_vertex_id(): number;

    public set_trader_head_anim(value: string): unknown;

    public unregister_door_for_npc(): unknown;

    public set_npc_position(vector: XR_vector): unknown;

    public movement_target_reached(): unknown;

    public set_desired_direction(): unknown;
    public set_desired_direction(vector: XR_vector): unknown;

    public position(): XR_vector;

    public get_helicopter(): unknown;

    public get_sound_info(): unknown;

    public find_best_cover(vector: XR_vector): unknown;

    public register_in_combat(): unknown;

    public set_sound_threshold(value: number): unknown;

    public memory_position(game_object: XR_game_object): unknown;

    public set_visual_name(value: string): unknown;

    public external_sound_stop(): unknown;

    public inv_box_closed_status(): unknown;

    public target_mental_state(): unknown;

    public parent(): unknown;

    public set_manual_invisibility(value: boolean): unknown;

    public game_vertex_id(): number;

    public action_by_index(value: number): unknown;

  }

  /**
   C++ class CSnork : CGameObject {
    CSnork ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CSpaceRestrictor : CGameObject {
    CSpaceRestrictor ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CStalkerOutfit : CGameObject {
    CStalkerOutfit ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CTorch : CGameObject {
    CTorch ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CTorridZone : CGameObject {
    CTorridZone ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CZoneCampfire : CGameObject {
    CZoneCampfire ();

    function Visual() const;

    function getEnabled() const;

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function is_on();

    function turn_on();

    function turn_off();

    function net_Export(net_packet&);

    function _construct();

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CCar : CGameObject,holder {
    const eWpnActivate = 3;
    const eWpnAutoFire = 5;
    const eWpnDesiredDir = 1;
    const eWpnDesiredPos = 2;
    const eWpnFire = 4;
    const eWpnToDefaultDir = 6;

    CCar ();

    function _construct();

    function GetfHealth() const;

    function CurrentVel();

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function SetParam(number, vector);

    function net_Export(net_packet&);

    function Visual() const;

    function IsObjectVisible(game_object*);

    function SetExplodeTime(number);

    function net_Import(net_packet&);

    function HasWeapon();

    function SetfHealth(number);

    function engaged();

    function ExplodeTime();

    function FireDirDiff();

    function CarExplode();

    function CanHit();

    function getEnabled() const;

    function Action(number, number);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CGrenadeLauncher : CGameObject {
    CGrenadeLauncher ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CHelicopter : CGameObject {
    const eAlive = 0;
    const eBodyByPath = 0;
    const eBodyToPoint = 1;
    const eDead = 1;
    const eEnemyEntity = 2;
    const eEnemyNone = 0;
    const eEnemyPoint = 1;
    const eMovLanding = 4;
    const eMovNone = 0;
    const eMovPatrolPath = 2;
    const eMovRoundPath = 3;
    const eMovTakeOff = 5;
    const eMovToPoint = 1;

    property m_dead;
    property m_exploded;
    property m_flame_started;
    property m_light_started;
    property m_max_mgun_dist;
    property m_max_rocket_dist;
    property m_min_mgun_dist;
    property m_min_rocket_dist;
    property m_syncronize_rocket;
    property m_time_between_rocket_attack;
    property m_use_mgun_on_attack;
    property m_use_rocket_on_attack;

    CHelicopter ();

    function _construct();

    function SetSpeedInDestPoint(number);

    function getVisible() const;

    function LookAtPoint(vector, boolean);

    function GetRealAltitude();

    function GetCurrVelocity();

    function SetLinearAcc(number, number);

    function GoPatrolByPatrolPath(string, number);

    function GetSpeedInDestPoint(number);

    function isVisible(game_object*);

    function net_Import(net_packet&);

    function SetMaxVelocity(number);

    function SetfHealth(number);

    function GetMovementState();

    function SetEnemy(game_object*);
    function SetEnemy(vector*);

    function getEnabled() const;

    function GetfHealth() const;

    function Explode();

    function SetOnPointRangeDist(number);

    function SetFireTrailLength(number);

    function GetOnPointRangeDist();

    function GetMaxVelocity();

    function TurnLighting(boolean);

    function SetBarrelDirTolerance(number);

    function GetBodyState();

    function GetCurrVelocityVec();

    function net_Export(net_packet&);

    function SetDestPosition(vector*);

    function UseFireTrail();
    function UseFireTrail(boolean);

    function GoPatrolByRoundPath(vector, number, boolean);

    function net_Spawn(cse_abstract*);

    function GetState();

    function Die();

    function StartFlame();

    function Visual() const;

    function GetDistanceToDestPosition();

    function GetHuntState();

    function TurnEngineSound(boolean);

    function GetSafeAltitude();

    function ClearEnemy();

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CPda : CGameObject {
    CPda ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CPhysicObject : CGameObject {
    CPhysicObject ();

    function set_door_ignore_dynamics();

    function _construct();

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function play_bones_sound();

    function run_anim_back();

    function net_Export(net_packet&);

    function Visual() const;

    function unset_door_ignore_dynamics();

    function net_Import(net_packet&);

    function run_anim_forward();

    function stop_anim();

    function anim_time_get();

    function getEnabled() const;

    function anim_time_set(number);

    function stop_bones_sound();

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CExplosiveItem : CGameObject {
    CExplosiveItem ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CF1 : CGameObject {
    CF1 ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CFracture : CGameObject {
    CFracture ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CHairsZone : CGameObject {
    CHairsZone ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class hanging_lamp : CGameObject {
    hanging_lamp ();

    function Visual() const;

    function getEnabled() const;

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function turn_on();

    function turn_off();

    function net_Export(net_packet&);

    function _construct();

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class holder {
    function engaged();

    function Action(number, number);

    function SetParam(number, vector);

  };
   */
  // todo;
  /**
   C++ class CInventoryBox : CGameObject {
    CInventoryBox ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CMincer : CGameObject {
    CMincer ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CMosquitoBald : CGameObject {
    CMosquitoBald ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   * class entity_action {
   *     entity_action ();
   *     entity_action (const entity_action*);
   *
   *     function set_action(move&);
   *     function set_action(look&);
   *     function set_action(anim&);
   *     function set_action(sound&);
   *     function set_action(particle&);
   *     function set_action(object&);
   *     function set_action(cond&);
   *     function set_action(act&);
   *
   *     function move() const;
   *
   *     function particle() const;
   *
   *     function completed();
   *
   *     function object() const;
   *
   *     function all();
   *
   *     function time();
   *
   *     function look() const;
   *
   *     function sound() const;
   *
   *     function anim() const;
   *
   *   };
   *
   *  @customConstructor entity_action
   */
  class XR_entity_action {
    public constructor ();
    public constructor (entity: XR_entity_action);

    public set_action(move: unknown): void;
    public set_action(look: unknown): void;
    public set_action(anim: unknown): void;
    public set_action(sound: unknown): void;
    public set_action(particle: unknown): void;
    public set_action(objec: unknown): void;
    public set_action(cond: unknown): void;
    public set_action(act: unknown): void;

    public move(): unknown;

    public particle(): unknown;

    public completed(): unknown;

    public object(): unknown;

    public all(): unknown;

    public time(): unknown;

    public look(): unknown;

    public sound(): unknown;

    public anim(): unknown;

  }

  // todo;
  /**
   C++ class look {
    const cur_dir = 0;
    const danger = 5;
    const direction = 2;
    const fire_point = 10;
    const path_dir = 1;
    const point = 3;
    const search = 6;

    look ();
    look (enum SightManager::ESightType);
    look (enum SightManager::ESightType, vector&);
    look (enum SightManager::ESightType, game_object*);
    look (enum SightManager::ESightType, game_object*, string);
    look (const vector&, number, number);
    look (game_object*, number, number);

    function completed();

    function type(enum SightManager::ESightType);

    function object(game_object*);

    function bone(string);

    function direct(const vector&);

  };
   */
  // todo;
  /**
   C++ class smart_cover_object : CGameObject {
    smart_cover_object ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CRadioactiveZone : CGameObject {
    CRadioactiveZone ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class explosive {
    function explode();

  };
   */
  // todo;
}
