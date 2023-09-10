import { cse_alife_item_weapon, LuabindClass } from "xray16";

import { registerObjectStoryLinks, unregisterStoryLinkByObjectId } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { TreasureManager } from "@/engine/core/managers/world/treasures";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Weapon item server representation.
 */
@LuabindClass()
export class ItemWeapon extends cse_alife_item_weapon {
  public isSecretItem: boolean = false;

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    this.isSecretItem = TreasureManager.registerItem(this);
    EventsManager.emitEvent(EGameEvent.ITEM_REGISTERED, this);
    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_REGISTERED, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_UNREGISTERED, this);
    EventsManager.emitEvent(EGameEvent.ITEM_UNREGISTERED, this);
    unregisterStoryLinkByObjectId(this.id);

    super.on_unregister();
  }

  public override can_switch_online(): boolean {
    if (this.isSecretItem) {
      return false;
    }

    return super.can_switch_online();
  }
}
