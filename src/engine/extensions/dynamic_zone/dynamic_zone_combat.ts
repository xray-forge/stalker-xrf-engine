import { time_global } from "xray16";
import { ServerCreatureObject, ServerHumanObject, ServerObject } from "xray16/alias";
import {
  AnyObject,
  LuaArray,
  Nillable,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TTimestamp,
} from "xray16/lib";
import { $filename, $isNil, $isNotNil } from "xray16/macros";

import { TCommunity } from "@/engine/constants/communities";
import { isStoryObject, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { isSquad, isStalker } from "@/engine/core/utils/class_ids";
import { getSquadCommunity } from "@/engine/core/utils/community";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getGameVertexLevelId } from "@/engine/core/utils/position";
import { areCommunitiesEnemies } from "@/engine/core/utils/relation";
import { getSquadMembers, killSquadMember } from "@/engine/core/utils/squad/squad_members";
import { IDynamicZoneBases, isDynamicZoneSquadProtected } from "@/engine/extensions/dynamic_zone/dynamic_zone_bases";
import type { IDynamicZoneConfig } from "@/engine/extensions/dynamic_zone/dynamic_zone_config";

const logger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Body an offline battle left, kept to release the oldest once there are too many.
 */
export interface IDynamicZoneCorpse {
  id: TNumberId;
  // Name of the body, telling it from an object that took its id after its release.
  name: TName;
}

/**
 * State of offline battles.
 */
export interface IDynamicZoneCombat {
  config: IDynamicZoneConfig;
  bases: IDynamicZoneBases;
  distanceSqr: TDistance;
  nextRoundAt: TTimestamp;
  // Power squads had left after the last round, by squad id: wounds carry over while a battle goes on.
  power: LuaTable<TNumberId, TRate>;
  // Bodies offline battles left, oldest first.
  corpses: LuaArray<IDynamicZoneCorpse>;
}

/**
 * @param config - Settings of the extension.
 * @param bases - Base terrains, where squads do not fight.
 * @returns State of offline battles, the first round due at once.
 */
export function createDynamicZoneCombat(config: IDynamicZoneConfig, bases: IDynamicZoneBases): IDynamicZoneCombat {
  return {
    config,
    bases,
    distanceSqr: config.combatDistance * config.combatDistance,
    nextRoundAt: 0,
    power: new LuaTable(),
    corpses: new LuaTable(),
  };
}

/**
 * Actor update handler: fight a round of offline battles and clear old bodies once the round interval passes.
 */
export function updateDynamicZoneCombat(this: IDynamicZoneCombat): void {
  const now: TTimestamp = time_global();

  if (now < this.nextRoundAt) {
    return;
  }

  this.nextRoundAt = now + this.config.combatScanInterval * 1000;

  fightDynamicZoneRound(this);
  releaseDynamicZoneCorpses(this);
}

/**
 * Pair offline enemy squads that are close or stay on the same target, each squad in one battle at most, and fight a
 * round of every battle.
 *
 * @param combat - State of offline battles.
 */
export function fightDynamicZoneRound(combat: IDynamicZoneCombat): void {
  const power: LuaTable<TNumberId, TRate> = new LuaTable();

  for (const [, squads] of getDynamicZoneFighters(combat)) {
    const count: TCount = squads.length();

    for (const first of $range(1, count)) {
      const squad: Squad = squads.get(first);

      if ($isNotNil(power.get(squad.id))) {
        continue;
      }

      for (const second of $range(first + 1, count)) {
        const enemy: Squad = squads.get(second);

        if ($isNil(power.get(enemy.id)) && canDynamicZoneSquadsFight(combat, squad, enemy)) {
          fightDynamicZoneBattle(combat, squad, enemy, power);
          break;
        }
      }
    }
  }

  combat.power = power;
}

/**
 * @param combat - State of offline battles.
 * @returns Squads that may fight offline, by level id.
 */
function getDynamicZoneFighters(combat: IDynamicZoneCombat): LuaTable<TNumberId, LuaArray<Squad>> {
  const fighters: LuaTable<TNumberId, LuaArray<Squad>> = new LuaTable();

  for (const [, object] of registry.simulationObjects) {
    if (isSquad(object) && canDynamicZoneSquadFight(combat, object as Squad)) {
      const levelId: TNumberId = getGameVertexLevelId(object.m_game_vertex_id);
      let squads: Nillable<LuaArray<Squad>> = fighters.get(levelId);

      if ($isNil(squads)) {
        squads = new LuaTable();
        fighters.set(levelId, squads);
      }

      table.insert(squads, object as Squad);
    }
  }

  return fighters;
}

