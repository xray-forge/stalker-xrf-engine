import { Optional } from "@/mod/lib/types";

/** ********************************************************************************************************************
 * _g namespace:
 * ********************************************************************************************************************/

/** ********************************************************************************************************************
 * db namespace:
 * ********************************************************************************************************************/

// todo: Move to typescript codebase.
declare const zone_by_name: Record<string, unknown>;
declare const script_ids: Record<string, unknown>;
declare const storage: Record<string, unknown>;
declare const actor: Optional<string>;
declare const actor_proxy: unknown;
declare const heli: Record<string, unknown>;
declare const camp_storage: Record<string, unknown>;
declare const story_by_id: Record<string, unknown>;
declare const smart_terrain_by_id: Record<string, unknown>;
declare const info_restr: Record<string, unknown>;
declare const strn_by_respawn: Record<string, unknown>;
declare const heli_enemies: Record<string, unknown>;
declare const heli_enemy_count = 0;
declare const anim_obj_by_name: Record<string, unknown>;
declare const goodwill: { sympathy: Record<string, unknown>; relations: Record<string, unknown> };
declare const story_object: Record<string, unknown>;
declare const signal_light: Record<string, unknown>;
declare const offline_objects: Record<string, unknown>;
declare const anomaly_by_name: Record<string, unknown>;
declare const level_doors: Record<string, unknown>; // level doors, enables NPCs doors logic
declare const no_weap_zones: Record<string, unknown>;
declare const spawned_vertex_by_i: Record<string, unknown>;

declare function add_enemy(obj: unknown): void;
declare function delete_enemy(e_index: unknown): void;
declare function add_obj(obj: unknown): void;
declare function del_obj(obj: unknown): void;
declare function add_zone(zone: unknown): void;
declare function del_zone(zone: unknown): void;
declare function add_anomaly(anomaly: unknown): void;
declare function del_anomaly(anomaly: unknown): void;
declare function add_actor(obj: unknown): void;
declare function del_actor(): void;
declare function add_heli(obj: unknown): void;
declare function del_heli(obj: unknown): void;
declare function add_smart_terrain(obj: unknown): void;
declare function del_smart_terrain(obj: unknown): void;
declare function add_anim_obj(anim_obj: unknown, binder: unknown): void;
declare function del_anim_obj(anim_obj: unknown): void;
