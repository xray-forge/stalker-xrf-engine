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
   * C++ class cse_alife_inventory_item {
   */
  export interface IXR_cse_alife_inventory_item {
  }

  /**
   * C++ class cse_alife_object_breakable : cse_alife_dynamic_object_visual {
   */
  export interface IXR_cse_alife_object_breakable extends XR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_trader_abstract {
   * @customConstructor cse_alife_trader_abstract
   */
  export class XR_cse_alife_trader_abstract {
    public reputation(): number;
    public rank(): number;
    public community(): unknown;
  }

  /**
   * C++ class cse_abstract : cpure_server_object {
   * @customConstructor cse_abstract
   */
  export class XR_cse_abstract extends XR_LuaBindBase implements IXR_cpure_server_object {
    public angle: number;
    public id: number;
    public parent_id: number;
    public position: XR_vector;
    public script_version: number;

    public __init(section: string): void;
    public constructor(section: string);

    public name(): string;
    public clsid(): TXR_ClsId;
    public spawn_ini(): XR_ini_file;
    public section_name(): string;

    public static UPDATE_Read(this: void, target: XR_cse_abstract,packet: XR_net_packet): void;
    public UPDATE_Read(packet: XR_net_packet): void;

    public static STATE_Read(this: void, target: XR_cse_abstract, packet: XR_net_packet, size: number): void;
    public STATE_Read(packet: XR_net_packet, size: number): void;

    public static UPDATE_Write(this: void, target: XR_cse_abstract, packet: XR_net_packet): void;
    public UPDATE_Write(packet: XR_net_packet): void;

    public static STATE_Write(this: void, target: XR_cse_abstract, packet: XR_net_packet): void;
    public STATE_Write(packet: XR_net_packet): void;
  }

  /**
   * C++ class cse_alife_object : cse_abstract {
   * @customConstructor cse_alife_object
   */
  export class XR_cse_alife_object extends XR_cse_abstract {
    public m_game_vertex_id: number;
    public m_level_vertex_id: number;
    public m_story_id: number;
    public online: boolean;

    public constructor(value: string);

    public used_ai_locations(): boolean;
    public use_ai_locations(value: boolean): boolean;

    public static can_save(this: void, target: XR_cse_alife_object): boolean;
    public can_save(): boolean;

    public static can_switch_online(this: void, target: XR_cse_alife_object): boolean;
    public static can_switch_online(this: void, target: XR_cse_alife_object, value: boolean): boolean;
    public can_switch_online(): boolean;
    public can_switch_online(value: boolean): boolean;

    public init(): void;

    public interactive(): unknown;

    public visible_for_map(): boolean
    public visible_for_map(value: boolean): boolean;

    public static can_switch_offline(this: void, target: XR_cse_alife_object): boolean;
    public static can_switch_offline(this: void, value: boolean, target: XR_cse_alife_object): boolean;
    public can_switch_offline(): boolean;
    public can_switch_offline(value: boolean): boolean;

    public move_offline(): void
    public move_offline(value: boolean): void

    public static update(this: void, target: XR_cse_alife_object): void;
    public update(): void;
  }

  /**
   * C++ class cse_alife_dynamic_object : cse_alife_object {
   * @customConstructor cse_alife_dynamic_object
   */
  export class XR_cse_alife_dynamic_object extends XR_cse_alife_object {
    public static switch_offline(this: void, target: XR_cse_alife_dynamic_object): void;
    public switch_offline(): void;

    public static switch_online(this: void, target: XR_cse_alife_dynamic_object): void;
    public switch_online(): void;

    public static keep_saved_data_anyway(this: void, target: XR_cse_alife_dynamic_object): boolean;
    public keep_saved_data_anyway(): boolean;

    public static on_register(this: void, target: XR_cse_alife_dynamic_object): void;
    public on_register(): void;

    public static on_before_register(this: void, target: XR_cse_alife_dynamic_object): void;
    public on_before_register(): void;

    public static on_spawn(this: void, target: XR_cse_alife_dynamic_object): void;
    public on_spawn(): void;

    public static on_unregister(this: void, target: XR_cse_alife_dynamic_object): void;
    public on_unregister(): void;
  }

  /**
   * C++ class cse_alife_space_restrictor : cse_alife_dynamic_object,cse_shape {
   * @customConstructor cse_alife_space_restrictor
   */
  export class XR_cse_alife_space_restrictor extends XR_cse_alife_dynamic_object implements IXR_cse_shape {
  }

  /**
   * C++ class cse_alife_dynamic_object_visual : cse_alife_dynamic_object,cse_visual {
   * @customConstructor cse_alife_dynamic_object_visual
   */
  export class XR_cse_alife_dynamic_object_visual extends XR_cse_alife_dynamic_object implements IXR_cse_visual {
  }

  /**
   * C++ class cse_custom_zone : cse_alife_dynamic_object,cse_shape {
   * @customConstructor cse_custom_zone
   */
  export class XR_cse_custom_zone extends XR_cse_alife_dynamic_object implements IXR_cse_shape {
  }

  /**
   * C++ class cse_alife_creature_abstract : cse_alife_dynamic_object_visual {
   * @customConstructor cse_alife_creature_abstract
   */
  export class XR_cse_alife_creature_abstract extends XR_cse_alife_dynamic_object_visual {
    public group: number;
    public squad: number;
    public team: number;

    public static health(this:void, target: XR_cse_alife_creature_abstract): number;
    public health(): number;

    public static on_death(
      this:void,
      target: XR_cse_alife_creature_abstract,
      killer: XR_cse_alife_creature_abstract
    ): void;
    public on_death(killer: XR_cse_alife_creature_abstract): void;

    public alive(): boolean;

    public g_team(): unknown;
    public g_group(): unknown;
    public g_squad(): unknown;

    public o_torso(cse_alife_creature_abstract: XR_cse_alife_creature_abstract): unknown;

  }

  /**
   * C++ class cse_alife_human_abstract : cse_alife_trader_abstract,cse_alife_monster_abstract {
   * @customConstructor XR_cse_alife_human_abstract
   * */
  export class XR_cse_alife_human_abstract extends XR_cse_alife_monster_abstract {
    public profile_name(trader: unknown /* cse_alife_trader_abstract */): unknown;
    public set_rank(rank: number): void;
    public reputation(): unknown;
    public community(): string;
  }

  /**
   * C++ class cse_alife_item : cse_alife_dynamic_object_visual,cse_alife_inventory_item {
   * @customConstructor cse_alife_item
   */
  export class XR_cse_alife_item extends XR_cse_alife_dynamic_object_visual implements IXR_cse_alife_inventory_item {
    public bfUseful(): unknown;
  }

  /**
   * C++ class cse_alife_item_weapon : cse_alife_item {
   * @customConstructor cse_alife_item_weapon
   */
  export class XR_cse_alife_item_weapon extends XR_cse_alife_item {
    public clone_addons(cse_alife_item_weapon: XR_cse_alife_item_weapon): unknown;
  }

  /**
   * C++ class cse_zone_visual : cse_anomalous_zone,cse_visual {
   * @customConstructor cse_zone_visual
   */
  export class XR_cse_zone_visual extends XR_cse_anomalous_zone implements IXR_cse_visual {
  }

  /**
   * C++ class cse_spectator : cse_abstract {
   * @customConstructor cse_spectator
   */
  export class XR_cse_spectator extends XR_cse_abstract {
    public init(): void;
  }

  /**
   * C++ class cse_temporary : cse_abstract {
   * @customConstructor cse_temporary
   */
  export class XR_cse_temporary extends XR_cse_abstract {
    public init(): void;
  }

  /**
   * C++ class cse_alife_item_weapon_magazined : cse_alife_item_weapon {
   * @customConstructor cse_alife_item_weapon_magazined
   */
  export class XR_cse_alife_item_weapon_magazined extends XR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_alife_item_weapon_magazined_w_gl : cse_alife_item_weapon_magazined {
   * @customConstructor cse_alife_item_weapon_magazined_w_gl
   */
  export class XR_cse_alife_item_weapon_magazined_w_gl extends XR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_alife_item_weapon_shotgun : cse_alife_item_weapon {
   * @customConstructor cse_alife_item_weapon_shotgun
   */
  export class XR_cse_alife_item_weapon_shotgun extends XR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_alife_level_changer : cse_alife_space_restrictor {
   * @customConstructor cse_alife_level_changer
   */
  export class XR_cse_alife_level_changer extends XR_cse_alife_space_restrictor {
  }

  /**
   * C++ class cse_alife_monster_abstract : cse_alife_creature_abstract,cse_alife_schedulable {
   * @customConstructor cse_alife_monster_abstract
   */
  export class XR_cse_alife_monster_abstract
    extends XR_cse_alife_creature_abstract
    implements IXR_cse_alife_schedulable {

    public group_id: number;
    public m_smart_terrain_id: number;

    public kill(): void;

    public force_set_goodwill(
      cse_alife_monster_abstract: XR_cse_alife_monster_abstract, value1: number, value2: number
    ): unknown;

    public clear_smart_terrain(cse_alife_monster_abstract: XR_cse_alife_monster_abstract): unknown;

    public travel_speed(cse_alife_monster_abstract: XR_cse_alife_monster_abstract): unknown;
    public travel_speed(cse_alife_monster_abstract: XR_cse_alife_monster_abstract, value: number): unknown;

    public smart_terrain_task_deactivate(cse_alife_monster_abstract: XR_cse_alife_monster_abstract): unknown;
    public smart_terrain_task_activate(cse_alife_monster_abstract: XR_cse_alife_monster_abstract): unknown;

    public current_level_travel_speed(cse_alife_monster_abstract: XR_cse_alife_monster_abstract): unknown;
    public current_level_travel_speed(
      cse_alife_monster_abstract:
        XR_cse_alife_monster_abstract, value: number
    ): unknown;

    public static brain(this: void, target: XR_cse_alife_monster_abstract): XR_CAILifeMonsterBrain;
    public brain(): XR_CAILifeMonsterBrain;

    public has_detector(): unknown;

    public static smart_terrain_id(this: void, target: XR_cse_alife_monster_abstract): number;
    public smart_terrain_id(): number;

    public rank(): unknown;
  }

  /**
   * C++ class cse_alife_monster_base : cse_alife_monster_abstract,cse_ph_skeleton {
   * @customConstructor cse_alife_monster_base
   */
  export class XR_cse_alife_monster_base extends XR_cse_alife_monster_abstract implements IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_monster_rat : cse_alife_monster_abstract,cse_alife_inventory_item {
   * @customConstructor cse_alife_monster_rat
   */
  export class XR_cse_alife_monster_rat extends XR_cse_alife_monster_abstract implements IXR_cse_alife_inventory_item {
  }

  /**
   * C++ class cse_alife_monster_zombie : cse_alife_monster_abstract {}
   * @customConstructor cse_alife_monster_zombie
   */
  export class XR_cse_alife_monster_zombie extends XR_cse_alife_monster_abstract {
  }

  /**
   * C++ class cse_alife_mounted_weapon : cse_alife_dynamic_object_visual {
   * @customConstructor cse_alife_mounted_weapon
   */
  export class XR_cse_alife_mounted_weapon extends XR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_inventory_box : cse_alife_dynamic_object_visual {
   * @customConstructor cse_alife_inventory_box
   */
  export class XR_cse_alife_inventory_box extends XR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_item_ammo : cse_alife_item {
   * @customConstructor cse_alife_item_ammo
   */
  export class XR_cse_alife_item_ammo extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_artefact : cse_alife_item {
   * @customConstructor cse_alife_item_artefact
   */
  export class XR_cse_alife_item_artefact extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_bolt : cse_alife_item {
   * @customConstructor cse_alife_item_bolt
   */
  export class XR_cse_alife_item_bolt extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_custom_outfit : cse_alife_item {
   * @customConstructor cse_alife_item_custom_outfit
   */
  export class XR_cse_alife_item_custom_outfit extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_helmet : cse_alife_item {
   * @customConstructor cse_alife_item_helmet
   */
  export class XR_cse_alife_item_helmet extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_document : cse_alife_item {
   * @customConstructor cse_alife_item_document
   */
  export class XR_cse_alife_item_document extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_explosive : cse_alife_item {
   * @customConstructor cse_alife_item_explosive
   */
  export class XR_cse_alife_item_explosive extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_grenade : cse_alife_item {
   * @customConstructor cse_alife_item_grenade
   */
  export class XR_cse_alife_item_grenade extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_pda : cse_alife_item {
   * @customConstructor cse_alife_item_pda
   */
  export class XR_cse_alife_item_pda extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_detector : cse_alife_item {
   * @customConstructor cse_alife_item_detector
   */
  export class XR_cse_alife_item_detector extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_torch : cse_alife_item
   * @customConstructor cse_alife_item_torch
   */
  export class XR_cse_alife_item_torch extends XR_cse_alife_item {
  }

  /**
   * C++ class cse_alife_item_weapon_auto_shotgun : cse_alife_item_weapon {
   * @customConstructor cse_alife_item_weapon_auto_shotgun
   */
  export class XR_cse_alife_item_weapon_auto_shotgun extends XR_cse_alife_item_weapon {
  }

  /**
   * C++ class cse_anomalous_zone : cse_custom_zone {
   * @customConstructor cse_anomalous_zone
   */
  export class XR_cse_anomalous_zone extends XR_cse_custom_zone {
  }

  /**
   * C++ class cse_alife_object_climable : cse_shape,cse_abstract {
   * @customConstructor cse_alife_object_climable
   **/
  export class XR_cse_alife_object_climable extends XR_cse_abstract implements IXR_cse_shape {
    public init(): void;
  }

  /**
   * C++ class cse_alife_object_hanging_lamp : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   * @customConstructor cse_alife_object_hanging_lamp
   **/
  export class XR_cse_alife_object_hanging_lamp extends XR_cse_alife_dynamic_object_visual
    implements IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_object_physic : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   * @customConstructor cse_alife_object_physic
   **/
  export class XR_cse_alife_object_physic extends XR_cse_alife_dynamic_object_visual implements IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_object_projector : cse_alife_dynamic_object_visual {
   * @customConstructor cse_alife_object_projector
   **/
  export class XR_cse_alife_object_projector extends XR_cse_alife_dynamic_object_visual {
  }

  /**
   * C++ class cse_alife_online_offline_group : cse_alife_dynamic_object,cse_alife_schedulable {
   * @customConstructor cse_alife_online_offline_group
   **/
  export class XR_cse_alife_online_offline_group extends XR_cse_alife_dynamic_object
    implements IXR_cse_alife_schedulable {

    public update(): unknown;
    public register_member(id: number): unknown;
    public clear_location_types(): unknown;
    public get_current_task(): unknown;
    public commander_id(): unknown;
    public unregister_member(id: number): unknown;
    public squad_members(): unknown;
    public force_change_position(vector: XR_vector): unknown;
    public add_location_type(location: string): unknown;
    public npc_count(): number;
  }

  /**
   * C++ class cse_alife_ph_skeleton_object : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   * @customConstructor cse_alife_ph_skeleton_object
   */
  export class XR_cse_alife_ph_skeleton_object extends XR_cse_alife_dynamic_object_visual
    implements IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_psydog_phantom : cse_alife_monster_base {
   * @customConstructor cse_alife_psydog_phantom
   */
  export class XR_cse_alife_psydog_phantom extends XR_cse_alife_monster_abstract {
  }

  /**
   * C++ class cse_alife_smart_zone : cse_alife_space_restrictor,cse_alife_schedulable {
   * @customConstructor cse_alife_smart_zone
   */
  export class XR_cse_alife_smart_zone extends XR_cse_alife_space_restrictor implements IXR_cse_alife_schedulable {
    public detect_probability(): unknown;
    public smart_touch(cse_alife_monster_abstract: XR_cse_alife_monster_abstract): unknown;
    public unregister_npc(cse_alife_monster_abstract:XR_cse_alife_monster_abstract): unknown;
    public register_npc(cse_alife_monster_abstract:XR_cse_alife_monster_abstract): unknown;
    public suitable(cse_alife_monster_abstract:XR_cse_alife_monster_abstract): unknown;
    public task(cse_alife_monster_abstract:XR_cse_alife_monster_abstract): unknown;
    public enabled(cse_alife_monster_abstract:XR_cse_alife_monster_abstract): unknown;
    public update(): void;
  }

  /**
   * C++ class cse_alife_team_base_zone : cse_alife_space_restrictor {
   * @customConstructor cse_alife_team_base_zone
   */
  export class XR_cse_alife_team_base_zone extends XR_cse_alife_space_restrictor {
  }

  /**
   * C++ class cse_torrid_zone : cse_custom_zone,cse_motion {
   * @customConstructor cse_torrid_zone
   */
  export class XR_cse_torrid_zone extends XR_cse_custom_zone implements XR_cse_abstract {
  }

  /**
   * C++ class cse_alife_trader : cse_alife_dynamic_object_visual,cse_alife_trader_abstract {
   * @customConstructor cse_alife_trader
   */
  export class XR_cse_alife_trader extends XR_cse_alife_dynamic_object_visual implements XR_cse_alife_trader_abstract {
    public profile_name(cse_alife_trader_abstract: XR_cse_alife_trader_abstract): string;
    public community(): unknown;
    public rank(): number;
    public reputation(): number;
  }

  /**
   * C++ class cse_smart_cover : cse_alife_dynamic_object {
   * @customConstructor cse_smart_cover
   */
  export class XR_cse_smart_cover extends XR_cse_alife_dynamic_object {
    public description(): string;
    public set_available_loopholes(object: unknown): unknown;
  }

  /**
   * C++ class cse_alife_car : cse_alife_dynamic_object_visual,cse_ph_skeleton {
   * @customConstructor cse_alife_car
   */
  export class XR_cse_alife_car extends XR_cse_alife_dynamic_object_visual implements IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_creature_actor : cse_alife_creature_abstract,cse_alife_trader_abstract,cse_ph_skeleton {
   * @customConstructor cse_alife_creature_actor
   */
  export class XR_cse_alife_creature_actor
    extends XR_cse_alife_creature_abstract
    implements IXR_cse_ph_skeleton, XR_cse_alife_trader_abstract {

    public profile_name(cse_alife_trader_abstract: XR_cse_alife_trader): unknown;

    public community(): unknown;
    public rank(): number;
    public reputation(): number;
  }

  /**
   * C++ class cse_alife_creature_crow : cse_alife_creature_abstract {
   * @customConstructor cse_alife_creature_crow
   */
  export class XR_cse_alife_creature_crow extends XR_cse_alife_creature_abstract {
  }

  /**
   * C++ class cse_alife_creature_phantom : cse_alife_creature_abstract {
   * @customConstructor cse_alife_creature_phantom
   */
  export class XR_cse_alife_creature_phantom extends XR_cse_alife_creature_abstract {
  }

  /**
   * C++ class cse_alife_graph_point : cse_abstract {
   * @customConstructor cse_alife_graph_point
   */
  export class XR_cse_alife_graph_point extends XR_cse_abstract {
    public init(): void;
  }

  /**
   * C++ class cse_alife_helicopter : cse_alife_dynamic_object_visual,cse_motion,cse_ph_skeleton {
   * @customConstructor cse_alife_helicopter
   */
  export class XR_cse_alife_helicopter
    extends XR_cse_alife_dynamic_object_visual
    implements IXR_cse_motion, IXR_cse_ph_skeleton {
  }

  /**
   * C++ class cse_alife_human_stalker : cse_alife_human_abstract,cse_ph_skeleton {
   * @customConstructor cse_alife_human_stalker
   */
  export class XR_cse_alife_human_stalker extends XR_cse_alife_human_abstract implements IXR_cse_ph_skeleton {
  }
}
