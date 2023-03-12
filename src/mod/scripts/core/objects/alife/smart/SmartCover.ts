import { cse_smart_cover, LuabindClass, properties_helper, XR_net_packet } from "xray16";

import { Optional, TCount, TSection, TStringId } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { checkSpawnIniForStoryId } from "@/mod/scripts/core/database/StoryObjectsRegistry";
import {
  ISmartCoverLoopholeDescriptor,
  smart_covers_list,
} from "@/mod/scripts/core/objects/alife/smart/smart_covers/smart_covers_list";
import { unregisterStoryObjectById } from "@/mod/scripts/utils/alife";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class SmartCover extends cse_smart_cover {
  public loopholes: LuaTable<TStringId, boolean> = new LuaTable();
  public last_description: string = "";

  /**
   * todo;
   */
  public constructor(section: TSection) {
    super(section);

    if (this.set_available_loopholes !== null) {
      this.set_available_loopholes(this.loopholes);
    }
  }

  /**
   * todo;
   */
  public override on_before_register(): void {
    super.on_before_register();
    registry.smartCovers.set(this.name(), this);
  }

  /**
   * todo;
   */
  public override on_register(): void {
    super.on_register();
    logger.info("Register:", this.id, this.name(), this.section_name());
    checkSpawnIniForStoryId(this);
  }

  /**
   * todo;
   */
  public override on_unregister(): void {
    unregisterStoryObjectById(this.id);
    registry.smartCovers.delete(this.name());
    super.on_unregister();
  }

  /**
   * todo;
   */
  public override FillProps(pref: string, items: LuaTable<number>): void {
    super.FillProps(pref, items);

    const prefix = pref + "\\" + this.section_name() + "\\";
    const smart_cover_description = this.description();

    if (smart_cover_description !== this.last_description) {
      for (const [k, v] of this.loopholes) {
        this.loopholes.delete(k);
      }

      this.last_description = tostring(smart_cover_description);
    }

    if (smart_cover_description !== null) {
      const loopholes = smart_covers_list.get(smart_cover_description).loopholes;

      for (const [k, v] of loopholes) {
        if (this.loopholes.get(v.id) === null) {
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
  }

  /**
   * todo;
   */
  public override update(): void {
    super.update();
  }

  /**
   * todo;
   */
  public override STATE_Write(packet: XR_net_packet): void {
    super.STATE_Write(packet);

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
  }

  /**
   * todo;
   */
  public override STATE_Read(packet: XR_net_packet, size: TCount): void {
    super.STATE_Read(packet, size);

    if (this.script_version >= 9) {
      this.last_description = packet.r_stringZ();

      const smart_cover_description: Optional<string> =
        this.last_description !== "" ? this.last_description : this.description();
      const existing_loopholes: LuaTable<string, any> = new LuaTable();

      if (smart_cover_description !== null) {
        if (!smart_covers_list.has(smart_cover_description)) {
          abort("smartcover [%s] has wrong description [%s]", this.name(), tostring(smart_cover_description));
        }

        const loopholes: LuaTable<number, ISmartCoverLoopholeDescriptor> =
          smart_covers_list.get(smart_cover_description).loopholes;

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
        const loopholes: LuaTable<number, ISmartCoverLoopholeDescriptor> =
          smart_covers_list.get(smart_cover_description).loopholes;

        for (const [k, v] of loopholes) {
          this.loopholes.set(v.id, true);
        }

        this.last_description = smart_cover_description;
      }
    }
  }
}
