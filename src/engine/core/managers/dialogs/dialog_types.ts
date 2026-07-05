import type { LuaArray, Nillable, TName, TStringId, TStringifiedBoolean } from "xray16/lib";

import type { IConfigCondition } from "@/engine/core/utils/ini";

/**
 * Descriptor of a single dialog phrase and the conditions controlling when it is available.
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
  smart: Nillable<string>;
  told?: boolean;
}

/**
 * Map of available in-game phrases.
 * Where key is id of phrases group and descriptor is meta-info about specific phrase.
 */
export type TPhrasesAvailableMap = LuaTable<TStringId, IPhrasesDescriptor>;

/**
 * Map of phrase priorities per object, where key is object id and value holds per-phrase priority and meta flags.
 */
export type TPhrasesPriorityMap = LuaTable<
  number,
  LuaTable<string, number> & { told?: boolean; ignoreOnce?: Nillable<boolean>; id?: -1 }
>;

/**
 * Enumeration of generic phrase categories used in dialogs.
 */
export const enum EGenericPhraseCategory {
  ANOMALIES = "anomalies",
  HELLO = "hello",
  INFORMATION = "information",
  JOB = "job",
  PLACE = "place",
}
