import { cse_smart_cover, LuabindClass, properties_helper } from "xray16";

import { ISmartCoverLoopholeDescriptor, smartCoversList } from "@/engine/core/animation/smart_covers";
import {
  registerObjectStoryLinks,
  registerSmartCover,
  unregisterSmartCover,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, Optional, TCount, TLabel, TSection, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Server representation of smart cover game object.
 */
@LuabindClass()
export class SmartCover extends cse_smart_cover {
  public loopholes: LuaTable<TStringId, boolean> = new LuaTable();
  public lastDescription: TLabel = "";

  public constructor(section: TSection) {
    super(section);

    if (this.set_available_loopholes !== null) {
      this.set_available_loopholes(this.loopholes);
    }
  }

  public override on_before_register(): void {
    super.on_before_register();
    registerSmartCover(this);
  }

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    EventsManager.emitEvent(EGameEvent.SMART_COVER_REGISTER, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.SMART_COVER_UNREGISTER, this);
    unregisterStoryLinkByObjectId(this.id);
    unregisterSmartCover(this);

    super.on_unregister();
  }

  public override FillProps(pref: string, items: LuaTable<number>): void {
    super.FillProps(pref, items);

    const smartCoverDescription: Optional<TLabel> = this.description();

    if (smartCoverDescription !== this.lastDescription) {
      for (const [key] of this.loopholes) {
        this.loopholes.delete(key);
      }

      this.lastDescription = tostring(smartCoverDescription);
    }

    if (smartCoverDescription !== null) {
      const loopholes = smartCoversList.get(smartCoverDescription).loopholes;

      for (const [, descriptor] of loopholes) {
        if (this.loopholes.get(descriptor.id) === null) {
          this.loopholes.set(descriptor.id, true);
        }

        const isLoopholesTableCheckerEnabled: boolean = new properties_helper().create_bool(
          items,
          `${pref}\\${this.section_name()}\\loopholes\\${descriptor.id}`,
          this,
          this.loopholes,
          descriptor.id
        );

        this.set_loopholes_table_checker(isLoopholesTableCheckerEnabled);
      }
    }
  }
  public override STATE_Write(packet: NetPacket): void {
    super.STATE_Write(packet);

    packet.w_stringZ(this.lastDescription);
    packet.w_u8(table.size(this.loopholes));

    for (const [id, isEnabled] of this.loopholes) {
      packet.w_stringZ(id);
      packet.w_bool(isEnabled);
    }
  }

  public override STATE_Read(packet: NetPacket, size: TCount): void {
    super.STATE_Read(packet, size);

    this.lastDescription = packet.r_stringZ();

    const smartCoverDescription: Optional<string> =
      this.lastDescription !== "" ? this.lastDescription : this.description();
    const existingLoopholes: LuaTable<TStringId, boolean> = new LuaTable();

    if (smartCoverDescription !== null) {
      assert(
        smartCoversList.has(smartCoverDescription),
        "SmartCover [%s] has wrong description [%s].",
        this.name(),
        tostring(smartCoverDescription)
      );

      const loopholes: LuaTable<number, ISmartCoverLoopholeDescriptor> =
        smartCoversList.get(smartCoverDescription).loopholes;

      for (const [, descriptor] of loopholes) {
        existingLoopholes.set(descriptor.id, true);
      }

      const loopholesCount: TCount = packet.r_u8();

      for (const _ of $range(1, loopholesCount)) {
        const loopholeId: TStringId = packet.r_stringZ();
        const isLoopholeExisting: boolean = packet.r_bool();

        if (existingLoopholes.get(loopholeId) !== null) {
          this.loopholes.set(loopholeId, isLoopholeExisting);
        }
      }
    }
  }
}