/**
 * @param combat - State of offline battles.
 * @param squad - Squad to check.
 * @returns Whether the squad is offline, has members, has no story characters and is away from bases.
 */
export function canDynamicZoneSquadFight(combat: IDynamicZoneCombat, squad: Squad): boolean {
  if (squad.online || squad.npc_count() === 0 || isStoryObject(squad)) {
    return false;
  }

  for (const member of squad.squad_members()) {
    if (isStoryObject(member.object)) {
      return false;
    }
  }

  return !isDynamicZoneSquadProtected(combat.bases, squad);
}

/**
 * @param combat - State of offline battles.
 * @param squad - Squad that may fight.
 * @param enemy - Another squad that may fight, on the same level.
 * @returns Whether the squads are enemies, and close to each other or staying on the same target.
 */
export function canDynamicZoneSquadsFight(combat: IDynamicZoneCombat, squad: Squad, enemy: Squad): boolean {
  const community: TCommunity = getSquadCommunity(squad);
  const enemyCommunity: TCommunity = getSquadCommunity(enemy);

  if (!areCommunitiesEnemies(community, enemyCommunity) && !areCommunitiesEnemies(enemyCommunity, community)) {
    return false;
  }

  if (squad.position.distance_to_sqr(enemy.position) <= combat.distanceSqr) {
    return true;
  }

  return (
    $isNotNil(squad.assignedTargetId) &&
    squad.assignedTargetId === enemy.assignedTargetId &&
    squad.currentAction?.type === ESquadActionType.STAY_ON_TARGET &&
    enemy.currentAction?.type === ESquadActionType.STAY_ON_TARGET
  );
}

/**
 * Fight a round of a battle: both squads strike at once with a share of their power, and each loses the members its
 * wounds account for.
 *
 * @param combat - State of offline battles.
 * @param squad - Squad fighting.
 * @param enemy - Squad it fights.
 * @param power - Power squads have left after this round, by squad id, to fill.
 */
function fightDynamicZoneBattle(
  combat: IDynamicZoneCombat,
  squad: Squad,
  enemy: Squad,
  power: LuaTable<TNumberId, TRate>
): void {
  const squadMembers: LuaArray<ServerCreatureObject> = getSquadMembers(squad);
  const enemyMembers: LuaArray<ServerCreatureObject> = getSquadMembers(enemy);
  const squadPower: TRate = combat.power.get(squad.id) ?? getDynamicZoneSquadPower(combat, squadMembers);
  const enemyPower: TRate = combat.power.get(enemy.id) ?? getDynamicZoneSquadPower(combat, enemyMembers);
  const squadHit: TRate = squadPower * getDynamicZoneHitShare(combat);
  const enemyHit: TRate = enemyPower * getDynamicZoneHitShare(combat);
  const squadLeft: TRate = squadPower - enemyHit;
  const enemyLeft: TRate = enemyPower - squadHit;

  logger.info(
    "Offline battle: %s %s -> %s, %s %s -> %s",
    squad.name(),
    squadPower,
    squadLeft,
    enemy.name(),
    enemyPower,
    enemyLeft
  );

  power.set(squad.id, squadLeft);
  power.set(enemy.id, enemyLeft);

  killDynamicZoneWounded(combat, squadMembers, squadLeft, enemy, enemyMembers, enemyHit);
  killDynamicZoneWounded(combat, enemyMembers, enemyLeft, squad, squadMembers, squadHit);
}

/**
 * @param combat - State of offline battles.
 * @returns Share of its power a squad deals in a round.
 */
function getDynamicZoneHitShare(combat: IDynamicZoneCombat): TRate {
  return combat.config.combatHitBase + math.random() * combat.config.combatHitSpread;
}

/**
 * @param combat - State of offline battles.
 * @param member - Squad member.
 * @returns Power of the member: a stalker's rank, a mutant's rank scaled to stalker ranks, at least one.
 */
export function getDynamicZoneMemberPower(combat: IDynamicZoneCombat, member: ServerCreatureObject): TRate {
  return math.max(isStalker(member) ? member.rank() : member.rank() * combat.config.monsterRankFactor, 1);
}

/**
 * @param combat - State of offline battles.
 * @param members - Squad members.
 * @returns Power of the members together.
 */
export function getDynamicZoneSquadPower(combat: IDynamicZoneCombat, members: LuaArray<ServerCreatureObject>): TRate {
  let power: TRate = 0;

  for (const index of $range(1, members.length())) {
    power += getDynamicZoneMemberPower(combat, members.get(index));
  }

  return power;
}

