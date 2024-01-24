import { cse_smart_cover, LuabindClass, properties_helper } from "xray16";

import { smartCoversList } from "@/engine/core/animation/smart_covers/list";
import {
  registerObjectStoryLinks,
  registerSmartCover,
  unregisterSmartCover,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { assert } from "@/engine/core/utils/assertion";
import { resetTable } from "@/engine/core/utils/table";
import { NIL } from "@/engine/lib/constants/words";
import { LuaArray, NetPacket, Optional, TCount, TLabel, TSection, TStringId } from "@/engine/lib/types";

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

  public override FillProps(pref: string, items: LuaArray<unknown>): void {
    super.FillProps(pref, items);

    const nextDescription: TLabel = tostring(this.description());

    if (nextDescription !== this.lastDescription) {
      this.lastDescription = tostring(nextDescription);
      resetTable(this.loopholes);
    }

    // todo: should this be part of memoized check?
    if (nextDescription !== NIL) {
      for (const [, descriptor] of smartCoversList.get(nextDescription).loopholes) {
        if (this.loopholes.get(descriptor.id) === null) {
          this.loopholes.set(descriptor.id, true);
        }

        this.set_loopholes_table_checker(
          new properties_helper().create_bool(
            items,
            `${pref}\\${this.section_name()}\\loopholes\\${descriptor.id}`,
            this,
            this.loopholes,
            descriptor.id
          )
        );
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

    // todo: Handle `nil` values with string casting.
    this.lastDescription = packet.r_stringZ();

    const smartCoverDescription: Optional<string> =
      this.lastDescription !== "" ? this.lastDescription : this.description();
    const existingLoopholes: LuaTable<TStringId, boolean> = new LuaTable();

    if (smartCoverDescription !== null) {
      assert(
        smartCoversList.has(smartCoverDescription),
        "SmartCover '%s' has wrong description - '%s'.",
        this.name(),
        tostring(smartCoverDescription)
      );

      for (const [, descriptor] of smartCoversList.get(smartCoverDescription).loopholes) {
        existingLoopholes.set(descriptor.id, true);
      }

      const loopholesCount: TCount = packet.r_u8();

      for (const _ of $range(1, loopholesCount)) {
        const loopholeId: TStringId = packet.r_stringZ();
        const isLoopholeExisting: boolean = packet.r_bool();

        if (existingLoopholes.has(loopholeId)) {
          this.loopholes.set(loopholeId, isLoopholeExisting);
        }
      }
    }
  }
}
