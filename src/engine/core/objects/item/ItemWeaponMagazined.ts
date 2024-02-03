import { cse_alife_item_weapon_magazined, LuabindClass } from "xray16";

import {
  registerObjectDynamicState,
  registerObjectStoryLinks,
  unregisterStoryLinkByObjectId,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { TreasureManager } from "@/engine/core/managers/treasures";

/**
 * Magazined weapon server object representation.
 */
@LuabindClass()
export class ItemWeaponMagazined extends cse_alife_item_weapon_magazined {
  public isSecretItem: boolean = false;

  public override on_spawn(): void {
    super.on_spawn();

    registerObjectDynamicState(this.id);
  }

  public override on_register(): void {
    super.on_register();

    registerObjectStoryLinks(this);
    this.isSecretItem = TreasureManager.registerItem(this);
    EventsManager.emitEvent(EGameEvent.ITEM_REGISTERED, this);
    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_REGISTERED, this);
    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_MAGAZINED_REGISTERED, this);
  }

  public override on_unregister(): void {
    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_MAGAZINED_UNREGISTERED, this);
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
