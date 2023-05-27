import { alife, clsid } from "xray16";

import { getPortableStoreValue, registry, setPortableStoreValue } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { abort } from "@/engine/core/utils/assertion";
import { isStalker } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableSize } from "@/engine/core/utils/table";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { TArtefact } from "@/engine/lib/constants/items/artefacts";
import { TWeapon, weapons } from "@/engine/lib/constants/items/weapons";
import { TMonster } from "@/engine/lib/constants/monsters";
import { NIL } from "@/engine/lib/constants/words";
import {
  ClientObject,
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
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;-
 */
export interface IActorStatistics {
  surges: TCount;
  completed_quests: TCount;
  killed_monsters: TCount;
  killed_stalkers: TCount;
  founded_secrets: TCount;
  artefacts_founded: TCount;
  best_monster_rank: TCount;
  best_monster: Optional<TMonster>;
  favorite_weapon_sect: Optional<TWeapon>;
}

/**
 * todo;-
 */
let weaponsTable: LuaTable<TName, TCount> = $fromObject<TName, TCount>({
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

/**
 * todo;
 */
let taken_artefacts: LuaTable<TNumberId, TNumberId> = $fromObject<TNumberId, TNumberId>({});

/**
 * todo;
 */
export class StatisticsManager extends AbstractCoreManager {
  public static readonly USED_ANABIOTICS_COUNT_KEY: TName = "anabiotics_used";

  public actor_statistic: IActorStatistics = {
    surges: 0,
    completed_quests: 0,
    killed_monsters: 0,
    killed_stalkers: 0,
    founded_secrets: 0,
    artefacts_founded: 0,
    best_monster: null,
    favorite_weapon_sect: null,
    best_monster_rank: 0,
  };

  public artefacts_table: LuaTable<TArtefact, boolean> = $fromObject({
    af_cristall: false,
    af_blood: false,
    af_electra_sparkler: false,
    af_cristall_flower: false,
    af_medusa: false,
    af_fireball: false,
    af_mincer_meat: false,
    af_electra_flash: false,
    af_night_star: false,
    af_dummy_glassbeads: false,
    af_soul: false,
    af_electra_moonlight: false,
    af_dummy_battery: false,
    af_vyvert: false,
    af_fuzz_kolobok: false,
    af_gravi: false,
    af_eye: false,
    af_baloon: false,
    af_dummy_dummy: false,
    af_gold_fish: false,
    af_fire: false,
    af_glass: false,
    af_ice: false,
  } as Record<TArtefact, boolean>);

  public monster_classes: PartialRecord<TClassId, string> = {
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

  /**
   * todo: Description.
   */
  public incrementSurgesCount(): void {
    logger.info("Increment surges count");
    this.actor_statistic.surges += 1;
  }

  /**
   * todo: Description.
   */
  public incrementCompletedQuestsCount(): void {
    logger.info("Increment completed quests count");
    this.actor_statistic.completed_quests += 1;
  }

  /**
   * todo: Description.
   */
  public incrementKilledMonstersCount(): void {
    logger.info("Increment killed monsters count");
    this.actor_statistic.killed_monsters += 1;
  }

  /**
   * todo: Description.
   */
  public incrementKilledStalkersCount(): void {
    logger.info("Increment killed stalkers count");
    this.actor_statistic.killed_stalkers += 1;
  }

  /**
   * todo: Description.
   */
  public incrementCollectedArtefactsCount(artefact: ClientObject): void {
    logger.info("Increment collected artefacts count");
    // todo: Probably section vs section name should be checked and simplified.

    const art_id: TNumberId = artefact.id();

    if (!taken_artefacts.has(art_id)) {
      this.actor_statistic.artefacts_founded += 1;
      taken_artefacts.set(art_id, art_id);

      const s_art = alife().object(art_id);

      if (s_art && s_art.section_name()) {
        this.artefacts_table.set(s_art.section_name(), true);
      }
    }
  }

  /**
   * todo: Description.
   */
  public incrementCollectedSecretsCount(): void {
    logger.info("Increment collected secrets count");
    this.actor_statistic.founded_secrets += 1;
  }

  /**
   * todo: Description.
   */
  public incrementAnabioticsUsageCount(): void {
    logger.info("Increment used anabiotics count");

    setPortableStoreValue(
      registry.actor,
      StatisticsManager.USED_ANABIOTICS_COUNT_KEY,
      getPortableStoreValue(registry.actor, StatisticsManager.USED_ANABIOTICS_COUNT_KEY, 0) + 1
    );
  }

  /**
   * todo: Description.
   */
  public getUsedAnabioticsCount(): TCount {
    return getPortableStoreValue(registry.actor, StatisticsManager.USED_ANABIOTICS_COUNT_KEY, 0);
  }

  /**
   * todo: Description.
   */
  public updateBestWeapon(hitAmount: TCount): void {
    const activeItem: Optional<ClientObject> = registry.actor.active_item();

    if (activeItem) {
      const serverObject: Optional<ServerObject> = alife().object(activeItem.id());

      if (serverObject) {
        const sectionName: TName = serverObject.section_name();

        for (const weapon of string.gfind(sectionName, "%w+")) {
          if (weaponsTable.has(weapon as TWeapon)) {
            weaponsTable.set(weapon as TWeapon, weaponsTable.get(weapon as TWeapon) + hitAmount);
          }
        }
      }
    }

    let amount: TCount = 0;

    // todo: Why so complex? Probably just use normal namings
    for (const [weapon, value] of weaponsTable) {
      if (value > amount) {
        amount = value;
        if (weapon === ("rgd5" as TInventoryItem) || weapon === ("f1" as TInventoryItem)) {
          this.actor_statistic.favorite_weapon_sect = ("grenade_" + weapon) as TWeapon;
        } else {
          this.actor_statistic.favorite_weapon_sect = ("wpn_" + weapon) as TWeapon;
        }

        if (weapon === ("desert" as TInventoryItem)) {
          this.actor_statistic.favorite_weapon_sect = weapons.wpn_desert_eagle;
        } else if (weapon === ("rg" as TInventoryItem)) {
          this.actor_statistic.favorite_weapon_sect = weapons["wpn_rg-6"];
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public updateBestMonsterKilled(object: ClientObject): void {
    if (isStalker(object)) {
      // -- actor_statistic.best_monster = "stalker"
    } else {
      let community = this.monster_classes[object.clsid()];

      if (!community) {
        abort(
          "Statistic ERROR: cannot find monster class for [%s] clsid [%s]",
          object.name(),
          tostring(object.clsid())
        );
      }

      const serverObject: Optional<ServerCreatureObject> = alife().object(object.id());

      if (serverObject) {
        const rank = serverObject.rank();

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

        if (rank > this.actor_statistic.best_monster_rank) {
          logger.info("Updated best monster killed:", community, rank);

          this.actor_statistic.best_monster_rank = rank;
          this.actor_statistic.best_monster = community as TMonster;
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public override load(reader: NetProcessor): void {
    this.actor_statistic = {} as IActorStatistics;
    this.actor_statistic.surges = reader.r_u16();
    this.actor_statistic.completed_quests = reader.r_u16();
    this.actor_statistic.killed_monsters = reader.r_u32();
    this.actor_statistic.killed_stalkers = reader.r_u32();
    this.actor_statistic.founded_secrets = reader.r_u16();
    this.actor_statistic.artefacts_founded = reader.r_u16();
    this.actor_statistic.best_monster_rank = reader.r_u32();

    const bestMonster: StringOptional<TMonster> = reader.r_stringZ();

    this.actor_statistic.best_monster = bestMonster === NIL ? null : bestMonster;

    const favoriteWeapon: StringOptional<TWeapon> = reader.r_stringZ();

    this.actor_statistic.favorite_weapon_sect = favoriteWeapon === NIL ? null : favoriteWeapon;

    weaponsTable = new LuaTable();

    const weaponsCount: number = reader.r_u8();

    for (const it of $range(1, weaponsCount)) {
      const k: TWeapon = reader.r_stringZ();
      const v: TCount = reader.r_float();

      weaponsTable.set(k, v);
    }

    this.artefacts_table = new LuaTable();

    const artefactsCount = reader.r_u8();

    for (const i of $range(1, artefactsCount)) {
      const k: TArtefact = reader.r_stringZ();
      const v: boolean = reader.r_bool();

      this.artefacts_table.set(k, v);
    }

    taken_artefacts = new LuaTable();

    const n = reader.r_u8();

    for (const i of $range(1, n)) {
      const k: number = reader.r_u32();

      taken_artefacts.set(k, k);
    }
  }

  /**
   * todo: Description.
   */
  public override save(packet: NetPacket): void {
    packet.w_u16(this.actor_statistic.surges);
    packet.w_u16(this.actor_statistic.completed_quests);
    packet.w_u32(this.actor_statistic.killed_monsters);
    packet.w_u32(this.actor_statistic.killed_stalkers);
    packet.w_u16(this.actor_statistic.founded_secrets);
    packet.w_u16(this.actor_statistic.artefacts_founded);
    packet.w_u32(this.actor_statistic.best_monster_rank);
    packet.w_stringZ(tostring(this.actor_statistic.best_monster));
    packet.w_stringZ(tostring(this.actor_statistic.favorite_weapon_sect));

    const weaponsCount: TCount = getTableSize(weaponsTable);

    packet.w_u8(weaponsCount);

    for (const [k, v] of weaponsTable) {
      packet.w_stringZ(tostring(k));
      packet.w_float(v);
    }

    const artefactsCount: number = getTableSize(this.artefacts_table);

    packet.w_u8(artefactsCount);

    for (const [k, v] of this.artefacts_table) {
      packet.w_stringZ(tostring(k));
      packet.w_bool(v === true);
    }

    const takenArtefactsCount: TCount = getTableSize(taken_artefacts);

    packet.w_u8(takenArtefactsCount);
    for (const [k, v] of taken_artefacts) {
      packet.w_u32(k);
    }
  }
}
