import type { IConfigCondition } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TName, TStringId, TStringifiedBoolean } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IPhrasesDescriptor {
  id: TStringId;
  name: TName;
  npc_community: LuaArray<TName> | "not_set";
  level: LuaArray<TName> | "not_set";
  actor_community: LuaArray<TName> | "not_set" | "all";
  wounded: TStringifiedBoolean;
  once: string;
  info: LuaArray<IConfigCondition>;
  smart: Optional<string>;
  told?: boolean;
}

/**
 * Map of available in-game phrases.
 * Where key is id of phrases group and descriptor is meta-info about specific phrase.
 */
export type TAvailablePhrasesMap = LuaTable<TStringId, IPhrasesDescriptor>;

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
  ANOMALIES = "anomalies",
  HELLO = "hello",
  INFORMATION = "information",
  JOB = "job",
  PLACE = "place",
}
