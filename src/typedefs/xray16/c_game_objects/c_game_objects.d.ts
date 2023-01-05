import { TXR_callbacks, XR_cover_point } from "xray16";

import { Optional } from "@/mod/lib/types";

declare module "xray16" {
  /**
   * C++ class CGameObject : DLL_Pure,ISheduled,ICollidable,IRenderable {
   * @customConstructor CGameObject
   */
  export class XR_CGameObject extends XR_DLL_Pure {
    public Visual(): unknown;
    public getEnabled(): boolean;
    public _construct(): unknown;
    public net_Import(net_packet: XR_net_packet): unknown;
    public getVisible(): boolean;
    public net_Export(net_packet: XR_net_packet): unknown;
    public net_Spawn(cse_abstract: XR_cse_abstract): unknown;
    public use(object: XR_CGameObject): unknown;
  }

  /**
   * Custom extension.
   * For reference: src/xrGame/script_game_object_script.cpp
   */
  class XR_game_object_callbacks_base {

    /**
     * Remove callback.
     * @param type - type of callback
     * @param cb - null to reset
     */
    public set_callback(
      type: TXR_callback,
      cb: null,
    ): void;

    // 0 todo: trade start

    // 1 todo: trade stop

    /**
     * 2 todo;
     */
    public set_callback(
      type: TXR_callbacks["trade_sell_buy_item"],
      cb?: ((item: XR_game_object, money_direction: boolean, money: number) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 3 todo: trade_perform_operation

    /**
     * 4 todo;
     */
    public set_callback(
      type: TXR_callbacks["zone_enter"],
      cb?: ((zone: XR_game_object, object: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;

    /**
     * 4 todo;
     */
    public set_callback(
      type: TXR_callbacks["zone_exit"],
      cb?: ((zone: XR_game_object, object: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 6 todo: level_border_exit

    // 7 todo: level_border_enter

    /**
     * 8 todo;
     */
    public set_callback(
      type: TXR_callbacks["death"],
      cb?: (target: XR_game_object, killer: XR_game_object) => void,
      object?: XR_object_binder
    ): void;

    /**
     * 9 todo;
     */
    public set_callback(
      type: TXR_callbacks["patrol_path_in_point"],
      cb?: ((object: XR_game_object, action_type: number, point_index: number) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 10 todo: inventory_pda

    /**
     * 11 todo:
     */
    public set_callback(
      type: TXR_callbacks["inventory_info"],
      cb?: ((npc: XR_game_object, info_id: string) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 12 todo: article_info

    /**
     * 13 todo;
     */
    public set_callback(
      type: TXR_callbacks["task_state"],
      cb?: ((task: XR_CGameTask, state: number) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 14 todo: map_location_added

    /**
     * 15 todo;
     */
    public set_callback(
      type: TXR_callbacks["use_object"],
      cb?: ((object: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;
    public set_callback(
      type: TXR_callbacks["use_object"],
      cb?: ((object: XR_game_object, who: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;

    /**
     * 16 Entity got hit.
     */
    public set_callback(
      type: TXR_callbacks["hit"],
      cb?: (
        (object: XR_game_object, damage: number, direction: XR_vector, who: XR_game_object, bone_id: number) => void
        ) | null,
      object?: XR_object_binder | null
    ): void;

    /**
     * 17 todo;
     */
    public set_callback(
      type: TXR_callbacks["sound"],
      cb?: ((
        this: void,
        object: XR_game_object, source_id: number, sound_type: string, position: XR_vector, sound_power: number
      ) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 18 todo: action_movement

    // 19 todo: action_watch

    // 20 todo: action_removed

    // 21 todo: action_animation

    // 22 todo: action_sound

    // 23 todo: action_particle

    // 24 todo: action_object

    // 25 todo: actor_sleep

    // 26 todo: helicopter_on_point

    // 27 todo: helicopter_on_hit

    /**
     * 28 todo;
     */
    public set_callback(
      type: TXR_callbacks["on_item_take"],
      cb?: ((npc: XR_game_object, item: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;

    /**
     * 29 todo;
     */
    public set_callback(
      type: TXR_callbacks["on_item_drop"],
      cb?: ((npc: XR_game_object, item: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 30 todo: script_animation

    // 31 todo: trader_global_anim_request

    // 32 todo: trader_head_anim_request

    // 33 todo: trader_sound_end

    /**
     * 34 todo;
     */
    public set_callback(
      type: TXR_callbacks["take_item_from_box"],
      cb?: ((npc: XR_game_object, box: XR_game_object, item: XR_game_object) => void) | null,
      object?: XR_object_binder | null
    ): void;

    // 35 todo: weapon_no_ammo

    // 36 todo: key_press

    // 37 todo: key_release

    // 38 todo: key_hold

    // 39 todo: mouse_move

    // 40 todo: mouse_wheel

    // 41 todo: controller_press

    // 42 todo: controller_release

    // 43 todo: controller_hold

    // 44 todo: item_to_belt

    // 45 todo: item_to_slot

    // 46 todo: item_to_ruck

    // 47 todo: actor_before_death

    // 48 todo: on_attach_vehicle

    // 49 todo: on_detach_vehicle

    // 50 todo: on_use_vehicle

    // 51 todo: weapon_zoom_in

    // 52 todo: weapon_zoom_out

    // 53 todo: weapon_jammed
  }

  /**
   * C++ class game_object {
   */
  export class XR_game_object extends XR_game_object_callbacks_base {
    public static readonly dummy: -1;

    public static readonly action_type_count: 6;
    public static readonly alifeMovementTypeMask: 0;
    public static readonly alifeMovementTypeRandom: 1;
    public static readonly animation: 2;
    public static readonly dialog_pda_msg: 0;
    public static readonly enemy: 2;
    public static readonly friend: 0;
    public static readonly game_path: 0;
    public static readonly info_pda_msg: 1;
    public static readonly level_path: 1;
    public static readonly movement: 0;
    public static readonly neutral: 1;
    public static readonly no_path: 3;
    public static readonly no_pda_msg: 2;
    public static readonly object: 5;
    public static readonly particle: 4;
    public static readonly patrol_path: 2;
    public static readonly relation_attack: 1;
    public static readonly relation_fight_help_human: 2;
    public static readonly relation_fight_help_monster: 4;
    public static readonly relation_kill: 0;
    public static readonly sound: 3;
    public static readonly watch: 1;

    public bleeding: number;
    public health: number;
    public morale: number;
    public power: number;
    public psy_health: number;
    public radiation: number;

    public id(): number;
    public story_id(): string;
    public object(value: string): XR_game_object;
    public object(value: number): XR_game_object;
    public clsid(): TXR_cls_id;

    public memory_time(another: XR_game_object): unknown;
    public dont_has_info(value: string): boolean;
    public max_ignore_monster_distance(value: number): unknown;
    public max_ignore_monster_distance(): unknown;
    public best_item(): unknown;
    public disable_info_portion(value: string): unknown;
    public add_animation(value1: string, value2: boolean, value3: boolean): unknown;
    public add_animation(
      value1: string, value2: boolean, value3: XR_vector, value4: XR_vector, value: boolean
    ): unknown;
    public get_script(): boolean | null;
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
    public active_item(): XR_game_object | null;
    public mental_state(): number;
    public clear_animations(): void;
    public can_throw_grenades(): boolean;
    public can_throw_grenades(value: boolean): boolean;
    public set_enemy(object: XR_game_object): void;
    public set_smart_cover_target_default(value: boolean): unknown;
    public get_physics_object(): unknown;
    public switch_to_talk(): unknown;
    public idle_max_time(time: number): unknown;
    public idle_max_time(): unknown;
    public base_out_restrictions(): unknown;
    public weapon_is_scope(): boolean;
    public iterate_inventory_box(cb: () => void, object: XR_game_object): unknown;
    public set_smart_cover_target_selector(cb: () => void): unknown;
    public set_smart_cover_target_selector(cb: () => void, object: XR_game_object): unknown;
    public set_smart_cover_target_selector(): unknown;
    public debug_planner(action_planner: unknown): unknown;
    public best_weapon(): XR_game_object | null;
    public active_slot(): number;
    public who_hit_section_name(): unknown;
    public inventory_for_each(cb: () => void): unknown;
    public disable_talk(): unknown;
    public relation(game_object: XR_game_object): unknown;
    public set_previous_point(point: number): unknown;
    public set_item(action: unknown /* enum MonsterSpace::EObjectAction */): unknown;
    public set_item(
      action: unknown /* enum MonsterSpace::EObjectAction */,
      game_object: XR_game_object | null
    ): unknown;
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
    public team(): number;
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
    public squad(): number;
    public reset_action_queue(): unknown;
    public burer_set_force_gravi_attack(value: boolean): unknown;
    public can_select_weapon(): unknown;
    public can_select_weapon(value: boolean): unknown;
    public set_actor_direction(value: number): unknown;
    public drop_item(game_object: XR_game_object): unknown;
    public add_restrictions(value1: string, value2: string): unknown;
    public get_monster_hit_info(): unknown;
    public memory_hit_objects(): unknown;
    public bind_object(binder: XR_object_binder): void;
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
    public set_const_force(vector: XR_vector, value: number, time_interval: number): void
    public weapon_strapped(): boolean;
    public weapon_unstrapped(): boolean;

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
    public get_hanging_lamp(): XR_hanging_lamp;
    public get_force_anti_aim(): unknown;
    public enable_inv_upgrade(): unknown;
    public set_smart_cover_target_idle(): unknown;
    public invulnerable(): boolean;
    public invulnerable(value: boolean): boolean;
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
    public spawn_ini(): Optional<XR_ini_file>;
    public drop_item_and_teleport(game_object: XR_game_object, vector: XR_vector): unknown;
    public get_campfire(): XR_CZoneCampfire;
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
    public motivation_action_manager(): XR_action_planner;
    public bone_position(value: string): unknown;
    public fov(): number;
    public set_default_panic_threshold(): unknown;
    public set_actor_relation_flags(value: unknown /** flags32 */): unknown;
    public character_name(): unknown;
    public lock_door_for_npc(): unknown;
    public hide_weapon(): unknown;
    public is_body_turning(): unknown;
    public set_dest_game_vertex_id(value: number): unknown;
    public marked_dropped(game_object: XR_game_object): boolean;
    public set_character_rank(value: number): void;
    public character_rank(): number;
    public patrol_path_make_inactual(): unknown;
    public fake_death_stand_up(): unknown;
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
    public character_icon(): string;
    public patrol(): string | null;
    public in_restrictions(): string;
    public unlock_door_for_npc(): unknown;
    public buy_item_condition_factor(value: number): unknown;
    public visibility_threshold(): unknown;
    public sniper_update_rate(value: boolean): unknown;
    public sniper_update_rate(): unknown;
    public section(): string;
    public get_current_point_index(): number;
    public stop_particles(name: string, bone: string): unknown;
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
    public enable_level_changer(value: boolean): void;
    public actor_look_at_point(vector: XR_vector): void;
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
    public direction(): XR_vector;
    public kill(game_object: XR_game_object): unknown;
    public cost(): unknown;
    public get_artefact(): XR_CArtefact;
    public body_state(): unknown;
    public skip_transfer_enemy(value: boolean): unknown;
    public see(game_object: XR_game_object): unknown;
    public see(value: string): unknown;
    public critically_wounded(): unknown;
    public idle_min_time(value: number): unknown;
    public idle_min_time(): unknown;
    public info_add(value: string): void;
    public sight_params(): XR_CSightParams;
    public unload_magazine(): unknown;
    public set_character_community(value1: string, value2: number, value3: number): unknown;
    public take_items_enabled(value: boolean): unknown;
    public take_items_enabled(): unknown;
    public set_sight(type: TXR_SightType, vector: XR_vector | null, value: number): unknown;
    public set_sight(
      type: TXR_SightType, value1: XR_vector, value2: boolean, value3: boolean
    ): unknown;
    public set_sight(type: TXR_SightType, vector: XR_vector, value: boolean): unknown;
    public set_sight(type: TXR_SightType, vector: XR_vector): unknown;
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
    public is_active_task(task: XR_CGameTask): boolean;
    public target_body_state(): unknown;
    public info_clear(): unknown;
    public head_orientation(): unknown;
    public inside(vector: XR_vector, value: number): boolean;
    public inside(vector: XR_vector): boolean;
    public set_nonscript_usable(value: boolean): unknown;
    public set_tip_text_default(): unknown;
    public set_tip_text(value: string): unknown;
    public get_current_holder(): unknown;
    public get_physics_shell(): XR_physics_shell;
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
    public set_level_changer_invitation(hint: string): unknown;
    public run_talk_dialog(game_object: XR_game_object, value: boolean): unknown;
    public weapon_scope_status(): unknown;
    public set_custom_panic_threshold(value: number): unknown;
    public weapon_grenadelauncher_status(): unknown;
    public weapon_is_silencer(): unknown;
    public allow_break_talk_dialog(value: boolean): unknown;
    public is_talking(): boolean;
    public deadbody_can_take_status(): unknown;
    public switch_to_upgrade(): unknown;
    public on_door_is_closed(): unknown;
    public apply_loophole_direction_distance(value: number): unknown;
    public apply_loophole_direction_distance(): unknown;
    public give_money(value: number): unknown;
    public set_relation(type: unknown, game_object: XR_game_object): unknown;
    public out_restrictions(): string;
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
    public get_task(task_id: string, value2: boolean): XR_CGameTask;
    public set_active_task(task: unknown): unknown;
    public get_enemy(): XR_game_object | null;
    public get_corpse(): unknown;
    public give_task(task: XR_CGameTask, value1: number, value2: boolean, value3: number): unknown;
    public get_task_state(value: string): unknown;
    public get_enemy_strength(): unknown;
    public path_type(): unknown;
    public rank(): unknown;
    public range(): unknown;
    public set_anomaly_power(value: number): unknown;
    public deadbody_can_take(value: boolean): unknown;
    public give_talk_message2(value1: string, value2: string, value3: string, selector: string): unknown;
    public set_vis_state(value: number): unknown;
    public get_ammo_in_magazine(): unknown;
    public give_game_news(
      caption: string, news_text: string, texture: string, timeout: number, show_time: number
    ): void;
    public give_game_news(
      caption: string, news_text: string, texture: string, timeout: number, show_time: number, value6: number
    ): void;
    public best_enemy(): XR_game_object | null;
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
    public suitable_smart_cover(game_object: XR_game_object): boolean;
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
    public hit(hit: XR_hit): void;
    public iterate_inventory(cb: (npc: XR_game_object, item: XR_game_object) => void, object: XR_game_object): unknown;
    public set_condition(condition: number): void;
    public movement_enabled(value: boolean): unknown;
    public movement_enabled(): unknown;
    public berserk(): unknown;
    public accessible_nearest(vector1: XR_vector, vector2: XR_vector): unknown;
    public name(): string;
    public set_movement_type(type: unknown /** MonsterSpace::EMovementType */): unknown;
    public character_community(): string;
    public group(): string;
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
    public find_best_cover(vector: XR_vector): XR_cover_point;
    public register_in_combat(): void;
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
   * C++ class CSpaceRestrictor : CGameObject {
   * @customConstructor CZoneCampfire
   */
  export class XR_CSpaceRestrictor extends XR_CGameObject {
  }

  /**
   * C++ class CLevelChanger : CGameObject {
   * @customConstructor CLevelChanger
   */
  export class XR_CLevelChanger extends XR_CGameObject {
  }

  /**
   * C++ class smart_cover_object : CGameObject {
   */
  export class XR_smart_cover_object extends XR_CGameObject {
  }
}
