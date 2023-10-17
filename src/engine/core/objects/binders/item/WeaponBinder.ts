import { game_object, LuabindClass, object_binder } from "xray16";

import {
  getObjectDynamicState,
  IDynamicObjectState,
  registerObject,
  resetObject,
  unregisterObject,
  unregisterObjectDynamicState,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ItemWeapon } from "@/engine/core/objects/server/item/ItemWeapon";
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

    const state: IDynamicObjectState = getObjectDynamicState(this.object.id(), true);

    if (!state.hasBeenOnline) {
      state.hasBeenOnline = true;
      EventsManager.emitEvent(EGameEvent.ITEM_WEAPON_GO_ONLINE_FIRST_TIME, this.object, this);
    }

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

  public override net_Relcase(object: game_object): void {
    super.net_Relcase(object);

    unregisterObjectDynamicState(object.id());
  }
}
