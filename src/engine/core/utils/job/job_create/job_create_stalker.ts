import { SmartTerrain } from "@/engine/core/objects";
import { createStalkerAnimpointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_animpoint";
import { createStalkerCamperJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_camper";
import { createStalkerCollectorJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_collector";
import { createStalkerGuardJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_guard";
import { createStalkerPatrolJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_patrol";
import { createStalkerPointJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_point";
import { createStalkerSleepJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sleep";
import { createStalkerSniperJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_sniper";
import { createStalkerSurgeJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_surge";
import { createStalkerWalkerJobs } from "@/engine/core/utils/job/job_create/job_create_stalker_walker";
import { ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaArray } from "@/engine/lib/types";

/**
 * todo;
 */
export function createStalkerJobs(
  smartTerrain: SmartTerrain,
  jobsList: LuaArray<ISmartTerrainJobDescriptor>
): LuaMultiReturn<[LuaArray<ISmartTerrainJobDescriptor>, string]> {
  let ltx: string =
    "[meet@generic_lager]\n" +
    "close_distance = {=is_wounded} 0, 2\n" +
    "close_anim = {=is_wounded} nil, {!is_squad_commander} nil, {=actor_has_weapon} threat_na, talk_default\n" +
    "close_snd_hello = {=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil," +
    " {=actor_has_weapon} meet_hide_weapon, meet_hello\n" +
    "close_snd_bye = {=is_wounded} nil, {!is_squad_commander} nil," +
    " {=actor_enemy} nil, {=actor_has_weapon} nil, meet_hello\n" +
    "close_victim = {=is_wounded} nil, {!is_squad_commander} nil, actor\n" +
    "far_distance = 0\n" +
    "far_anim = nil\n" +
    "far_snd = nil\n" +
    "far_victim = nil\n" +
    "use = {=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
    " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false\n" +
    "snd_on_use = {=is_wounded} nil, {=actor_enemy} nil, {!is_squad_commander} meet_use_no_talk_leader," +
    " {=actor_has_weapon} meet_use_no_weapon, {=has_enemy} meet_use_no_fight," +
    " {=dist_to_actor_le(3)} meet_use_no_default, nil\n" +
    "meet_dialog = nil\n" +
    "abuse = {=has_enemy} false, true\n" +
    "trade_enable = true\n" +
    "allow_break = true\n" +
    "use_text = nil\n" +
    "[meet@generic_animpoint]\n" +
    "close_distance = 0\n" +
    "close_anim = {!is_squad_commander} nil, nil\n" +
    "close_snd_hello = {!is_squad_commander} nil, nil\n" +
    "close_snd_bye = {!is_squad_commander} nil, nil\n" +
    "close_victim = {!is_squad_commander} nil, nil\n" +
    "far_distance = 0\n" +
    "far_anim = nil\n" +
    "far_snd = nil\n" +
    "far_victim = nil\n" +
    "use = {=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
    " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false\n" +
    "snd_on_use = {=is_wounded} nil, {=actor_enemy} nil, {!is_squad_commander} meet_use_no_talk_leader," +
    " {=actor_has_weapon} meet_use_no_weapon, {=has_enemy} meet_use_no_fight," +
    " {=dist_to_actor_le(3)} meet_use_no_default, nil\n" +
    "meet_dialog = nil\n" +
    "abuse = {=has_enemy} false, true\n" +
    "trade_enable = true\n" +
    "allow_break = true\n" +
    "meet_on_talking = false\n" +
    "use_text = nil\n";

  // ===================================================================================================================
  // = Surge
  // ===================================================================================================================

  const [, stalkerSurgeLtx] = createStalkerSurgeJobs(smartTerrain, jobsList);

  ltx += stalkerSurgeLtx;

  // ===================================================================================================================
  // = Camper
  // ===================================================================================================================

  const [, stalkerCamperLtx] = createStalkerCamperJobs(smartTerrain, jobsList);

  ltx += stalkerCamperLtx;

  // ===================================================================================================================
  // = Sniper
  // ===================================================================================================================

  const [, stalkerSniperLtx] = createStalkerSniperJobs(smartTerrain, jobsList);

  ltx += stalkerSniperLtx;

  // ===================================================================================================================
  // = Collector
  // ===================================================================================================================

  const [, stalkerCollectorLtx] = createStalkerCollectorJobs(smartTerrain, jobsList);

  ltx += stalkerCollectorLtx;

  // ===================================================================================================================
  // = Guard
  // ===================================================================================================================

  const [, stalkerGuardLtx] = createStalkerGuardJobs(smartTerrain, jobsList);

  ltx += stalkerGuardLtx;

  // ===================================================================================================================
  // = Patrol
  // ===================================================================================================================

  const [, stalkerPatrolLtx] = createStalkerPatrolJobs(smartTerrain, jobsList);

  ltx += stalkerPatrolLtx;

  // ===================================================================================================================
  // = Walker
  // ===================================================================================================================

  const [, stalkerWalkerLtx] = createStalkerWalkerJobs(smartTerrain, jobsList);

  ltx += stalkerWalkerLtx;

  // ===================================================================================================================
  // = Animpoint
  // ===================================================================================================================

  const [, stalkerAnimpointLtx] = createStalkerAnimpointJobs(smartTerrain, jobsList);

  ltx += stalkerAnimpointLtx;

  // ===================================================================================================================
  // = Sleep
  // ===================================================================================================================

  const [, stalkerSleepLtx] = createStalkerSleepJobs(smartTerrain, jobsList);

  ltx += stalkerSleepLtx;

  // ===================================================================================================================
  // = Point job
  // ===================================================================================================================

  const [, stalkerPointLtx] = createStalkerPointJobs(smartTerrain, jobsList);

  ltx += stalkerPointLtx;

  return $multi(jobsList, ltx);
}
