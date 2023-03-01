import { alife, object_binder, XR_cse_alife_object, XR_game_object } from "xray16";

import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { addSmartTerrain, deleteSmartTerrain } from "@/mod/scripts/core/database";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SmartTerrainBinder");

/**
 * todo;
 */
@LuabindClass()
export class SmartTerrainBinder extends object_binder {
  public se_smart_terrain!: SmartTerrain;

  public constructor(object: XR_game_object) {
    super(object);
  }

  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    this.se_smart_terrain = alife().object(object.id) as SmartTerrain;

    addSmartTerrain(this.object, this.se_smart_terrain);

    return true;
  }

  public override net_destroy(): void {
    GlobalSound.stop_sounds_by_id(this.object.id());

    deleteSmartTerrain(this.object, this.se_smart_terrain);

    super.net_destroy();
  }

  public override update(delta: number): void {
    super.update(delta);
    this.se_smart_terrain.update();
  }
}
