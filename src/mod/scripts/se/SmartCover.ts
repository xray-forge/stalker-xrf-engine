import { cse_smart_cover, game_graph, properties_helper, XR_cse_smart_cover, XR_net_packet } from "xray16";

import { Optional } from "@/mod/lib/types";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/StoryObjectsRegistry";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("SmartCover");

// todo: Move to db.
export const registered_smartcovers: LuaTable<string> = new LuaTable();
export const registered_smartcovers_by_lv_id: LuaTable<number> = new LuaTable();

export interface ISmartCover extends XR_cse_smart_cover {
  loopholes: LuaTable<string>;
  last_description: string;

  FillProps(pref: string, items: LuaTable<number, unknown>): void;
}

export const SmartCover: ISmartCover = declare_xr_class("SmartCover", cse_smart_cover, {
  __init(section: string): void {
    xr_class_super(section);

    this.loopholes = new LuaTable();
    this.last_description = "";

    if (this.set_available_loopholes !== null) {
      this.set_available_loopholes(this.loopholes);
    }
  },
  on_before_register(): void {
    cse_smart_cover.on_before_register(this);
    registered_smartcovers.set(this.name(), this);
  },
  on_register(): void {
    cse_smart_cover.on_register(this);
    log.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);

    const level_id = game_graph().vertex(this.m_game_vertex_id).level_id();

    if (registered_smartcovers_by_lv_id.get(level_id) === null) {
      registered_smartcovers_by_lv_id.set(level_id, {});
    }

    registered_smartcovers_by_lv_id.get(level_id)[this.m_level_vertex_id] = this;
  },
  on_unregister(): void {
    unregisterStoryObjectById(this.id);
    registered_smartcovers.set(this.name(), null);

    const level_id: number = game_graph().vertex(this.m_game_vertex_id).level_id();

    registered_smartcovers_by_lv_id.get(level_id)[this.m_level_vertex_id] = null;
    cse_smart_cover.on_unregister(this);
  },
  FillProps(pref: string, items: LuaTable<number>): void {
    cse_smart_cover.FillProps(this, pref, items);

    const prefix = pref + "\\" + this.section_name() + "\\";
    const smart_cover_description = this.description();

    if (smart_cover_description !== this.last_description) {
      for (const [k, v] of this.loopholes) {
        this.loopholes.delete(k);
      }

      this.last_description = tostring(smart_cover_description);
    }

    if (smart_cover_description !== null) {
      const loopholes = get_global("smart_covers").descriptions[smart_cover_description].loopholes;

      for (const [k, v] of loopholes) {
        if (this.loopholes.get(v.id) == null) {
          this.loopholes.set(v.id, true);
        }

        const h: boolean = new properties_helper().create_bool(
          items,
          prefix + "loopholes\\" + v.id,
          this,
          this.loopholes,
          v.id
        );

        this.set_loopholes_table_checker(h);
      }
    }
  },
  update(): void {
    cse_smart_cover.update(this);
  },
  STATE_Write(packet: XR_net_packet): void {
    cse_smart_cover.STATE_Write(this, packet);

    packet.w_stringZ(this.last_description);

    let n = 0;

    for (const [k, v] of this.loopholes) {
      n = n + 1;
    }

    packet.w_u8(n);

    for (const [k, v] of this.loopholes) {
      packet.w_stringZ(k);
      packet.w_bool(v);
    }
  },
  STATE_Read(packet: XR_net_packet, size: number): void {
    cse_smart_cover.STATE_Read(this, packet, size);

    if (this.script_version >= 9) {
      this.last_description = packet.r_stringZ();

      const smart_cover_description: Optional<string> =
        this.last_description !== "" ? this.last_description : this.description();
      const existing_loopholes: LuaTable<string, any> = new LuaTable();
      const smart_covers = get_global("smart_covers");

      if (smart_cover_description !== null) {
        if (smart_covers === null) {
          abort("smartcovers is null");
        }

        if (smart_covers.descriptions[smart_cover_description] == null) {
          abort("smartcover [%s] has wrong description [%s]", this.name(), tostring(smart_cover_description));
        }

        const loopholes: LuaTable<string, any> = smart_covers.descriptions[smart_cover_description].loopholes;

        for (const [k, v] of loopholes) {
          existing_loopholes.set(v.id, true);
        }

        const n = packet.r_u8();

        for (const i of $range(1, n)) {
          const loophole_id: string = packet.r_stringZ();
          const loophole_exist: boolean = packet.r_bool();

          if (existing_loopholes.get(loophole_id) !== null) {
            this.loopholes.set(loophole_id, loophole_exist);
          }
        }
      }
    } else {
      const smart_cover_description = this.description();

      if (smart_cover_description !== null) {
        const loopholes: LuaTable = get_global("smart_covers").descriptions[smart_cover_description].loopholes;

        for (const [k, v] of loopholes) {
          this.loopholes.set(v.id, true);
        }

        this.last_description = smart_cover_description;
      }
    }
  }
} as ISmartCover);
