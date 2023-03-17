import { alife, LuabindClass, object_binder, XR_cse_alife_object, XR_game_object } from "xray16";

import { TDuration } from "@/engine/lib/types";
import { addSmartTerrain, deleteSmartTerrain } from "@/engine/scripts/core/database";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class SmartTerrainBinder extends object_binder {
  public se_smart_terrain!: SmartTerrain;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    this.se_smart_terrain = alife().object(object.id) as SmartTerrain;

    addSmartTerrain(this.object, this.se_smart_terrain);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    GlobalSoundManager.getInstance().stopSoundsByObjectId(this.object.id());

    deleteSmartTerrain(this.object, this.se_smart_terrain);

    super.net_destroy();
  }

  /**
   * todo;
   */
  public override update(delta: TDuration): void {
    super.update(delta);
    this.se_smart_terrain.update();
  }
}
