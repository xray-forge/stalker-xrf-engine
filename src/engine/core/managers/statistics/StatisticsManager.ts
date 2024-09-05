import { clsid } from "xray16";

import { getManager, getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ANABIOTICS_USED_KEY, IActorStatistics } from "@/engine/core/managers/statistics/statistics_types";
import type { TaskObject } from "@/engine/core/managers/tasks";
import type { ITreasureDescriptor } from "@/engine/core/managers/treasures";
import { assert } from "@/engine/core/utils/assertion";
import { isArtefact } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { TArtefact } from "@/engine/lib/constants/items/artefacts";
import { TWeapon, weapons } from "@/engine/lib/constants/items/weapons";
import { TMonster } from "@/engine/lib/constants/monsters";
import { NIL } from "@/engine/lib/constants/words";
import {
  GameObject,
  NetPacket,
  NetProcessor,
  Optional,
  PartialRecord,
  ServerCreatureObject,
  ServerObject,
  StringOptional,
  TClassId,
  TCount,
  TName,
  TNumberId,
  TRate,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to measure game statistics of actions done by actor.
 */
export class StatisticsManager extends AbstractManager {
  public actorStatistics: IActorStatistics = {
    surgesCount: 0,
    completedTasksCount: 0,
    killedMonstersCount: 0,
    killedStalkersCount: 0,
    collectedTreasuresCount: 0,
    collectedArtefactsCount: 0,
    bestKilledMonster: null,
    bestKilledMonsterRank: 0,
    favoriteWeapon: null,
    collectedArtefacts: new LuaTable(),
  };

  public weaponsStatistics: LuaTable<TName, TCount> = $fromObject<TName, TCount>({
    abakan: 0,
    ak74: 0,
    ak74u: 0,
    beretta: 0,
    bm16: 0,
    colt1911: 0,
    desert: 0,
    f1: 0,
    fn2000: 0,
    fort: 0,
    g36: 0,
    gauss: 0,
    groza: 0,
    hpsa: 0,
    knife: 0,
    l85: 0,
    lr300: 0,
    mp5: 0,
    pb: 0,
    pkm: 0,
    pm: 0,
    protecta: 0,
    rg: 0,
    rgd5: 0,
    rpg7: 0,
    sig220: 0,
    sig550: 0,
    spas12: 0,
    svd: 0,
    svu: 0,
    toz34: 0,
    usp45: 0,
    val: 0,
    vintorez: 0,
    walther: 0,
    wincheaster1300: 0,
  });

  public takenArtefacts: LuaTable<TNumberId, TNumberId> = new LuaTable();

  public monsterClassesMap: PartialRecord<TClassId, TName> = {
    [clsid.bloodsucker_s]: "bloodsucker",
    [clsid.boar_s]: "boar",
    [clsid.burer_s]: "burer",
    [clsid.chimera_s]: "chimera",
    [clsid.controller_s]: "controller",
    [clsid.dog_s]: "dog",
    [clsid.flesh_s]: "flesh",
    [clsid.gigant_s]: "gigant",
    [clsid.poltergeist_s]: "poltergeist",
    [clsid.psy_dog_s]: "psy_dog",
    [clsid.pseudodog_s]: "pseudodog",
    [clsid.snork_s]: "snork",
    [clsid.tushkano_s]: "tushkano",
  };

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.TASK_COMPLETED, this.onTaskCompleted, this);
    eventsManager.registerCallback(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC, this.onSurvivedSurgeWithAnabiotic, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorCollectedItem, this);
    eventsManager.registerCallback(EGameEvent.SURGE_SKIPPED, this.onSurgePassed, this);
    eventsManager.registerCallback(EGameEvent.SURGE_ENDED, this.onSurgePassed, this);
    eventsManager.registerCallback(EGameEvent.TREASURE_FOUND, this.onTreasureFound, this);
    eventsManager.registerCallback(EGameEvent.STALKER_HIT, this.onObjectHit, this);
    eventsManager.registerCallback(EGameEvent.STALKER_DEATH, this.onStalkerKilled, this);
    eventsManager.registerCallback(EGameEvent.MONSTER_HIT, this.onObjectHit, this);
    eventsManager.registerCallback(EGameEvent.MONSTER_DEATH, this.onMonsterKilled, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.TASK_COMPLETED, this.onTaskCompleted);
    eventsManager.unregisterCallback(EGameEvent.SURGE_SURVIVED_WITH_ANABIOTIC, this.onSurvivedSurgeWithAnabiotic);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorCollectedItem);
    eventsManager.unregisterCallback(EGameEvent.SURGE_SKIPPED, this.onSurgePassed);
    eventsManager.unregisterCallback(EGameEvent.SURGE_ENDED, this.onSurgePassed);
    eventsManager.unregisterCallback(EGameEvent.TREASURE_FOUND, this.onTreasureFound);
    eventsManager.unregisterCallback(EGameEvent.STALKER_HIT, this.onObjectHit);
    eventsManager.unregisterCallback(EGameEvent.STALKER_DEATH, this.onStalkerKilled);
    eventsManager.unregisterCallback(EGameEvent.MONSTER_HIT, this.onObjectHit);
    eventsManager.unregisterCallback(EGameEvent.MONSTER_DEATH, this.onMonsterKilled);
  }

  /**
   * Get count of used anabiotics from pstore.
   *
   * @returns count of used anabiotics
   */
  public getUsedAnabioticsCount(): TCount {
    return getPortableStoreValue(ACTOR_ID, ANABIOTICS_USED_KEY, 0);
  }

  /**
   * Handle usage of anabiotic during emission.
   */
  public onSurvivedSurgeWithAnabiotic(): void {
    logger.info("Increment used anabiotics count");

    setPortableStoreValue(ACTOR_ID, ANABIOTICS_USED_KEY, getPortableStoreValue(ACTOR_ID, ANABIOTICS_USED_KEY, 0) + 1);
  }

  /**
   * Handle task completion by an actor.
   *
   * @param task - completed task object
   */
  public onTaskCompleted(task: TaskObject): void {
    logger.info("Increment completed quests count");
    this.actorStatistics.completedTasksCount += 1;
  }

  /**
   * Handle item pick up event.
   *
   * @param item - game object picked up
   */
  public onActorCollectedItem(item: GameObject): void {
    if (!isArtefact(item)) {
      return;
    }

    logger.info("Increment collected artefacts count");

    const artefactId: TNumberId = item.id();

    if (!this.takenArtefacts.has(artefactId)) {
      this.actorStatistics.collectedArtefactsCount += 1;
      this.takenArtefacts.set(artefactId, artefactId);

      // todo: Probably section vs section name should be checked and simplified.
      const serverObject: Optional<ServerObject> = registry.simulator.object(artefactId);

      if (serverObject && serverObject.section_name()) {
        this.actorStatistics.collectedArtefacts.set(serverObject.section_name(), true);
      }
    }
  }

  /**
   * Increment count of survived surges.
   * Surge passed.
   */
  public onSurgePassed(): void {
    logger.info("Increment surges count");
    this.actorStatistics.surgesCount += 1;
  }

  /**
   * Handle actor found treasure.
   *
   * @param treasure - found treasure secret
   */
  public onTreasureFound(treasure: ITreasureDescriptor): void {
    logger.info("Increment collected secrets count");
    this.actorStatistics.collectedTreasuresCount += 1;
  }

  /**
   * Handle stalker kill event and update stats.
   *
   * @param object - object killed
   * @param killer - object killer
   */
  public onStalkerKilled(object: GameObject, killer: Optional<GameObject>): void {
    if (killer?.id() === ACTOR_ID) {
      this.actorStatistics.killedStalkersCount += 1;
    }
  }

  /**
   * Handle object hit by an actor and collect statistics.
   *
   * @param object - game object
   * @param amount - amount of damage done
   * @param direction - direction of object hit
   * @param who - source object of hit
   */
  public onObjectHit(object: GameObject, amount: TRate, direction: Vector, who: Optional<GameObject>): void {
    if (who?.id() !== ACTOR_ID) {
      return;
    }

    const activeActorItem: Optional<GameObject> = registry.actor.active_item();

    if (activeActorItem) {
      const serverObject: Optional<ServerObject> = registry.simulator.object(activeActorItem.id());

      if (serverObject) {
        const sectionName: TName = serverObject.section_name();

        for (const weapon of string.gfind(sectionName, "%w+")) {
          const damage: Optional<TCount> = this.weaponsStatistics.get(weapon);

          if (damage !== null) {
            this.weaponsStatistics.set(weapon, damage + amount);
          }
        }
      }
    }

    let total: TCount = 0;

    // todo: Why so complex? Probably just use normal namings
    for (const [weapon, value] of this.weaponsStatistics) {
      if (value > total) {
        total = value;
        if (weapon === ("rgd5" as TInventoryItem) || weapon === ("f1" as TInventoryItem)) {
          this.actorStatistics.favoriteWeapon = ("grenade_" + weapon) as TWeapon;
        } else {
          this.actorStatistics.favoriteWeapon = ("wpn_" + weapon) as TWeapon;
        }

        if (weapon === ("desert" as TInventoryItem)) {
          this.actorStatistics.favoriteWeapon = weapons.wpn_desert_eagle;
        } else if (weapon === ("rg" as TInventoryItem)) {
          this.actorStatistics.favoriteWeapon = weapons["wpn_rg-6"];
        }
      }
    }
  }

  /**
   * Handle monster kill event and update stats.
   *
   * @param object - object killed
   * @param who - object killer
   */
  public onMonsterKilled(object: GameObject, who: Optional<GameObject>): void {
    if (who?.id() !== ACTOR_ID) {
      return;
    }

    let community: Optional<TName> = this.monsterClassesMap[object.clsid()] as Optional<TName>;

    assert(
      community,
      "Statistics error: cannot find monster class for [%s] clsid [%s].",
      object.name(),
      tostring(object.clsid())
    );

    const serverObject: Optional<ServerCreatureObject> = registry.simulator.object(object.id());

    // Increment count.
    this.actorStatistics.killedMonstersCount += 1;

    if (serverObject) {
      const rank: TRate = serverObject.rank();

      if (community === "flesh") {
        if (rank === 3) {
          community = community + "_strong";
        } else {
          community = community + "_weak";
        }
      } else if (community === "poltergeist") {
        if (rank === 12) {
          community = community + "_flame";
        } else {
          community = community + "_tele";
        }
      } else if (community === "boar") {
        if (rank === 6) {
          community = community + "_strong";
        } else {
          community = community + "_weak";
        }
      } else if (community === "pseudodog" || community === "psy_dog") {
        if (rank === 13) {
          community = community + "_strong";
        } else {
          community = community + "_weak";
        }
      } else if (community === "bloodsucker") {
        if (rank === 16) {
          community = community + "_strong";
        } else if (rank === 15) {
          community = community + "_normal";
        } else {
          community = community + "_weak";
        }
      }

      if (rank > this.actorStatistics.bestKilledMonsterRank) {
        logger.info("Updated best monster killed: %s %s", community, rank);

        this.actorStatistics.bestKilledMonsterRank = rank;
        this.actorStatistics.bestKilledMonster = community as TMonster;
      }
    }
  }

  public override load(reader: NetProcessor): void {
    this.actorStatistics = {} as IActorStatistics;
    this.actorStatistics.surgesCount = reader.r_u16();
    this.actorStatistics.completedTasksCount = reader.r_u16();
    this.actorStatistics.killedMonstersCount = reader.r_u32();
    this.actorStatistics.killedStalkersCount = reader.r_u32();
    this.actorStatistics.collectedTreasuresCount = reader.r_u16();
    this.actorStatistics.collectedArtefactsCount = reader.r_u16();
    this.actorStatistics.bestKilledMonsterRank = reader.r_u32();

    const bestMonster: StringOptional<TMonster> = reader.r_stringZ();

    this.actorStatistics.bestKilledMonster = bestMonster === NIL ? null : bestMonster;

    const favoriteWeapon: StringOptional<TWeapon> = reader.r_stringZ();

    this.actorStatistics.favoriteWeapon = favoriteWeapon === NIL ? null : favoriteWeapon;

    this.weaponsStatistics = new LuaTable();

    const weaponsCount: TCount = reader.r_u8();

    for (const _ of $range(1, weaponsCount)) {
      const k: TWeapon = reader.r_stringZ();
      const v: TCount = reader.r_float();

      this.weaponsStatistics.set(k, v);
    }

    this.actorStatistics.collectedArtefacts = new LuaTable();

    const artefactsCount: TCount = reader.r_u8();

    for (const _ of $range(1, artefactsCount)) {
      const k: TArtefact = reader.r_stringZ();
      const v: boolean = reader.r_bool();

      this.actorStatistics.collectedArtefacts.set(k, v);
    }

    this.takenArtefacts = new LuaTable();

    const takenArtefactsCount: TCount = reader.r_u8();

    for (const _ of $range(1, takenArtefactsCount)) {
      const k: TNumberId = reader.r_u32();

      this.takenArtefacts.set(k, k);
    }
  }

  public override save(packet: NetPacket): void {
    packet.w_u16(this.actorStatistics.surgesCount);
    packet.w_u16(this.actorStatistics.completedTasksCount);
    packet.w_u32(this.actorStatistics.killedMonstersCount);
    packet.w_u32(this.actorStatistics.killedStalkersCount);
    packet.w_u16(this.actorStatistics.collectedTreasuresCount);
    packet.w_u16(this.actorStatistics.collectedArtefactsCount);
    packet.w_u32(this.actorStatistics.bestKilledMonsterRank);
    packet.w_stringZ(tostring(this.actorStatistics.bestKilledMonster));
    packet.w_stringZ(tostring(this.actorStatistics.favoriteWeapon));

    const weaponsCount: TCount = table.size(this.weaponsStatistics);

    packet.w_u8(weaponsCount);

    for (const [section, damageDone] of this.weaponsStatistics) {
      packet.w_stringZ(tostring(section));
      packet.w_float(damageDone);
    }

    const artefactsCount: TCount = table.size(this.actorStatistics.collectedArtefacts);

    packet.w_u8(artefactsCount);

    for (const [section, isCollected] of this.actorStatistics.collectedArtefacts) {
      packet.w_stringZ(tostring(section));
      packet.w_bool(isCollected);
    }

    const takenArtefactsCount: TCount = table.size(this.takenArtefacts);

    packet.w_u8(takenArtefactsCount);
    for (const [id] of this.takenArtefacts) {
      packet.w_u32(id);
    }
  }
}
