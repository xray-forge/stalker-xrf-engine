import {
  XR_LuaBindBase,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_ini_file,
  XR_net_packet,
  alife,
  ini_file,
  level,
  time_global
} from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { AnyCallable, Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/TreasureManager");
let treasureManager: Optional<ITreasureManager> = null;

export interface ITreasureSecret {
  given: boolean;
  checked: boolean;
  refreshing: boolean;
  empty: Optional<boolean>;
  to_find: number;
  items: LuaTable<
    string, // section
    LuaTable<
      number,
      {
        count: number;
        prob: number;
        item_ids: Optional<LuaTable<number, number>>;
      }
    >
  >;
}

export interface ITreasureManager extends XR_LuaBindBase {
  items_spawned: boolean;
  check_time: any;
  secrets: LuaTable<string, ITreasureSecret>;
  secret_restrs: LuaTable<string, number>;
  items_from_secrets: LuaTable<number, number>;

  initialize(): void;
  fill(se_obj: XR_cse_alife_object, treasure_id: string): Optional<boolean>;
  register_item(se_obj: XR_cse_alife_object): Optional<boolean>;
  register_restrictor(se_obj: XR_cse_alife_object): void;
  update(): void;
  spawn_treasure(treasure_id: string): void;
  give_treasure(treasure_id: string, spawn?: boolean): void;
  give_random(): void;
  on_item_take(obj_id: number): void;
  save(packet: XR_net_packet): void;
  load(packet: XR_net_packet): void;
}

export const TreasureManager: ITreasureManager = declare_xr_class("TreasureManager", null, {
  __init(): void {
    this.items_spawned = false;
    this.check_time = null;
    this.secrets = new LuaTable();
    this.secret_restrs = new LuaTable();
    this.items_from_secrets = new LuaTable();
  },
  initialize(): void {
    const ini: XR_ini_file = new ini_file("misc\\secrets.ltx");
    const totalSecretsCount: number = ini.line_count("list");
    const xr_logic = get_global("xr_logic");

    log.info("Initialize secrets, expected:", totalSecretsCount);

    for (const i of $range(0, totalSecretsCount - 1)) {
      const [result, id, value] = ini.r_line("list", i, "", "");

      if (ini.section_exist(id)) {
        this.secrets!.set(id, {
          items: new LuaTable(),
          given: false,
          empty: null,
          refreshing: false,
          checked: false,
          to_find: 0
        });

        const items_count: number = ini.line_count(id);
        const item_section: string = "";

        for (const i of $range(0, items_count - 1)) {
          const [result, item_section, str] = ini.r_line(id, i, "", "");

          if (item_section === "empty") {
            const parsed_condlist = (xr_logic.parse_condlist as AnyCallable)(
              null,
              "treasure_manager",
              "empty_cond",
              str
            );

            this.secrets.get(id).empty = parsed_condlist;
          } else if (item_section === "refreshing") {
            const parsed_condlist = (xr_logic.parse_condlist as AnyCallable)(
              null,
              "treasure_manager",
              "refreshing_cond",
              str
            );

            this.secrets.get(id).refreshing = parsed_condlist;
          } else {
            this.secrets.get(id).items.set(item_section, new LuaTable());

            const tbl: LuaTable = (get_global("utils").parse_spawns as AnyCallable)(str);

            if (tbl.length() === 0) {
              abort("There is no items count set for treasure [%s], item [%s]", id, item_section);
            }

            for (const it of $range(1, tbl.length())) {
              const tbl2 = { count: tonumber(tbl.get(it).section), prob: tonumber(tbl.get(it).prob || 1) };

              table.insert(this.secrets.get(id).items.get(item_section) as LuaTable<any>, tbl2);
            }
          }
        }
      } else {
        abort("There is no section [%s] in secrets.ltx", tostring(i));
      }
    }

    log.info("Initialized");
  },
  fill(se_obj: XR_cse_alife_object, treasure_id: string): Optional<boolean> {
    log.info("Fill:", se_obj.id, treasure_id);

    if (this.secrets.get(treasure_id) !== null) {
      const item = this.secrets.get(treasure_id).items.get(se_obj.section_name());

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
        abort("Attempt to register unknown item [%s] in secret [%s]", se_obj.section_name(), treasure_id);
      }
    } else {
      abort("Attempt to register item [%s] in unexistent secret [%s]", se_obj.name(), treasure_id);
    }
  },
  register_item(se_obj: XR_cse_alife_object): Optional<boolean> {
    const spawn_ini: XR_ini_file = se_obj.spawn_ini();

    if (spawn_ini.section_exist("secret")) {
      log.info("Register secret treasure item:", se_obj.id);

      const [result, id, value] = spawn_ini.r_line("secret", 0, "", "");

      if (id !== "name") {
        abort("There is no 'name' field in [secret] section for object [%s]", se_obj.name());
      } else if (value === "") {
        abort("Field 'name' in [secret] section got no value for object [%s]", se_obj.name());
      }

      return this.fill(se_obj, value);
    } else {
      return null;
    }
  },
  register_restrictor(se_obj: XR_cse_alife_object): void {
    const spawn_ini: XR_ini_file = se_obj.spawn_ini();

    if (spawn_ini.section_exist("secret")) {
      this.secret_restrs.set(se_obj.name(), se_obj.id);
    }
  },
  update(): void {
    if (!this.items_spawned) {
      for (const [k, v] of this.secrets) {
        this.spawn_treasure(k);
      }

      this.items_spawned = true;
    }

    const global_time: number = time_global();
    const xr_logic = get_global("xr_logic");

    if (this.check_time && global_time - this.check_time <= 500) {
      return;
    }

    this.check_time = global_time;

    for (const [k, v] of this.secrets) {
      if (v.given) {
        if (v.empty) {
          const sect = (xr_logic.pick_section_from_condlist as AnyCallable)(getActor(), null, v.empty);

          if (sect === "true" && !v.checked) {
            level.map_remove_object_spot(this.secret_restrs.get(k), "treasure");
            get_global("xr_statistic").inc_founded_secrets_counter();
            v.empty = null;
            v.checked = true;

            log.info("Empty secret, remove map spot:", k);
          }
        } else if (v.refreshing && v.checked) {
          const sect = (xr_logic.pick_section_from_condlist as AnyCallable)(getActor(), null, v.refreshing);

          if (sect === "true") {
            v.given = false;
            v.checked = false;

            log.info("Given secret for availability:", k);
          }
        }
      }
    }
  },
  spawn_treasure(treasure_id: string): void {
    log.info("Spawn treasure ID:", treasure_id);

    if (!this.secrets.get(treasure_id)) {
      abort("There is no stored secret:", treasure_id);
    }

    if (this.secrets.get(treasure_id).given) {
      log.info("Secret already given:", treasure_id);

      return;
    }

    const sim: XR_alife_simulator = alife();
    const secret = this.secrets.get(treasure_id);

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

              this.items_from_secrets.set(obj.id, this.secret_restrs.get(treasure_id));

              secret.to_find = secret.to_find + 1;
            }
          }
        }
      }
    }
  },
  give_treasure(treasure_id: string, spawn?: boolean): void {
    log.info("Give treasure:", treasure_id);

    if (!this.secrets.get(treasure_id)) {
      abort("There is no stored secret: [%s]", tostring(treasure_id));
    }

    if (this.secrets.get(treasure_id).given) {
      return log.info("Already given treasure:", treasure_id);
    }

    if (this.secrets.get(treasure_id).to_find == 0 && !this.secrets.get(treasure_id).empty) {
      (get_global("news_manager").send_treasure as AnyCallable)(2);

      return log.info("Already empty treasure:", treasure_id);
    }

    if (spawn) {
      this.spawn_treasure(treasure_id);
    }

    level.map_add_object_spot_ser(this.secret_restrs.get(treasure_id), "treasure", "");

    this.secrets.get(treasure_id).given = true;
    (get_global("news_manager").send_treasure as AnyCallable)(0);

    log.info("Give treasure:", treasure_id);
  },
  give_random(): void {
    log.info("Give random treasure");

    const rnd_tbl: LuaTable<number, string> = new LuaTable();

    for (const [k, v] of this.secrets) {
      if (!v.given) {
        table.insert(rnd_tbl, k);
      }
    }

    if (rnd_tbl.length() !== 0) {
      this.give_treasure(rnd_tbl.get(math.random(1, rnd_tbl.length())));
    } else {
      log.info("No available treasures to give random");
    }
  },
  on_item_take(obj_id: number): void {
    const restrId: Optional<number> = this.items_from_secrets.get(obj_id);
    let treasureId = null;

    for (const [k, v] of this.secret_restrs) {
      if (restrId == v) {
        treasureId = k;
        break;
      }
    }

    if (treasureId) {
      log.info("Treasure item taken:", obj_id);

      const secret = this.secrets.get(treasureId);

      secret.to_find = secret.to_find - 1;

      if (this.secrets.get(treasureId).to_find === 0) {
        level.map_remove_object_spot(this.secret_restrs.get(treasureId), "treasure");
        get_global("xr_statistic").inc_founded_secrets_counter();
        this.secrets.get(treasureId).checked = true;
        (get_global("news_manager").send_treasure as AnyCallable)(1);

        log.info("Secret now is empty:", treasureId);
      }

      this.items_from_secrets.delete(obj_id);
    }
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "TreasureManager");

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

    setSaveMarker(packet, true, "TreasureManager");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "TreasureManager");

    this.items_spawned = packet.r_bool();
    this.items_from_secrets = new LuaTable();

    const itemsCount = packet.r_u16();

    for (const it of $range(1, itemsCount)) {
      const k: number = packet.r_u16();
      const v: number = packet.r_u16();

      this.items_from_secrets.set(k, v);
    }

    const secretsCount: number = packet.r_u16();

    for (const it of $range(1, secretsCount)) {
      let id: number | string = packet.r_u16();

      for (const [k, v] of this.secret_restrs) {
        if (v === id) {
          id = k;
          break;
        }
      }

      const given = packet.r_bool();
      const checked = packet.r_bool();
      const to_find = packet.r_u8();

      if (id !== MAX_UNSIGNED_16_BIT && this.secrets.get(id as any)) {
        const secret = this.secrets.get(id as any);

        secret.given = given;
        secret.checked = checked;
        secret.to_find = to_find;
      }
    }

    setLoadMarker(packet, true, "TreasureManager");
  }
} as ITreasureManager);

export function getTreasureManager(): ITreasureManager {
  if (treasureManager === null) {
    treasureManager = create_xr_class_instance(TreasureManager);
    treasureManager.initialize();
  }

  return treasureManager;
}
