import {
  alife,
  level,
  time_global,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { STRINGIFIED_TRUE } from "@/engine/lib/constants/lua";
import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import { TTreasure } from "@/engine/lib/constants/treasures";
import { LuaArray, Optional, TCount, TNumberId, TProbability, TSection } from "@/engine/lib/types";
import { registry, SECRETS_LTX } from "@/engine/scripts/core/database";
import { AbstractCoreManager } from "@/engine/scripts/core/managers/AbstractCoreManager";
import { NotificationManager } from "@/engine/scripts/core/managers/notifications/NotificationManager";
import { StatisticsManager } from "@/engine/scripts/core/managers/StatisticsManager";
import { pickSectionFromCondList } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/engine/scripts/utils/game_save";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { parseConditionsList, parseSpawnDetails, TConditionList } from "@/engine/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface ITreasureSecret {
  given: boolean;
  checked: boolean;
  refreshing: Optional<TConditionList>;
  empty: Optional<TConditionList>;
  to_find: number;
  items: LuaTable<
    TSection, // section
    LuaArray<{
      count: TCount;
      prob: TProbability;
      item_ids: Optional<LuaArray<TNumberId>>;
    }>
  >;
}

/**
 * todo;
 */
export class TreasureManager extends AbstractCoreManager {
  public static readonly SECRET_LTX_SECTION: TSection = "secret";

  public items_spawned: boolean = false;
  public check_time: any = null;
  public secrets: LuaTable<TTreasure, ITreasureSecret> = new LuaTable();
  public secret_restrs: LuaTable<TTreasure, number> = new LuaTable();
  public items_from_secrets: LuaTable<number, number> = new LuaTable();

  /**
   * Share treasure coordinates with the actor.
   */
  public static giveActorTreasureCoordinates(treasureId: TTreasure): void {
    return TreasureManager.getInstance().giveActorTreasureCoordinates(treasureId);
  }

  /**
   * todo;
   */
  public override initialize(): void {
    const totalSecretsCount: number = SECRETS_LTX.line_count("list");

    logger.info("Initialize secrets, expected:", totalSecretsCount);

    for (const i of $range(0, totalSecretsCount - 1)) {
      const [result, id, value] = SECRETS_LTX.r_line<TTreasure>("list", i, "", "");

      if (SECRETS_LTX.section_exist(id)) {
        this.secrets!.set(id, {
          items: new LuaTable(),
          given: false,
          empty: null,
          refreshing: null,
          checked: false,
          to_find: 0,
        });

        const items_count: number = SECRETS_LTX.line_count(id);
        const item_section: string = "";

        for (const i of $range(0, items_count - 1)) {
          const [result, item_section, str] = SECRETS_LTX.r_line(id, i, "", "");

          if (item_section === "empty") {
            this.secrets.get(id).empty = parseConditionsList(null, "treasure_manager", "empty_cond", str);
          } else if (item_section === "refreshing") {
            this.secrets.get(id).refreshing = parseConditionsList(null, "treasure_manager", "refreshing_cond", str);
          } else {
            this.secrets.get(id).items.set(item_section, new LuaTable());

            const spawnDetails = parseSpawnDetails(str);

            if (spawnDetails.length() === 0) {
              abort("There is no items count set for treasure [%s], item [%s]", id, item_section);
            }

            for (const [index, it] of spawnDetails) {
              const detail = {
                count: tonumber(it.count),
                prob: tonumber(it.probability || 1),
              };

              table.insert(this.secrets.get(id).items.get(item_section) as LuaTable<any>, detail);
            }
          }
        }
      } else {
        abort("There is no section [%s] in secrets.ltx", tostring(i));
      }
    }
  }

  /**
   * todo;
   */
  public fill(se_obj: XR_cse_alife_object, treasureId: TTreasure): Optional<boolean> {
    if (this.secrets.get(treasureId) !== null) {
      const item = this.secrets.get(treasureId).items.get(se_obj.section_name());

      if (item !== null) {
        for (const it of $range(1, item.length())) {
          if (!item.get(it).item_ids) {
            item.get(it).item_ids = new LuaTable();
          }

          const count: number = item.get(it).item_ids!.length();

          if (count < item.get(it).count) {
            item.get(it).item_ids!.set(count + 1, se_obj.id);

            return true;
          }
        }

        return null;
      } else {
        abort("Attempt to register unknown item [%s] in secret [%s]", se_obj.section_name(), treasureId);
      }
    } else {
      abort("Attempt to register item [%s] in unexistent secret [%s]", se_obj.name(), treasureId);
    }
  }

  /**
   * todo;
   */
  public registerAlifeItem(alifeObject: XR_cse_alife_object): Optional<boolean> {
    const spawn_ini: XR_ini_file = alifeObject.spawn_ini();

    if (spawn_ini.section_exist(TreasureManager.SECRET_LTX_SECTION)) {
      const [result, id, value] = spawn_ini.r_line<string, TTreasure | "">(
        TreasureManager.SECRET_LTX_SECTION,
        0,
        "",
        ""
      );

      if (id !== "name") {
        abort("There is no 'name' field in [secret] section for object [%s]", alifeObject.name());
      } else if (value === "") {
        abort("Field 'name' in [secret] section got no value for object [%s]", alifeObject.name());
      }

      return this.fill(alifeObject, value);
    } else {
      return null;
    }
  }

  /**
   * todo;
   */
  public registerAlifeRestrictor(alifeObject: XR_cse_alife_object): void {
    const spawnIni: XR_ini_file = alifeObject.spawn_ini();

    if (spawnIni.section_exist(TreasureManager.SECRET_LTX_SECTION)) {
      this.secret_restrs.set(alifeObject.name(), alifeObject.id);
    }
  }

  /**
   * todo;
   */
  protected spawnTreasure(treasureId: TTreasure): void {
    logger.info("Spawn treasure ID:", treasureId);

    if (!this.secrets.get(treasureId)) {
      abort("There is no stored secret:", treasureId);
    }

    if (this.secrets.get(treasureId).given) {
      logger.info("Secret already given:", treasureId);

      return;
    }

    const sim: XR_alife_simulator = alife();
    const secret = this.secrets.get(treasureId);

    for (const [item_section, item_params] of secret.items) {
      for (const num of $range(1, item_params.length())) {
        const itemDescriptor = item_params.get(num);

        for (const i of $range(1, itemDescriptor.count)) {
          const prob = math.random();

          if (prob < itemDescriptor.prob) {
            if (itemDescriptor.item_ids && itemDescriptor.item_ids.get(i)) {
              const se_obj: XR_cse_alife_object = sim.object(item_params.get(num).item_ids!.get(i))!;
              const obj = sim.create(item_section, se_obj.position, se_obj.m_level_vertex_id, se_obj.m_game_vertex_id);

              obj.angle = se_obj.angle;
              obj.use_ai_locations(se_obj.used_ai_locations());

              this.items_from_secrets.set(obj.id, this.secret_restrs.get(treasureId));

              secret.to_find = secret.to_find + 1;
            }
          }
        }
      }
    }
  }

  /**
   * todo;
   */
  public giveActorTreasureCoordinates(treasureId: TTreasure, spawn: boolean = false): void {
    logger.info("Give treasure:", treasureId, spawn);

    if (!this.secrets.get(treasureId)) {
      abort("There is no stored secret: [%s]", tostring(treasureId));
    }

    if (this.secrets.get(treasureId).given) {
      return logger.info("Already given treasure:", treasureId);
    }

    if (this.secrets.get(treasureId).to_find === 0 && !this.secrets.get(treasureId).empty) {
      NotificationManager.getInstance().sendTreasureNotification(2);

      return logger.info("Already empty treasure:", treasureId);
    }

    if (spawn) {
      this.spawnTreasure(treasureId);
    }

    level.map_add_object_spot_ser(this.secret_restrs.get(treasureId), "treasure", "");

    this.secrets.get(treasureId).given = true;
    NotificationManager.getInstance().sendTreasureNotification(0);
  }

  /**
   * todo;
   */
  public giveActorRandomTreasureCoordinates(): void {
    logger.info("Give random treasure");

    const rnd_tbl: LuaTable<number, TTreasure> = new LuaTable();

    for (const [k, v] of this.secrets) {
      if (!v.given) {
        table.insert(rnd_tbl, k);
      }
    }

    if (rnd_tbl.length() !== 0) {
      this.giveActorTreasureCoordinates(rnd_tbl.get(math.random(1, rnd_tbl.length())));
    } else {
      logger.info("No available treasures to give random");
    }
  }

  /**
   * todo;
   */
  public on_item_take(objectId: TNumberId): void {
    const restrId: Optional<TNumberId> = this.items_from_secrets.get(objectId);
    let treasureId: Optional<TTreasure> = null;

    for (const [k, v] of this.secret_restrs) {
      if (restrId === v) {
        treasureId = k;
        break;
      }
    }

    if (treasureId) {
      logger.info("Treasure item taken:", objectId);

      const secret = this.secrets.get(treasureId);

      secret.to_find = secret.to_find - 1;

      if (this.secrets.get(treasureId).to_find === 0) {
        level.map_remove_object_spot(this.secret_restrs.get(treasureId), "treasure");
        StatisticsManager.getInstance().incrementCollectedSecretsCount();
        this.secrets.get(treasureId).checked = true;
        NotificationManager.getInstance().sendTreasureNotification(1);

        logger.info("Secret now is empty:", treasureId);
      }

      this.items_from_secrets.delete(objectId);
    }
  }

  /**
   * todo;
   */
  public override update(): void {
    if (!this.items_spawned) {
      for (const [k, v] of this.secrets) {
        this.spawnTreasure(k);
      }

      this.items_spawned = true;
    }

    const global_time: number = time_global();

    if (this.check_time && global_time - this.check_time <= 500) {
      return;
    }

    this.check_time = global_time;

    for (const [k, v] of this.secrets) {
      if (v.given) {
        if (v.empty) {
          const sect = pickSectionFromCondList(registry.actor, null, v.empty as any);

          if (sect === STRINGIFIED_TRUE && !v.checked) {
            level.map_remove_object_spot(this.secret_restrs.get(k), "treasure");
            StatisticsManager.getInstance().incrementCollectedSecretsCount();
            v.empty = null;
            v.checked = true;

            logger.info("Empty secret, remove map spot:", k);
          }
        } else if (v.refreshing && v.checked) {
          const sect = pickSectionFromCondList(registry.actor, null, v.refreshing);

          if (sect === STRINGIFIED_TRUE) {
            v.given = false;
            v.checked = false;

            logger.info("Given secret for availability:", k);
          }
        }
      }
    }
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, TreasureManager.name);

    packet.w_bool(this.items_spawned);

    let num = 0;

    for (const [k, v] of this.items_from_secrets) {
      num = num + 1;
    }

    packet.w_u16(num);

    for (const [k, v] of this.items_from_secrets) {
      packet.w_u16(k);
      packet.w_u16(v);
    }

    num = 0;

    for (const [k, v] of this.secrets) {
      num = num + 1;
    }

    packet.w_u16(num);

    for (const [k, v] of this.secrets) {
      if (!this.secret_restrs.get(k)) {
        packet.w_u16(-1);
      } else {
        packet.w_u16(this.secret_restrs.get(k));
      }

      packet.w_bool(v.given);
      packet.w_bool(v.checked);
      packet.w_u8(v.to_find);
    }

    setSaveMarker(packet, true, TreasureManager.name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, TreasureManager.name);

    this.items_spawned = reader.r_bool();
    this.items_from_secrets = new LuaTable();

    const itemsCount = reader.r_u16();

    for (const it of $range(1, itemsCount)) {
      const k: number = reader.r_u16();
      const v: number = reader.r_u16();

      this.items_from_secrets.set(k, v);
    }

    const secretsCount: number = reader.r_u16();

    for (const it of $range(1, secretsCount)) {
      let id: number | string = reader.r_u16();

      for (const [k, v] of this.secret_restrs) {
        if (v === id) {
          id = k;
          break;
        }
      }

      const isGiven: boolean = reader.r_bool();
      const isChecked: boolean = reader.r_bool();
      const isToFind: number = reader.r_u8();

      if (id !== MAX_UNSIGNED_16_BIT && this.secrets.get(id as any)) {
        const secret = this.secrets.get(id as any);

        secret.given = isGiven;
        secret.checked = isChecked;
        secret.to_find = isToFind;
      }
    }

    setLoadMarker(reader, true, TreasureManager.name);
  }
}
