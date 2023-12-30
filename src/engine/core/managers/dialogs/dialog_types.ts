import type { IConfigCondition } from "@/engine/core/utils/ini";
import type { LuaArray, Optional, TName, TStringId, TStringifiedBoolean } from "@/engine/lib/types";

/**
 * todo;
 */
export interface IPhrasesDescriptor {
  id: TStringId;
  name: TName;
  actorCommunity: LuaArray<TName> | "not_set" | "all";
  npcCommunity: LuaArray<TName> | "not_set";
  level: LuaArray<TName> | "not_set";
  wounded: boolean;
  once: TStringifiedBoolean | "always";
  info: LuaArray<IConfigCondition>;
  smart: Optional<string>;
  told?: boolean;
}

/**
 * Map of available in-game phrases.
 * Where key is id of phrases group and descriptor is meta-info about specific phrase.
 */
export type TPhrasesAvailableMap = LuaTable<TStringId, IPhrasesDescriptor>;

/**
 * todo;
 */
export type TPhrasesPriorityMap = LuaTable<
  number,
  LuaTable<string, number> & { told?: boolean; ignoreOnce?: Optional<boolean>; id?: -1 }
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
