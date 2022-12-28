declare module "xray16" {
  /**
   * C++ class cse_motion {
   */
  export interface IXR_cse_motion {
  }

  /**
   * C++ class cse_alife_group_abstract {
   */
  export interface IXR_cse_alife_group_abstract {
  }

  /**
   * C++ class cse_ph_skeleton {
   */
  export interface IXR_cse_ph_skeleton {
  }

  /**
   *  C++ class cse_visual {
   */
  export interface IXR_cse_visual {
  }

  /**
   * C++ class cse_shape {
   */
  export interface IXR_cse_shape {
  }

  /**
   *  C++ class cse_alife_schedulable : ipure_schedulable_object {
   */
  export interface IXR_cse_alife_schedulable extends IXR_ipure_schedulable_object {
  }

  /**
   *  C++ class ipure_alife_load_object {
   */
  export interface IXR_ipure_alife_load_object {
  }

  /**
   *  C++ class ipure_alife_save_object {
   */
  export interface IXR_ipure_alife_save_object {
  }

  /**
   *  C++ class ipure_alife_load_save_object : ipure_alife_load_object,ipure_alife_save_object {
   */
  export interface IXR_ipure_alife_load_save_object extends IXR_ipure_alife_load_object, IXR_ipure_alife_save_object {
  }

  /**
   *  C++ class ipure_server_object : ipure_alife_load_save_object {
   */
  export interface IXR_ipure_server_object extends IXR_ipure_alife_load_save_object {
  }

  /**
   *  C++ class cpure_server_object : ipure_server_object {
   */
  export interface IXR_cpure_server_object extends IXR_ipure_server_object {
  }

  /**
   *  C++ class cse_abstract : cpure_server_object {
   */
  export interface IXR_cse_abstract extends IXR_cpure_server_object{
    angle: number;
    id: number;
    parent_id: number;
    position: unknown;
    script_version: unknown

    name(): string;
    clsid(): TXR_ClsId;
    spawn_ini(): XR_ini_file;
    section_name(): string;

    UPDATE_Read(packet: XR_net_packet): unknown;
    STATE_Read(packet: XR_net_packet, value: number): unknown;
    UPDATE_Write(packet: XR_net_packet): void;
    STATE_Write(packet: XR_net_packet): void;
  }

  /**
   * C++ class cse_alife_object_breakable : cse_alife_dynamic_object_visual {
   */
  export interface IXR_cse_alife_object_breakable extends IXR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_trader_abstract {
   */
  export interface IXR_cse_alife_trader_abstract {
     reputation(): number;
     rank(): number;
     community(): unknown;
  }

  /**
   * C++ class cse_alife_object : cse_abstract {
   */
  export interface IXR_cse_alife_object extends IXR_cse_abstract {
    m_game_vertex_id: number;
    m_level_vertex_id: number;
    m_story_id: number;
    online: boolean;

    constructor(value: string): IXR_cse_abstract;

    used_ai_locations(): boolean;
    use_ai_locations(value: boolean): boolean;

    can_save(): boolean;

    can_switch_online(): boolean;
    can_switch_online(value: boolean): boolean;

    init(): void;

    interactive(): unknown;

    visible_for_map(): boolean
    visible_for_map(value: boolean): boolean;

    can_switch_offline(): boolean;
    can_switch_offline(value: boolean): boolean;

    move_offline(): void
    move_offline(value: boolean): void
  }

  /**
   * C++ class cse_alife_dynamic_object : cse_alife_object {
   */
  export interface IXR_cse_alife_dynamic_object extends IXR_cse_alife_object {
    switch_offline(): unknown;
    switch_online(): unknown;

    keep_saved_data_anyway(): unknown;

    on_register(): unknown;
    on_before_register(): unknown;

    on_spawn(): unknown;
    on_unregister(): unknown;
  }

  /**
   * C++ class cse_alife_space_restrictor : cse_alife_dynamic_object,cse_shape {
   */
  export interface IXR_cse_alife_space_restrictor extends IXR_cse_alife_dynamic_object, IXR_cse_shape {
  }

  /**
   * C++ class cse_alife_dynamic_object_visual : cse_alife_dynamic_object,cse_visual {
   */
  export interface IXR_cse_alife_dynamic_object_visual extends IXR_cse_alife_dynamic_object, IXR_cse_visual {
  }

  /**
   * C++ class cse_custom_zone : cse_alife_dynamic_object,cse_shape {
   */
  export interface IXR_cse_custom_zone extends IXR_cse_alife_dynamic_object, IXR_cse_shape {
  }

  /**
   * C++ class cse_alife_creature_abstract : cse_alife_dynamic_object_visual {
   */
  export interface IXR_cse_alife_creature_abstract extends IXR_cse_alife_dynamic_object_visual {
    group: number;
    squad: number;
    team: number;
    health(): unknown;

    on_death(cse_abstract: IXR_cse_alife_creature_abstract): unknown;

    alive(): boolean;

    g_team(): unknown;
    g_group(): unknown;
    g_squad(): unknown;

    o_torso(cse_alife_creature_abstract: IXR_cse_alife_creature_abstract): unknown;

  }

  /**
   * C++ class cse_alife_human_abstract : cse_alife_trader_abstract,cse_alife_monster_abstract {
   * */
  export interface IXR_cse_alife_human_abstract extends IXR_cse_alife_monster_abstract {
    profile_name(trader: unknown /* cse_alife_trader_abstract */): unknown;
    set_rank(rank: number): void;
    reputation(): unknown;
    community(): string;
  }

  /**
   * C++ class cse_alife_inventory_item {
   */
  export interface IXR_cse_alife_inventory_item {
  }

  /**
   * C++ class cse_alife_item : cse_alife_dynamic_object_visual,cse_alife_inventory_item {
   */
  export interface IXR_cse_alife_item extends IXR_cse_alife_dynamic_object_visual, IXR_cse_alife_inventory_item {
    bfUseful(): unknown;
  }

  /**
   * C++ class cse_alife_item_weapon : cse_alife_item {
   */
  export interface IXR_cse_alife_item_weapon extends IXR_cse_alife_item {
    clone_addons(cse_alife_item_weapon: IXR_cse_alife_item_weapon): unknown;
  }

  /**
   * C++ class cse_alife_item_weapon_magazined : cse_alife_item_weapon {
   */
  export interface IXR_cse_alife_item_weapon_magazined extends IXR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_alife_item_weapon_magazined_w_gl : cse_alife_item_weapon_magazined {
   */
  export interface IXR_cse_alife_item_weapon_magazined_w_gl extends IXR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_alife_item_weapon_shotgun : cse_alife_item_weapon {
   */
  export interface IXR_cse_alife_item_weapon_shotgun extends IXR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_alife_level_changer : cse_alife_space_restrictor {
   */
  export interface IXR_cse_alife_level_changer extends IXR_cse_alife_space_restrictor {
  }

  /**
   * C++ class cse_alife_monster_abstract : cse_alife_creature_abstract,cse_alife_schedulable {
   */
  export interface IXR_cse_alife_monster_abstract extends IXR_cse_alife_creature_abstract, IXR_cse_alife_schedulable {
     group_id: number | null;
     m_smart_terrain_id: number | null;

    kill(): unknown;

    update(): unknown;

    force_set_goodwill(
      cse_alife_monster_abstract: IXR_cse_alife_monster_abstract, value1: number, value2: number
    ): unknown;

    clear_smart_terrain(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;

    travel_speed(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;
    travel_speed(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract, value: number): unknown;

    smart_terrain_task_deactivate(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;
    smart_terrain_task_activate(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;

    current_level_travel_speed(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;
    current_level_travel_speed(
      cse_alife_monster_abstract:
        IXR_cse_alife_monster_abstract, value: number
    ): unknown;

     brain(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;

     has_detector(): unknown;

     smart_terrain_id(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;

     rank(): unknown;
  }

  /**
   * C++ class cse_alife_monster_base : cse_alife_monster_abstract,cse_ph_skeleton {
   */
  export interface IXR_cse_alife_monster_base extends IXR_cse_alife_monster_abstract, IXR_cse_ph_skeleton {
  }

  /**
   *  C++ class cse_alife_monster_rat : cse_alife_monster_abstract,cse_alife_inventory_item {
   */
  export interface IXR_cse_alife_monster_rat extends IXR_cse_alife_monster_abstract, IXR_cse_alife_inventory_item {
  }

  /**
   * C++ class cse_alife_monster_zombie : cse_alife_monster_abstract {}
   */
  export interface IXR_cse_alife_monster_zombie extends IXR_cse_alife_monster_abstract {
  }

  /**
   * C++ class cse_alife_mounted_weapon : cse_alife_dynamic_object_visual {
   */
  export interface IXR_cse_alife_mounted_weapon extends IXR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_inventory_box : cse_alife_dynamic_object_visual {
   */
  export interface IXR_cse_alife_inventory_box extends IXR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_item_ammo : cse_alife_item {
   */
  export interface IXR_cse_alife_item_ammo extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_artefact : cse_alife_item {
   */
  export interface IXR_cse_alife_item_artefact extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_bolt : cse_alife_item {
   */
  export interface IXR_cse_alife_item_bolt extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_custom_outfit : cse_alife_item {
   */
  export interface IXR_cse_alife_item_custom_outfit extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_document : cse_alife_item {
   */
  export interface IXR_cse_alife_item_document extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_explosive : cse_alife_item {
   */
  export interface IXR_cse_alife_item_explosive extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_grenade : cse_alife_item {
   */
  export interface IXR_cse_alife_item_grenade extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_pda : cse_alife_item {
   */
  export interface IXR_cse_alife_item_pda extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_torch : cse_alife_item
   */
  export interface IXR_cse_alife_item_torch extends IXR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_weapon_auto_shotgun : cse_alife_item_weapon {
   */
  export interface IXR_cse_alife_item_weapon_auto_shotgun extends IXR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_anomalous_zone : cse_custom_zone {
   */
  export interface IXR_cse_anomalous_zone extends IXR_cse_custom_zone {
  }

  /**
   * C++ class cse_alife_object_climable : cse_shape,cse_abstract {
   **/
  export interface IXR_cse_alife_object_climable extends IXR_cse_shape, IXR_cse_abstract {
    init(): void;
  }

  /**
   * C++ class cse_alife_object_hanging_lamp : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   **/
  export interface IXR_cse_alife_object_hanging_lamp extends IXR_cse_alife_dynamic_object_visual, IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_object_physic : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   **/
  export interface IXR_cse_alife_object_physic extends IXR_cse_alife_dynamic_object_visual, IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_object_projector : cse_alife_dynamic_object_visual {
   **/
  export interface IXR_cse_alife_object_projector extends IXR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_online_offline_group : cse_alife_dynamic_object,cse_alife_schedulable {
   **/
  export interface IXR_cse_alife_online_offline_group extends IXR_cse_alife_dynamic_object, IXR_cse_alife_schedulable {
     update(): unknown;
     register_member(id: number): unknown;
     clear_location_types(): unknown;
     get_current_task(): unknown;
     commander_id(): unknown;
     unregister_member(id: number): unknown;
     squad_members(): unknown;
     force_change_position(vector: XR_vector): unknown;
     add_location_type(location: string): unknown;
     npc_count(): number;
  }

  /**
   * C++ class cse_alife_ph_skeleton_object : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   */
  export interface IXR_cse_alife_ph_skeleton_object extends IXR_cse_alife_dynamic_object_visual, IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_psydog_phantom : cse_alife_monster_base {
   */
  export interface IXR_cse_alife_psydog_phantom extends IXR_cse_alife_monster_abstract {
  }

  /**
   * C++ class cse_alife_smart_zone : cse_alife_space_restrictor,cse_alife_schedulable {
   */
  export interface IXR_cse_alife_smart_zone extends IXR_cse_alife_space_restrictor, IXR_cse_alife_schedulable {
    detect_probability(): unknown;
    smart_touch(cse_alife_monster_abstract: IXR_cse_alife_monster_abstract): unknown;
    unregister_npc(cse_alife_monster_abstract:IXR_cse_alife_monster_abstract): unknown;
    register_npc(cse_alife_monster_abstract:IXR_cse_alife_monster_abstract): unknown;
    suitable(cse_alife_monster_abstract:IXR_cse_alife_monster_abstract): unknown;
    task(cse_alife_monster_abstract:IXR_cse_alife_monster_abstract): unknown;
    enabled(cse_alife_monster_abstract:IXR_cse_alife_monster_abstract): unknown;
    update(): void;
  }

  /**
   * C++ class cse_alife_team_base_zone : cse_alife_space_restrictor {
   */
  export interface IXR_cse_alife_team_base_zone extends IXR_cse_alife_space_restrictor {
  }

  /**
   * C++ class cse_torrid_zone : cse_custom_zone,cse_motion {
   */
  export interface IXR_cse_torrid_zone extends IXR_cse_custom_zone, IXR_cse_abstract {
  }

  /**
   * C++ class cse_alife_trader : cse_alife_dynamic_object_visual,cse_alife_trader_abstract {
   */
  export interface IXR_cse_alife_trader extends IXR_cse_alife_dynamic_object_visual, IXR_cse_alife_trader_abstract {
     profile_name(cse_alife_trader_abstract: IXR_cse_alife_trader_abstract): string;
  }

  /**
   * C++ class cse_smart_cover : cse_alife_dynamic_object {
   */
  export interface IXR_cse_smart_cover extends IXR_cse_alife_dynamic_object {
     description(): string;
     set_available_loopholes(object: unknown): unknown;
  }

  /**
   * C++ class cse_alife_car : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   */
  export interface IXR_cse_alife_car extends IXR_cse_alife_dynamic_object_visual, IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_creature_actor : cse_alife_creature_abstract,cse_alife_trader_abstract,cse_ph_skeleton {
   */
  export interface IXR_cse_alife_creature_actor extends
    IXR_cse_alife_creature_abstract, IXR_cse_alife_trader_abstract, IXR_cse_ph_skeleton {
    profile_name(cse_alife_trader_abstract: IXR_cse_alife_trader): unknown;
  }

  /**
   * C++ class cse_alife_creature_crow : cse_alife_creature_abstract {
   */
  export interface IXR_cse_alife_creature_crow extends IXR_cse_alife_creature_abstract {
  }

  /**
   * C++ class cse_alife_creature_phantom : cse_alife_creature_abstract {
   */
  export interface IXR_cse_alife_creature_phantom extends IXR_cse_alife_creature_abstract {
  }

  /**
   * C++ class cse_alife_graph_point : cse_abstract {
   */
  export interface IXR_cse_alife_graph_point extends IXR_cse_abstract {
    init(): void;
  }

  /**
   * C++ class cse_alife_helicopter : cse_alife_dynamic_object_visual,cse_motion,cse_ph_skeleton {
   */
  export interface IXR_cse_alife_helicopter extends IXR_cse_alife_dynamic_object_visual,
    IXR_cse_motion, IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_human_stalker : cse_alife_human_abstract,cse_ph_skeleton {
   */
  export interface IXR_cse_alife_human_stalker extends IXR_cse_alife_human_abstract, IXR_cse_ph_skeleton {
  }
}
