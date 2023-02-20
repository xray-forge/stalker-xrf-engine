import type { CampStoryManager } from "@/mod/scripts/core/schemes/base/CampStoryManager";
import type { PatrolManager } from "@/mod/scripts/core/schemes/patrol/SchemePatrol";
import type { ReachTaskPatrolManager } from "@/mod/scripts/core/schemes/reach_task/ReachTaskPatrolManager";
import type { AbstractPlayableSound } from "@/mod/scripts/core/sound/playable_sounds/AbstractPlayableSound";

export * from "@/mod/scripts/core/db/registry";
export * from "@/mod/scripts/core/db/objects";
export * from "@/mod/scripts/core/db/doors";
export * from "@/mod/scripts/core/db/actor";
export * from "@/mod/scripts/core/db/helicopters";
export * from "@/mod/scripts/core/db/anomalies";
export * from "@/mod/scripts/core/db/zones";
export * from "@/mod/scripts/core/db/smart_terrains";
export * from "@/mod/scripts/core/db/offline";

// todo: Move game volume to db.

export const reactTaskPatrols: LuaTable<string, ReachTaskPatrolManager> = new LuaTable();
export const patrols: LuaTable<number, PatrolManager> = new LuaTable();
export const kamp_stalkers: LuaTable<number, boolean> = new LuaTable();
export const CAMPS: LuaTable<number, CampStoryManager> = new LuaTable(); // Camp stories.

export const sound_themes: LuaTable<string, AbstractPlayableSound> = new LuaTable();