/**
 * Kill the members a squad's wounds account for, in random order: the wounds are the power its members have beyond
 * what it has left, and a member dies when its power fits in the wounds not yet spent.
 *
 * @param combat - State of offline battles.
 * @param members - Members of the squad.
 * @param left - Power the squad has left.
 * @param enemy - Squad it fights.
 * @param killers - Members of the squad it fights, one credited with each kill.
 * @param damage - Power the squad it fights struck with this round.
 */
export function killDynamicZoneWounded(
  combat: IDynamicZoneCombat,
  members: LuaArray<ServerCreatureObject>,
  left: TRate,
  enemy: Squad,
  killers: LuaArray<ServerCreatureObject>,
  damage: TRate
): void {
  let wounds: TRate = getDynamicZoneSquadPower(combat, members) - math.max(left, 0);
  const count: TCount = members.length();

  // Visits the members in random order, swapping each visited one out of the part left to visit.
  for (const index of $range(1, count)) {
    const pick: TIndex = math.random(index, count);
    const member: ServerCreatureObject = members.get(pick);
    const power: TRate = getDynamicZoneMemberPower(combat, member);

    members.set(pick, members.get(index));
    members.set(index, member);

    if (power <= wounds) {
      const killer: ServerCreatureObject = killers.get(math.random(1, killers.length()));

      wounds -= power;

      table.insert(combat.corpses, { id: member.id, name: member.name() });
      killSquadMember(member, killer);
      rewardDynamicZoneKiller(combat, enemy, killer, damage);
    }
  }
}

/**
 * Raise the rank of a stalker credited with a kill by the damage its squad dealt, and its commander's by a random gain.
 *
 * @param combat - State of offline battles.
 * @param squad - Squad of the killer.
 * @param killer - Member credited with the kill.
 * @param damage - Power its squad struck with this round.
 */
export function rewardDynamicZoneKiller(
  combat: IDynamicZoneCombat,
  squad: Squad,
  killer: ServerCreatureObject,
  damage: TRate
): void {
  if (!isStalker(killer)) {
    return;
  }

  // Both sides strike at once, so the killer may have fallen in the same round.
  if (killer.alive()) {
    raiseDynamicZoneRank(killer as ServerHumanObject, math.ceil(damage * combat.config.killRankGain));
  }

  const commander: Nillable<ServerCreatureObject> = registry.simulator.object(squad.commander_id());

  if ($isNotNil(commander) && isStalker(commander) && commander.alive()) {
    raiseDynamicZoneRank(commander as ServerHumanObject, math.random(1, combat.config.commanderRankGain));
  }
}

/**
 * @param stalker - Stalker to promote.
 * @param gain - Rank points to add.
 */
function raiseDynamicZoneRank(stalker: ServerHumanObject, gain: TCount): void {
  logger.info("Offline battle rank gain: %s %s +%s", stalker.name(), stalker.rank(), gain);

  stalker.set_rank(stalker.rank() + gain);
}

/**
 * Release the oldest bodies offline battles left once there are more than the limit, skipping those online, which the
 * release body manager keeps near the actor.
 *
 * @param combat - State of offline battles.
 */
export function releaseDynamicZoneCorpses(combat: IDynamicZoneCombat): void {
  let excess: TCount = combat.corpses.length() - combat.config.corpseLimit;
  let index: TIndex = 1;

  while (excess > 0 && index <= combat.corpses.length()) {
    const corpse: IDynamicZoneCorpse = combat.corpses.get(index);
    const object: Nillable<ServerCreatureObject> = registry.simulator.object(corpse.id);

    if (object?.online) {
      index += 1;
    } else {
      // A body already gone, or its id taken by another object, needs no release.
      if ($isNotNil(object) && object.name() === corpse.name && !object.alive()) {
        logger.info("Release offline battle body: %s", corpse.name);
        registry.simulator.release(object as ServerObject, true);
      }

      table.remove(combat.corpses, index);
      excess -= 1;
    }
  }
}

/**
 * @param combat - State of offline battles.
 * @param data - Extension save data to write.
 */
export function saveDynamicZoneCombat(combat: IDynamicZoneCombat, data: AnyObject): void {
  data.corpses = combat.corpses;
}

/**
 * @param combat - State of offline battles.
 * @param data - Extension save data to read.
 */
export function loadDynamicZoneCombat(combat: IDynamicZoneCombat, data: AnyObject): void {
  combat.corpses = data.corpses ?? new LuaTable();
}
