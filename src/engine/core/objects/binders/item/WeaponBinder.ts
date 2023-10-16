import { LuabindClass, object_binder } from "xray16";

import { registerObject, resetObject, unregisterObject } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeapon } from "@/engine/core/objects/server/item";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder for weapon client objects.
 */
@LuabindClass()
export class WeaponBinder extends object_binder {
  public override net_spawn(object: ItemWeapon): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerObject(this.object);

    /*
    if (false) {
      EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, this.object, this);
    }
    */

    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_GO_ONLINE, this.object, this);

    return true;
  }

  public override net_destroy(): void {
    EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_GO_OFFLINE, this.object, this);

    unregisterObject(this.object);

    super.net_destroy();
  }

  public override reinit(): void {
    super.reinit();

    resetObject(this.object);
  }
}
