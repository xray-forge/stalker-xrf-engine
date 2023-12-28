import type { IConfigCondition } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TName, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IPhrasesDescriptor {
  id: TStringId;
  name: TName;
  npc_community: LuaArray<any> | "not_set";
  level: LuaArray<any> | "not_set";
  actor_community: LuaArray<any> | "not_set" | "all";
  wounded: string;
  once: string;
  info: LuaArray<IConfigCondition>;
  smart: Optional<string>;
  told?: boolean;
}

/**
 * todo;
 */
export type TPHRTable = LuaTable<TStringId, IPhrasesDescriptor>;

/**
 * todo;
 */
export type TPRTTable = LuaTable<
  number,
  LuaTable<string, number> & { told?: boolean; ignore_once?: Optional<boolean>; id?: -1 }
>;

/**
 * todo;
 */
export enum EGenericPhraseCategory {
  HELLO = "hello",
  ANOMALIES = "anomalies",
  PLACE = "place",
  JOB = "job",
  INFORMATION = "information",
  DEFAULT = "default",
}
