import { SmartTerrain } from "@/engine/core/objects";
import { createStalkerAnimpointJobs } from "@/engine/core/utils/job/job_create_stalker_animpoint";
import { createStalkerCamperJobs } from "@/engine/core/utils/job/job_create_stalker_camper";
import { createStalkerCollectorJobs } from "@/engine/core/utils/job/job_create_stalker_collector";
import { createStalkerGuardJobs } from "@/engine/core/utils/job/job_create_stalker_guard";
import { createStalkerPatrolJobs } from "@/engine/core/utils/job/job_create_stalker_patrol";
import { createStalkerPointJobs } from "@/engine/core/utils/job/job_create_stalker_point";
import { createStalkerSleepJobs } from "@/engine/core/utils/job/job_create_stalker_sleep";
import { createStalkerSniperJobs } from "@/engine/core/utils/job/job_create_stalker_sniper";
import { createStalkerSurgeJobs } from "@/engine/core/utils/job/job_create_stalker_surge";
import { createStalkerWalkerJobs } from "@/engine/core/utils/job/job_create_stalker_walker";
import { IJobListDescriptor } from "@/engine/core/utils/job/job_types";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";

/**
 * todo;
 */
export function createStalkerJobs(smartTerrain: SmartTerrain): LuaMultiReturn<[IJobListDescriptor, string]> {
  const stalkerJobs: IJobListDescriptor = {
    _precondition_is_monster: false,
    priority: logicsConfig.JOBS.STALKER_JOB_PRIORITY,
    jobs: new LuaTable(),
  };

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
  // = Point job
  // ===================================================================================================================

  const [stalkerPointJobs, stalkerPointLtx] = createStalkerPointJobs(smartTerrain);

  ltx += stalkerPointLtx;
  table.insert(stalkerJobs.jobs, stalkerPointJobs);

  // ===================================================================================================================
  // = Surge
  // ===================================================================================================================

  const [stalkerSurgeJobs, stalkerSurgeLtx, stalkerSurgeJobsCount] = createStalkerSurgeJobs(smartTerrain);

  if (stalkerSurgeJobsCount > 1) {
    ltx += stalkerSurgeLtx;
    table.insert(stalkerJobs.jobs, stalkerSurgeJobs);
  }

  // ===================================================================================================================
  // = Sleep
  // ===================================================================================================================

  const [stalkerSleepJobs, stalkerSleepLtx, stalkerSleepJobsCount] = createStalkerSleepJobs(smartTerrain);

  if (stalkerSleepJobsCount > 1) {
    ltx += stalkerSleepLtx;
    table.insert(stalkerJobs.jobs, stalkerSleepJobs);
  }

  // ===================================================================================================================
  // = Collector
  // ===================================================================================================================

  const [stalkerCollectorJobs, stalkerCollectorLtx, stalkerCollectorJobsCount] =
    createStalkerCollectorJobs(smartTerrain);

  if (stalkerCollectorJobsCount > 1) {
    ltx += stalkerCollectorLtx;
    table.insert(stalkerJobs.jobs, stalkerCollectorJobs);
  }

  // ===================================================================================================================
  // = Walker
  // ===================================================================================================================

  const [stalkerWalkerJobs, stalkerWalkerLtx, stalkerWalkerJobsCount] = createStalkerWalkerJobs(smartTerrain);

  if (stalkerWalkerJobsCount > 1) {
    ltx += stalkerWalkerLtx;
    table.insert(stalkerJobs.jobs, stalkerWalkerJobs);
  }

  // ===================================================================================================================
  // = Patrol
  // ===================================================================================================================

  const [stalkerPatrolJobs, stalkerPatrolLtx, stalkerPatrolJobsCount] = createStalkerPatrolJobs(smartTerrain);

  if (stalkerPatrolJobsCount > 1) {
    ltx += stalkerPatrolLtx;
    table.insert(stalkerJobs.jobs, stalkerPatrolJobs);
  }

  // ===================================================================================================================
  // = Animpoint
  // ===================================================================================================================

  const [stalkerAnimpointJobs, stalkerAnimpointLtx, stalkerAnimpointCount] = createStalkerAnimpointJobs(
    smartTerrain,
    stalkerJobs
  );

  if (stalkerAnimpointCount > 1) {
    ltx += stalkerAnimpointLtx;
    // insert directly into jobs list
  }

  // ===================================================================================================================
  // = Guard
  // ===================================================================================================================

  const [stalkerGuardJobs, stalkerGuardLtx, stalkerGuardJobsCount] = createStalkerGuardJobs(smartTerrain);

  if (stalkerGuardJobsCount > 1) {
    ltx += stalkerGuardLtx;
    table.insert(stalkerJobs.jobs, stalkerGuardJobs);
  }

  // ===================================================================================================================
  // = Sniper
  // ===================================================================================================================

  const [stalkerSniperJobs, stalkerSniperLtx, stalkerSniperJobsCount] = createStalkerSniperJobs(smartTerrain);

  if (stalkerSniperJobsCount > 1) {
    ltx += stalkerSniperLtx;
    table.insert(stalkerJobs.jobs, stalkerSniperJobs);
  }

  // ===================================================================================================================
  // = Camper
  // ===================================================================================================================

  const [stalkerCamperJobs, stalkerCamperLtx, stalkerCamperJobsCount] = createStalkerCamperJobs(smartTerrain);

  if (stalkerCamperJobsCount > 1) {
    ltx += stalkerCamperLtx;
    table.insert(stalkerJobs.jobs, stalkerCamperJobs);
  }

  return $multi(stalkerJobs, ltx);
}
