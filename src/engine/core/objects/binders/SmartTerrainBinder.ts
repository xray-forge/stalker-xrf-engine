import { alife, LuabindClass, object_binder, XR_cse_alife_object } from "xray16";

import { registerSmartTerrain, unregisterSmartTerrain } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { SmartTerrain } from "@/engine/core/objects/alife/smart/SmartTerrain";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class SmartTerrainBinder extends object_binder {
  public se_smart_terrain!: SmartTerrain;

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    this.se_smart_terrain = alife().object(object.id) as SmartTerrain;

    registerSmartTerrain(this.object, this.se_smart_terrain);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    GlobalSoundManager.getInstance().stopSoundsByObjectId(this.object.id());

    unregisterSmartTerrain(this.object, this.se_smart_terrain);

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    super.update(delta);
    this.se_smart_terrain.update();
  }
}
