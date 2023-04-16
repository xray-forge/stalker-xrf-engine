import { alife, game_object, XR_cse_alife_creature_abstract, XR_game_object } from "xray16";

import { getObjectIdByStoryId } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { Optional, TName, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function getSmartTerrainByName(name: TName): Optional<SmartTerrain> {
  return SimulationBoardManager.getInstance().getSmartTerrainByName(name);
}

/**
 * todo;
 */
export function get_gulag_by_sid(storyId: TStringId): Optional<SmartTerrain> {
  return alife().object(getObjectIdByStoryId(storyId)!);
}

/**
 * todo;
 * todo: Fix SID number/string mismatch.
 */
export function get_gulag(name_or_sid: string | number): Optional<SmartTerrain> {
  return type(name_or_sid) === "number"
    ? get_gulag_by_sid(name_or_sid as string)
    : getSmartTerrainByName(name_or_sid as string);
}

/**
 * todo;
 * todo;
 */
export function getObjectBoundSmart(obj: XR_game_object): Optional<SmartTerrain> {
  const se_obj: Optional<XR_cse_alife_creature_abstract> = alife().object(obj.id());

  if (se_obj === null) {
    return null;
  }

  return se_obj.m_smart_terrain_id === MAX_U16 ? null : alife().object(se_obj.m_smart_terrain_id);
}

/**
 * todo;
 * todo;
 */
export function setGulagRelation(name_or_sid: string | number, relation: number, target_obj: XR_game_object): void {
  const gulag = get_gulag(name_or_sid);

  if (gulag) {
    // todo: check how is used, not valid typing or mistake?
    // todo: check how is used, not valid typing or mistake?
    // todo: check how is used, not valid typing or mistake?
    (gulag as unknown as XR_game_object).set_relation(relation, target_obj);
  }
}

/**
 * todo;
 * todo;
 */
export function setGulagGoodwill(name_or_sid: string | number, goodwill: number, target_obj: XR_game_object): void {
  const gulag = get_gulag(name_or_sid);

  if (gulag) {
    // todo: check how is used, not valid typing or mistake?
    // todo: check how is used, not valid typing or mistake?
    // todo: check how is used, not valid typing or mistake?
    (gulag as unknown as XR_game_object).set_goodwill(goodwill, target_obj);
  }
}

/**
 * todo;
 * todo;
 */
export function setGulagEnemy(name_or_sid: string | number, target_obj: XR_game_object): void {
  setGulagRelation(name_or_sid, game_object.enemy, target_obj);
}

/**
 * todo;
 * todo;
 */
export function setGulagNeutral(name_or_sid: string | number, target_obj: XR_game_object): void {
  setGulagRelation(name_or_sid, game_object.neutral, target_obj);
}

/**
 * todo;
 * todo;
 */
export function resetJob(obj: XR_game_object): void {
  const gulag = getObjectBoundSmart(obj);

  if (gulag) {
    // todo: check how is used, not valid typing or mistake?
    // todo: check how is used, not valid typing or mistake?
    (gulag as any).free_obj_and_reinit(obj.id());
    gulag.update();
  }
}

/**
 * todo;
 * todo;
 */
export function free_object(obj: XR_game_object): void {
  const gulag = getObjectBoundSmart(obj);

  if (gulag) {
    (gulag as any).free_obj(obj.id());
    // --gulag:update()
  }
}

/**
 * todo;
 * todo;
 */
export function find_stalker_for_job(obj: XR_game_object, need_job: string): void {
  const smart = getObjectBoundSmart(obj)!;

  for (const [k, v] of smart.objectJobDescriptors) {
    const objectJob = smart.jobsData.get(v.job_id);

    if (objectJob !== null && objectJob.reserve_job === true) {
      const selected_npc_data = smart.objectJobDescriptors.get(k);

      selected_npc_data.need_job = need_job;

      return;
    }
  }
}

/**
 * todo;
 * todo;
 */
export function switch_to_desired_job(npc: XR_game_object): void {
  const smart = getObjectBoundSmart(npc)!;

  smart.switch_to_desired_job(npc);
}
