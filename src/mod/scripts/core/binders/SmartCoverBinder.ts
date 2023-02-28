import { object_binder, XR_cse_alife_object, XR_game_object } from "xray16";

import { vectorToString } from "@/mod/scripts/utils/general";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SmartCoverBinder");

// todo: Move to db.
export const registered_smartcovers: LuaTable<string, XR_game_object> = new LuaTable();

/**
 * todo;
 */
@LuabindClass()
export class SmartCoverBinder extends object_binder {
  public constructor(object: XR_game_object) {
    super(object);
  }

  public net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Smart cover net spawn:", this.object.name(), vectorToString(this.object.direction()));
    registered_smartcovers.set(this.object.name(), this.object);

    return true;
  }

  public net_destroy(): void {
    logger.info("Smart cover net destroy:", this.object.name());
    registered_smartcovers.delete(this.object.name());
    super.net_destroy();
  }

  public update(delta: number): void {
    super.update(delta);
  }
}
