import { alife, LuabindClass, object_binder } from "xray16";

import { registerSmartTerrain, unregisterSmartTerrain } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ServerObject, TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Client side object binder for smart terrains.
 */
@LuabindClass()
export class SmartTerrainBinder extends object_binder {
  public serverObject!: SmartTerrain;

  /**
   * todo: Description.
   */
  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    this.serverObject = alife().object(object.id) as SmartTerrain;

    registerSmartTerrain(this.object, this.serverObject);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());

    unregisterSmartTerrain(this.object, this.serverObject);

    super.net_destroy();
  }

  /**
   * Handle client side updates and propagate event to server object.
   *
   * @param delta - time delta since latest update
   */
  public override update(delta: TDuration): void {
    super.update(delta);
    this.serverObject.update();
  }
}
