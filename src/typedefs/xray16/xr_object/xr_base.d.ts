declare module "xray16" {
  /**
   * C++ class IRender_Visual {
   */
  export interface IXR_IRender_Visual {
    dcast_PKinematicsAnimated(): XR_IKinematicsAnimated;
  }

  /**
   * C++ class global {
   * @customConstructor object_factory
   */
  export class XR_object_factory {
    protected constructor();

    public register(
      client_object_class: string,
      server_object_class: string,
      clsid: string,
      script_clsid: TXR_cls_key
    ): void;

    public register(
      client_object_class: string,
      clsid: string,
      script_clsid: TXR_cls_key
    ): void;
  }

  /**
   * C++ class object_binder {
   * @customConstructor object_binder
   */
  export class XR_object_binder<T = XR_game_object> extends XR_EngineBinding {
    public readonly object: T;

    public constructor(object: T);

    public static __init(this: void, target: XR_object_binder, object: XR_game_object): void
    public __init(object: T): void

    public static save(this: void, target: XR_object_binder, packet: XR_net_packet): void;
    public save(packet: XR_net_packet): void;

    public static update(this: void, target: XR_object_binder, delta: u32): void;
    public update(delta: u32): void;

    public static reload(this: void, target: XR_object_binder, section: string): void;
    public reload(section: string): void;

    public static net_export(this: void, target: XR_object_binder, net_packet: XR_net_packet): void;
    public net_export(net_packet: XR_net_packet): void;

    public net_save_relevant(this: void, target: XR_object_binder): boolean;
    public net_save_relevant(): boolean;

    public static load(this: void, target: XR_object_binder, reader: XR_reader): void;
    public load(reader: XR_reader): void;

    public static net_destroy(this: void, target: XR_object_binder): void;
    public net_destroy(): void;

    public static reinit(this: void, target: XR_object_binder): void;
    public reinit(): void;

    public static net_Relcase<ST extends XR_game_object = XR_game_object>(
      this: void, target:
        XR_object_binder,
      game_object: ST
    ): void;
    public net_Relcase(object: T): void;

    public static net_spawn<ST extends XR_game_object = XR_game_object>(
      this: void,
      target: XR_object_binder,
      object: XR_cse_alife_object
    ): boolean;
    public net_spawn(object: XR_cse_alife_object): boolean;

    public static net_import(this: void, target: XR_object_binder, net_packet: XR_net_packet): void
    public net_import(net_packet: XR_net_packet): void;
  }

  /**
   * C++ class particle {
   * @customConstructor particle
   */
  export class XR_particle extends XR_EngineBinding {
    public constructor();
    public constructor(value1: string, value2: string);
    public constructor(value1: string, value2: string, value3: XR_particle_params);
    public constructor(value1: string, value2: string, particle_params: XR_particle_params, value3: boolean);
    public constructor(value1: string, particle_params: XR_particle_params);
    public constructor(value1: string, particle_params: XR_particle_params, value2: boolean);

    public completed(): boolean;
    public set_angles(vector: XR_vector): void;
    public set_bone(bone_id: string): void;
    public set_particle(value1: string, value2: boolean): void;
    public set_position(vector: XR_vector): void;
    public set_velocity(vector: XR_vector): void;
  }

  /**
   * C++ class particle_params {
   * @customConstructor particle_params
   */
  export class XR_particle_params {
    public constructor();
    public constructor(vector: XR_vector);
    public constructor(vector1: XR_vector, vector2: XR_vector);
    public constructor(vector1: XR_vector, vector2: XR_vector, vector3: XR_vector);
  }

  /**
   * C++ class holder {
   * @customConstructor holder
   */
  export class XR_holder {
    public engaged(): boolean;
    public Action(value1: u16, value2: u32): void;
    public SetParam(value: i32, vector: XR_vector): void;
  }

  /**
   * C++ class CGameObject : DLL_Pure,ISheduled,ICollidable,IRenderable {
   * @customConstructor CGameObject
   */
  export class XR_CGameObject extends XR_DLL_Pure {
    public Visual(): IXR_IRender_Visual;
    public getEnabled(): boolean;
    public _construct(): XR_DLL_Pure;
    public net_Import(net_packet: XR_net_packet): void;
    public getVisible(): boolean;
    public net_Export(net_packet: XR_net_packet): void;
    public net_Spawn(cse_abstract: XR_cse_abstract): boolean;
    public use(object: XR_CGameObject): boolean;
  }

  /**
   * C++ class hit {
   * @customConstructor hit
   */
  export class XR_hit {
    public static readonly burn = 0;
    public static readonly chemical_burn = 2;
    public static readonly dummy = 12;
    public static readonly explosion = 7;
    public static readonly fire_wound = 8;
    public static readonly light_burn = 11;
    public static readonly radiation = 3;
    public static readonly shock = 1;
    public static readonly strike = 5;
    public static readonly telepatic = 4;
    public static readonly wound = 6;

    public direction: XR_vector;
    public draftsman: XR_game_object | null;
    public impulse: f32;
    public power: f32;
    public type: TXR_hit_type;

    public constructor ();
    public constructor (hit: XR_hit);

    public bone(bone: string): void;
  }

  export type TXR_hit_types = typeof XR_hit;
  export type TXR_hit_type = TXR_hit_types[Exclude<keyof TXR_hit_types, "prototype" | "constructor">];

  /**
   * C++ class danger_object {
   * @customConstructor danger_object
   */
  export class XR_danger_object {
    public static attack_sound: 1;
    public static attacked: 5;
    public static bullet_ricochet: 0;
    public static enemy_sound: 7;
    public static entity_attacked: 2;
    public static entity_corpse: 4;
    public static entity_death: 3;
    public static grenade: 6;
    public static hit: 2;
    public static sound: 1;
    public static visual: 0;

    public type(): TXR_danger_object;
    public time(): u32;
    public position(): XR_vector;
    public object(): XR_game_object;
    public perceive_type(): number; /* CDangerObject::EDangerPerceiveType */
    public dependent_object(): XR_game_object;
  }

  export type TXR_danger_objects = typeof XR_danger_object;

  export type TXR_danger_object = TXR_danger_objects[Exclude<keyof TXR_danger_objects, "constructor" | "prototype">];

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
        object: XR_game_object, source_id: number, sound_type: TXR_snd_type, position: XR_vector, sound_power: number
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

    /**
     * 26 todo;
     */
    public set_callback(
      type: TXR_callbacks["helicopter_on_point"],
      cb?: ((distance: number, current_position: XR_vector, vertex_id: number) => void) | null,
      object?: XR_object_binder | null
    ): void;

    /**
     * 27 todo;
     */
    public set_callback(
      type: TXR_callbacks["helicopter_on_hit"],
      cb?: ((damage: number, impulse: number, hit_type: number, who_id: number) => void) | null,
      object?: XR_object_binder | null
    ): void;

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

    /**
     * 30 todo;
     */
    public set_callback(
      type: TXR_callbacks["script_animation"],
      cb?: ((skip_multi_anim_check?: boolean) => void) | null,
      object?: object | null
    ): void;

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

    public set_enemy_callback(cb: null): void;
    public set_enemy_callback(cb: () => boolean): void;
    public set_enemy_callback(cb: () => boolean, object: XR_game_object): void;
    public set_fastcall<T>(cb: (this: T) => boolean, object: T): void;
    public set_patrol_extrapolate_callback(cb?: ((cur_pt: number) => boolean) | null, object?: object): void;
    public set_smart_cover_target_selector(cb?: (object: XR_game_object) => void, object?: object): void;
  }

  /**
   *  CAI_Stalker* cast_Stalker();
   *  CActor* cast_Actor();
   *  CArtefact* cast_Artefact();
   *  CCar* cast_Car();
   *  CGameObject* cast_GameObject();
   *  CHelicopter* cast_Heli();
   *  CSpaceRestrictor* cast_SpaceRestrictor();
   *  CWeapon* cast_Weapon();
   *  CWeaponAmmo* cast_Ammo();
   *  CWeaponMagazined* cast_WeaponMagazined();
   *  ce_script_zone* cast_ScriptZone();
   *  class CCustomMonster* cast_Monster();
   *  class CCustomZone* cast_CustomZone();
   *  class CEntityAlive* cast_EntityAlive();
   *  class CInventoryItem* cast_InventoryItem();
   *  class CInventoryOwner* cast_InventoryOwner();
   *  class CPhysicsShellHolder* cast_PhysicsShellHolder();
   *  explosive* cast_Explosive();
   *
   *  CTime get_info_time(char const*);
   *  bool bone_visible(char const*);
   *  bool has_ammo_type(unsigned char)
   *  bool has_upgrade(char const*);
   *  bool install_upgrade(char const*);
   *  bool is_on_belt(game_object*);
   *  bool use(game_object*);
   *
   *  vector<MemorySpace::CNotYetVisibleObject,xalloc<MemorySpace::CNotYetVisibleObject> > not_yet_visible_objects();
   *  vector<MemorySpace::CSoundObject,xalloc<MemorySpace::CSoundObject>> memory_sound_objects();

   *  enum ALife::ERelationType relation(game_object*);
   *  enum DetailPathManager::EDetailPathType detail_path_type();
   *  enum ETaskState get_task_state(char const*);
   *  enum MonsterSpace::EBodyState body_state();
   *  enum MonsterSpace::EBodyState target_body_state();
   *  enum MonsterSpace::EMentalState mental_state();
   *  enum MonsterSpace::EMentalState target_mental_state();
   *  enum MonsterSpace::EMovementType movement_type();
   *  enum MovementManager::EPathType path_type();
   *
   *  float get_actor_jump_speed();
   *  float get_actor_max_walk_weight();
   *  float get_actor_max_weight();
   *  float get_actor_run_coef();
   *  float get_actor_runback_coef();
   *  float get_actor_sprint_koef();
   *  float get_additional_max_walk_weight();
   *  float get_additional_max_weight();
   *  float get_anomaly_power();
   *  float get_artefact_bleeding();
   *  float get_artefact_health();
   *  float get_artefact_power();
   *  float get_artefact_radiation();
   *  float get_artefact_satiety();
   *  float get_luminocity();
   *  float get_luminocity_hemi();
   *  float get_total_weight();
   *

   *  game_object* get_attached_vehicle();
   *
   *  holder* cast_HolderCustom();
   *  int get_ammo_count_for_type(unsigned char);
   *
   *  unsigned char get_ammo_type();
   *  unsigned char get_max_uses();
   *  unsigned char get_remaining_uses();
   *  unsigned char get_restrictor_type();
   *  unsigned char get_weapon_substate();
   *
   *  unsigned int belt_count();
   *  unsigned int get_main_weapon_type();
   *  unsigned int get_spatial_type();
   *  unsigned int get_state();
   *  unsigned int get_weapon_type();
   *  unsigned int play_hud_motion(char const*,bool,unsigned int);
   *
   *  void attach_vehicle(game_object*);
   *  void clear_game_news();
   *  void detach_vehicle();
   *  void force_set_position(vector,bool);
   *
   *  void iterate_feel_touch(function<void>);
   *  void iterate_installed_upgrades(function<void>);
   *  void phantom_set_enemy(game_object*);
   *  void set_actor_jump_speed(float);
   *  void set_actor_max_walk_weight(float);
   *  void set_actor_max_weight(float);
   *  void set_actor_run_coef(float);
   *  void set_actor_runback_coef(float);
   *  void set_actor_sprint_koef(float);
   *  void set_additional_max_walk_weight(float);
   *  void set_additional_max_weight(float);
   *  void set_alien_control(bool);
   *  void set_ammo_type(unsigned char);
   *
   *  void set_artefact_bleeding(float);
   *  void set_artefact_health(float);
   *  void set_artefact_power(float);
   *  void set_artefact_radiation(float);
   *  void set_artefact_satiety(float);
   *
   *  void set_bone_visible(char const*,bool,bool);
   *  void set_character_icon(char const*);
   *  void set_health_ex(float);
   *  void set_main_weapon_type(unsigned int);

   *
   *  void set_remaining_uses(unsigned char);
   *  void set_restrictor_type(unsigned char);
   *  void set_spatial_type(unsigned int);
   *  void set_weapon_type(unsigned int);
   *  void set_weight(float);
   *  void start_trade(game_object*);
   *  void start_upgrade(game_object*);
   *  void switch_state(unsigned int);
   * }
   */

  /**
   * C++ class game_object {
   */
  export class XR_game_object extends XR_game_object_callbacks_base {
    public static readonly dummy: -1;

    public static readonly game_path: 0;
    public static readonly level_path: 1;
    public static readonly patrol_path: 2;
    public static readonly no_path: 3;

    public static readonly friend: 0;
    public static readonly neutral: 1;
    public static readonly enemy: 2;

    public static readonly alifeMovementTypeMask: 0;
    public static readonly alifeMovementTypeRandom: 1;

    public static readonly dialog_pda_msg: 0;
    public static readonly info_pda_msg: 1;
    public static readonly no_pda_msg: 2;

    public static readonly relation_kill: 0;
    public static readonly relation_attack: 1;
    public static readonly relation_fight_help_human: 2;
    public static readonly relation_fight_help_monster: 4;

    public static readonly movement: 0;
    public static readonly watch: 1;
    public static readonly animation: 2;
    public static readonly sound: 3;
    public static readonly particle: 4;
    public static readonly object: 5;
    public static readonly action_type_count: 6;

    public satiety: f32;
    public bleeding: f32;
    public health: f32;
    public morale: f32;
    public power: f32;
    public psy_health: f32;
    public radiation: f32;

    /**
     * Get engine object ID.
     */
    public id(): u16;
    public story_id(): u32;
    public object(value: string): XR_game_object | null;
    public object(value: i32): XR_game_object | null;
    public clsid(): TXR_cls_id;

    public add_animation(value1: string, value2: boolean, value3: boolean): void;
    public add_animation(
      value1: string, value2: boolean, value3: XR_vector, value4: XR_vector, value: boolean
    ): void;

    public action(): XR_entity_action;
    public action_count(): u32;
    public active_detector(): XR_game_object | null;
    public active_item(): XR_game_object | null;
    public active_slot(): u32;
    public active_zone_contact(value: u16): boolean;
    public add_restrictions(zone: string, value2: string): void;
    public animation_slot(): i32;
    public base_out_restrictions(): string;
    public best_item(): XR_game_object | null;
    public best_weapon(): XR_game_object | null;
    public bind_object(binder: XR_object_binder): void;
    public binded_object(): XR_object_binder;
    public burer_set_force_gravi_attack(value: boolean): void;
    public buy_supplies(value1: XR_ini_file, value2: string): void;
    public can_select_weapon(): boolean;
    public can_select_weapon(value: boolean): void;
    public can_throw_grenades(): boolean;
    public can_throw_grenades(value: boolean): void;
    public clear_animations(): void;
    public clear_override_animation(): void;
    public debug_planner(action_planner: XR_action_planner): void;
    public disable_info_portion(value: string): boolean;
    public disable_talk(): void;
    public disable_trade(): void;
    public dont_has_info(value: string): boolean;
    public drop_item(game_object: XR_game_object): void;
    public enable_night_vision(value: boolean): void;
    public external_sound_start(value: string): void;
    public get_bone_id(value: string): u16;
    public get_current_direction(): XR_vector;
    public get_current_outfit_protection(value: i32): f32;
    public get_dest_smart_cover(): XR_cover_point;
    public get_dest_smart_cover_name(): string | null;
    public get_monster_hit_info(): XR_MonsterHitInfo;
    public get_physics_object(): XR_CPhysicObject;
    public get_script(): boolean;
    public get_smart_cover_description(): string;
    public give_talk_message(value1: string, value2: string, value3: string): void;
    public idle_max_time(): f32;
    public idle_max_time(time: f32): void;
    public in_current_loophole_fov(vector: XR_vector): boolean;
    public inventory_for_each(cb: () => void): void;
    public is_door_blocked_by_npc(): boolean;
    public is_talk_enabled(): boolean;
    public is_weapon_going_to_be_strapped(weapon: XR_game_object | null): boolean;
    public iterate_inventory_box(cb: (box: XR_game_object, item: XR_game_object) => void, object: XR_game_object): void;
    public lookout_max_time(): f32;
    public lookout_max_time(value: f32): void;
    public max_ignore_monster_distance(): f32;
    public max_ignore_monster_distance(value: f32): void;
    public memory_hit_objects(): unknown; // :vector<MemorySpace::CHitObject, xalloc<struct MemorySpace::CHitObject>
    public memory_time(another: XR_game_object): u32;
    public memory_visible_objects(): LuaIterable<XR_visible_memory_object>;
    public mental_state<T extends number>(): T; // todo: unknown enum
    public not_yet_visible_objects(): unknown;
    public object_count(): u32;
    public path_completed(): boolean;
    public relation(game_object: XR_game_object): number;
    public release_stand_sleep_animation(): void;
    public reset_action_queue(): void;
    public restore_sound_threshold(): void;
    public set_actor_direction(value: f32): void;
    public set_ammo_elapsed(value: i32): void;
    public set_community_goodwill(first: string, second: i32): void;
    public set_const_force(vector: XR_vector, value: f32, time_interval: u32): void
    public set_dest_smart_cover(): void;
    public set_dest_smart_cover(value: string): void;
    public set_enemy(object: XR_game_object): void;
    public set_fov(fov: f32): void;
    public set_item(action_id: number, game_object: XR_game_object | null, value1?: u32, value2?: u32): void;
    public set_mental_state(state: TXR_animation): void;
    public set_override_animation(animation: string): void;
    public set_path_type(type: number /** enum MovementManager::EPathType */): void;
    public set_previous_point(point: i32): void;
    public set_smart_cover_target(): void;
    public set_smart_cover_target(game_object: XR_game_object): void;
    public set_smart_cover_target(vector: XR_vector): void;
    public set_smart_cover_target_default(value: boolean): void;
    public set_smart_cover_target_fire(): void;
    public set_smart_cover_target_lookout(): void;
    public set_start_point(point: i32): void;
    public sound_voice_prefix(): string;
    public squad(): i32;
    public switch_to_talk(): void;
    public team(): i32;
    public use_smart_covers_only(): boolean;
    public use_smart_covers_only(value: boolean): void;
    public weapon_addon_attach(object: XR_game_object): void;
    public weapon_addon_detach(addon: string): void;
    public weapon_is_scope(): boolean;
    public weapon_silencer_status(): i32;
    public weapon_strapped(): boolean;
    public weapon_unstrapped(): boolean;
    public who_hit_name(): string;
    public who_hit_section_name(): string;

    public activate_slot(index: u32): void;
    public actor_look_at_point(vector: XR_vector): void;
    public aim_bone_id(): string;
    public aim_bone_id(value: string): void;
    public aim_time(game_object: XR_game_object): u32;
    public aim_time(game_object: XR_game_object, value: u32): void;
    public allow_sprint(value: boolean): void;
    public animation_count(): i32;
    public best_danger(): XR_danger_object | null;
    public body_state(): void;
    public bone_position(value: string): XR_vector;
    public buy_item_condition_factor(value: f32): void;
    public change_team(value1: u8, value2: u8, value3: u8): void;
    public character_icon(): string;
    public character_name(): string;
    public character_rank(): i32;
    public condition(): f32;
    public cost(): u32;
    public critically_wounded(): boolean;
    public deadbody_closed(value: boolean): void;
    public death_sound_enabled(): boolean;
    public death_sound_enabled(value: boolean): void;
    public direction(): XR_vector;
    public disable_anomaly(): void;
    public disable_hit_marks(): boolean;
    public disable_hit_marks(value: boolean): void;
    public disable_inv_upgrade(): void;
    public drop_item_and_teleport(game_object: XR_game_object, vector: XR_vector): void;
    public eat(game_object: XR_game_object): void;
    public enable_inv_upgrade(): void;
    public enable_level_changer(value: boolean): void;
    public enable_memory_object(game_object: XR_game_object, value: boolean): void;
    public explode(value: u32): void;
    public extrapolate_length(): f32
    public extrapolate_length(value: f32): void;
    public fake_death_stand_up(): void;
    public fov(): f32;
    public get_ammo_total(): u32;
    public get_artefact(): XR_CArtefact;
    public get_campfire(): XR_CZoneCampfire;
    public get_current_outfit(): XR_game_object | null;
    public get_current_point_index(): u32;
    public get_force_anti_aim(): boolean;
    public get_hanging_lamp(): XR_hanging_lamp;
    public get_holder_class(): XR_holder;
    public get_movement_speed(): XR_vector;
    public get_script_name(): string;
    public get_visual_name<T extends string>(): T;
    public has_info(value: string): boolean;
    public hide_weapon(): void;
    public idle_min_time(): f32;
    public idle_min_time(value: f32): void;
    public in_loophole_fov(value1: string, valu2: string, value3: XR_vector): boolean;
    public in_restrictions(): string;
    public in_smart_cover(): boolean;
    public info_add(value: string): void;
    public inv_box_can_take(value: boolean): boolean;
    public invulnerable(): boolean;
    public invulnerable(value: boolean): void;
    public is_body_turning(): boolean;
    public is_level_changer_enabled(): boolean;
    public is_there_items_to_pickup(): boolean;
    public kill(game_object: XR_game_object): void;
    public location_on_path(value: f32, vector: XR_vector): u32;
    public lock_door_for_npc(): void;
    public lookout_min_time(): f32;
    public lookout_min_time(time: f32): void;
    public make_item_active(game_object: XR_game_object): void;
    public marked_dropped(game_object: XR_game_object): boolean;
    public memory_sound_objects(): unknown;
    public money(): u32;
    public motivation_action_manager(): XR_action_planner;
    public movement_type(): number; // todo: unknown enum
    public patrol(): string | null;
    public patrol_path_make_inactual(): void;
    public play_cycle(value1: string, value2: boolean): void;
    public play_cycle(value: string): void;
    public play_sound(value1: u32, value2?: u32, value3?: u32, value4?: u32, value5?: u32, value6?: u32): void;
    public register_door_for_npc(): void;
    public remove_home(): void;
    public remove_restrictions(value1: string, value2: string): void;
    public remove_sound(value: u32): void;
    public restore_default_start_dialog(): void;
    public restore_max_ignore_monster_distance(): void;
    public section<T extends string = string>(): T;
    public see(game_object: XR_game_object): boolean;
    public see(value: string): boolean;
    public sell_condition(ini_file: XR_ini_file, value: string): void;
    public sell_condition(value1: f32, value2: f32): void;
    public set__force(vector: XR_vector, value1: number, value2: number): void;
    public set_actor_relation_flags(value: XR_flags32): void;
    public set_alien_control(value: boolean): void;
    public set_body_state(state: TXR_MonsterBodyState): void;
    public set_capture_anim(game_object: XR_game_object, value1: string, vector: XR_vector, value2: f32): void;
    public set_character_community(value1: string, value2: u32, value3: i32): void;
    public set_character_rank(value: i32): void;
    public set_collision_off(value: boolean): void;
    public set_default_panic_threshold(): void;
    public set_dest_game_vertex_id(value: u16): void;
    public set_dest_level_vertex_id(vertex_id: u32): void;
    public set_detail_path_type(EDetailPathType: unknown /** enum DetailPathManager::EDetailPathType */): void;
    public set_invisible(value: boolean): void;
    public set_movement_selection_type(type: unknown /** enum ESelectionType */): void;
    public set_patrol_path(value1: string, EPatrolStartType: number, EPatrolRouteType: number, value2: boolean): void;
    public set_smart_cover_target_idle(): void;
    public set_sympathy(value: f32): void;
    public set_trader_sound(value1: string, value2: string): void;
    public sight_params(): XR_CSightParams;
    public skip_transfer_enemy(value: boolean): void;
    public sniper_update_rate(): boolean;
    public sniper_update_rate(value: boolean): void;
    public spawn_ini(): XR_ini_file;
    public special_danger_move(): boolean;
    public special_danger_move(value: boolean): void;
    public stop_particles(name: string, bone: string): void;
    public switch_to_trade(): void;
    public sympathy(): f32;
    public take_items_enabled(): boolean;
    public take_items_enabled(value: boolean): void;
    public torch_enabled(): boolean;
    public unload_magazine(): void;
    public unlock_door_for_npc(): void;
    public visibility_threshold(): f32;
    public weapon_is_grenadelauncher(): boolean;
    public set_sight(type: TXR_SightType, vector: XR_vector | null, value: number): void;
    public set_sight(type: TXR_SightType, torso_look: boolean, fire_object: boolean): void;
    public set_sight(
      type: TXR_SightType, value1: XR_vector, torso_look: boolean, fire_object: boolean
    ): void;
    public set_sight(type: TXR_SightType, vector: XR_vector, value: boolean): void;
    public set_sight(type: TXR_SightType, vector: XR_vector): void;
    public set_sight(game_object: XR_game_object): void;
    public set_sight(game_object: XR_game_object, torso_look: boolean): void;
    public set_sight(game_object: XR_game_object, torso_look: boolean, fire_object: boolean): void;
    public set_sight(game_object: XR_game_object, torso_look: boolean, fire_object: boolean, value3: boolean): void;
    public set_task_state(state: TXR_TaskState, value: string): void;
    public set_visual_memory_enabled(enabled: boolean): void;
    public show_condition(ini_file: unknown, value: string): void;
    public sound_prefix(): string;
    public sound_prefix(value: string): void;
    public wounded(): boolean;
    public wounded(wounded: boolean): void;
    public add_sound(value1: string, value2: u32, type: unknown, value3: u32, value4: u32, value5: u32): u32;
    public add_sound(
      value1: string, value2: u32, type: unknown, value3: u32, value4: u32, value5: u32, value6: string
    ): u32;
    public active_sound_count(): i32;
    public active_sound_count(value: boolean): void;
    public allow_break_talk_dialog(value: boolean): void;
    public apply_loophole_direction_distance(): f32;
    public apply_loophole_direction_distance(value: f32): void;
    public attachable_item_enabled(): boolean;
    public burer_get_force_gravi_attack(): boolean;
    public burer_get_force_anti_aim(): boolean;
    public buy_condition(ini_file: XR_ini_file, value: string): void;
    public buy_condition(value1: f32, value2: f32): void;
    public change_character_reputation(value: i32): void;
    public change_goodwill(value: i32, game_object: XR_game_object): void;
    public character_reputation(): i32;
    public community_goodwill(value: string): i32;
    public deadbody_can_take(value: boolean): void;
    public deadbody_can_take_status(): boolean;
    public detail_path_type(): unknown;
    public disable_show_hide_sounds(value: boolean): void;
    public enable_anomaly(): void;
    public enable_attachable_item(value: boolean): void;
    public enable_talk(): void;
    public enable_trade(): void;
    public enable_vision(value: boolean): void;
    public fake_death_fall_down(): boolean;
    public force_set_goodwill(value: i32, game_object: XR_game_object): void;
    public force_visibility_state(value: i32): void;
    public general_goodwill(game_object: XR_game_object): i32;
    public get_actor_relation_flags(): XR_flags32;
    public get_ammo_in_magazine(): u32;
    public get_anomaly_power(): unknown;
    public get_car(): XR_CCar;
    public get_corpse(): XR_game_object | null;
    public get_current_holder(): XR_holder;
    public get_enemy(): XR_game_object | null;
    public get_enemy_strength(): i32;
    public get_physics_shell(): XR_physics_shell | null;
    public get_start_dialog(): void;
    public get_task(task_id: string, value2: boolean): XR_CGameTask | null;
    public get_task_state(value: string): unknown;
    public give_info_portion(value: string): boolean;
    public give_money(value: i32): void;
    public give_talk_message2(value1: string, value2: string, value3: string, selector: string): void;
    public give_task(task: XR_CGameTask, value1: u32, value2: boolean, value3: u32): void;
    public goodwill(game_object: XR_game_object): i32;
    public group_throw_time_interval(): u32;
    public group_throw_time_interval(value: u32): void;
    public head_orientation(): XR_vector;
    public ignore_monster_threshold(): f32;
    public ignore_monster_threshold(value: f32): void;
    public in_current_loophole_range(vector: XR_vector): boolean;
    public info_clear(): void;
    public inside(vector: XR_vector): boolean;
    public inside(vector: XR_vector, value: number /* ? */): boolean;
    public inv_box_can_take_status(): boolean;
    public inv_box_closed(value1: boolean, value2: string): boolean;
    public is_active_task(task: XR_CGameTask): boolean;
    public is_door_locked_for_npc(): boolean;
    public is_inv_box_empty(): boolean;
    public is_inv_upgrade_enabled(): boolean;
    public is_talking(): boolean;
    public is_trade_enabled(): boolean;
    public item_in_slot(slot: u32): XR_game_object | null;
    public item_on_belt(slot: u32): XR_game_object | null;
    public jump(vector: XR_vector, value: f32): void;
    public make_object_visible_somewhen(game_object: XR_game_object): void;
    public mark_item_dropped(game_object: XR_game_object): void;
    public mass(): f32;
    public max_health(): f32;
    public night_vision_enabled(): boolean;
    public on_door_is_closed(): void;
    public on_door_is_open(): void;
    public out_restrictions(): string;
    public path_type(): unknown;
    public poltergeist_get_actor_ignore(): boolean;
    public profile_name(): string;
    public range(): f32;
    public rank(): i32;
    public remove_all_restrictions(): void;
    public restore_ignore_monster_threshold(): void;
    public restore_weapon(): void;
    public run_talk_dialog(game_object: XR_game_object, value: boolean): void;
    public set_active_task(task: XR_CGameTask): void;
    public set_actor_position(vector: XR_vector): void;
    public set_anomaly_power(value: f32): void;
    public set_custom_panic_threshold(value: f32): void;
    public set_dest_loophole(): void;
    public set_dest_loophole(value: string): void;
    public set_goodwill(value: i32, game_object: XR_game_object): void;
    public set_home(value1: string | null, value2: f32, value3?: f32, value4?: boolean, value5?: f32): void;
    public set_home(value1: u32 | null, value2: f32, value3?: f32, value4?: boolean, value5?: f32): void;
    public set_level_changer_invitation(hint: string): void;
    public set_nonscript_usable(is_usable: boolean): void;
    public set_queue_size(value: u32): void;
    public set_relation(ERelationType: number, game_object: XR_game_object): void;
    public set_smart_cover_target_fire_no_lookout(): unknown;
    public set_sound_mask(value: u32): void;
    public set_start_dialog(value: string): void;
    public set_tip_text(text: string): void;
    public set_tip_text_default(): void;
    public set_trader_global_anim(value: string): void;
    public set_vis_state(value: f32): void;
    public sniper_fire_mode(): boolean;
    public sniper_fire_mode(value: boolean): void;
    public start_particles(value1: string, value2: string): void;
    public stop_talk(): void;
    public switch_to_upgrade(): void;
    public target_body_state(): TXR_move;
    public target_movement_type(): number; /* EMovementType */
    public transfer_item(item: XR_game_object, from: XR_game_object): void;
    public transfer_money(value: i32, from: XR_game_object): void;
    public unregister_in_combat(): void;
    public vertex_in_direction(value1: u32, vector: XR_vector, value2: f32): u32;
    public vision_enabled(): boolean;
    public weapon_grenadelauncher_status(): i32;
    public weapon_is_silencer(): boolean;
    public weapon_scope_status(): i32;
    public weight(): f32;
    public give_game_news(
      caption: string, news_text: string, texture: string, timeout: i32, show_time: i32
    ): void;
    public give_game_news(
      caption: string, news_text: string, texture: string, timeout: i32, show_time: i32, value6: i32
    ): void;
    public accessible(vector: XR_vector): boolean;
    public accessible(vertex_id: u32): boolean;
    public accuracy(): f32;
    public attachable_item_load_attach(value: string): void;
    public best_cover(
      vector1: XR_vector, vector2: XR_vector, value3: f32, value4: f32, value5: f32
    ): XR_cover_point;
    public best_enemy(): XR_game_object | null;
    public center(): XR_vector;
    public deadbody_closed_status(): boolean;
    public death_time(): u32;
    public enable_torch(value: boolean): void;
    public force_stand_sleep_animation(value: u32): void;
    public get_visibility_state(): i32;
    public in_loophole_range(value1: string, value2: string, vector: XR_vector): boolean;
    public poltergeist_set_actor_ignore(value: boolean): void;
    public set_desired_position(): void;
    public set_desired_position(vector: XR_vector): void;
    public set_force_anti_aim(value: boolean): void;
    public set_range(value: f32): void;
    public suitable_smart_cover(game_object: XR_game_object): boolean;
    public add_combat_sound(
      value1: string,
      value2: number,
      type: i32 /** enum ESoundTypes */,
      value3: u32,
      value4: u32,
      value5: u32,
      value6: string
    ): u32;
    public berserk(): void;
    public command(entity_action: XR_entity_action, value: boolean): void;
    public hit(hit: XR_hit): void;
    public inactualize_patrol_path(): void;
    public iterate_inventory(cb: (owner: XR_game_object, item: XR_game_object) => void, object: XR_game_object): void;
    public movement_enabled(): boolean;
    public movement_enabled(value: boolean): void;
    public set_condition(condition: f32): void;

    /**
     * @returns vertex_id of accessible position
     */
    public accessible_nearest(vector1: XR_vector, vector2: XR_vector): u32;
    public action_by_index(value: u32): XR_entity_action | null;
    public alive(): boolean;
    public base_in_restrictions(): string
    public can_script_capture(): boolean;
    public character_community(): string;
    public external_sound_stop(): void;
    public find_best_cover(vector: XR_vector): XR_cover_point;
    public game_vertex_id(): u32;
    public get_helicopter(): XR_CHelicopter;
    public get_sound_info(): XR_SoundInfo;
    public group(): i32;
    public inv_box_closed_status(): boolean;
    public level_vertex_id(): u32;
    public memory_position(game_object: XR_game_object): XR_vector;
    public movement_target_reached(): boolean;
    public name(): string;
    public parent(): XR_game_object;
    public position(): XR_vector;
    public register_in_combat(): void;
    public safe_cover(vector: XR_vector, value1: f32, value2: f32): XR_cover_point;
    public script(script_control: boolean, script_name: string): void;
    public set_desired_direction(): void;
    public set_desired_direction(vector: XR_vector): void;
    public set_manual_invisibility(value: boolean): void;
    public set_movement_type(EMovementType: number /** MonsterSpace::EMovementType */): void;
    public set_npc_position(vector: XR_vector): void;
    public set_sound_threshold(value: f32): void;
    public set_trader_head_anim(value: string): void;
    public set_visual_name(name: string): void;
    public target_mental_state(): TXR_animation;
    public unregister_door_for_npc(): void;
  }

   /**
   * C++ class CSpaceRestrictor : CGameObject {
   * @customConstructor CSpaceRestrictor
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

  // todo: Correct overloading for callbacks.
  /**
   * C++ class SGameTaskObjective
   * @customConstructor SGameTaskObjective
   */
  export class XR_SGameTaskObjective {
    public constructor(task: XR_CGameTask, id: i32);

    public remove_map_locations(flag: boolean): void;
    public set_icon_name(icon_name: string): void;
    public get_icon_name(): string;
    public set_description(title: string): void;
    public get_description(): string;
    public set_title(title: string): void;
    public get_title(): string;
    public set_map_location(location: string): void;
    public add_on_complete_func(value: string): void;
    public add_complete_info(value: string): void;
    public add_on_fail_info(value: string): void;
    public add_on_fail_func(value: string): void;
    public add_on_complete_info(value: string): void;
    public add_complete_func(value: string): void;
    public add_fail_func(value: string): void;
    public add_fail_info(value: string): void;
    public get_state(): TXR_TaskState;
    public get_type(): number; /* ETaskType */
    public set_type(type: i32 /* ETaskType */): void;
    public set_map_hint(hint: string): void;
    public change_map_location(value: string, value2: u16): void;
    public set_map_object_id(id: i32): void
  }
}
