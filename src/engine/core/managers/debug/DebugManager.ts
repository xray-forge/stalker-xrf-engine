import { getFS } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { saveTextToFile } from "@/engine/core/utils/fs";
import { LuaLogger } from "@/engine/core/utils/logging";
import { toJSON } from "@/engine/core/utils/transform";
import { roots } from "@/engine/lib/constants/roots";
import { AnyObject, TPath } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle debugging actions / switching / dumps etc.
 */
export class DebugManager extends AbstractManager {
  /**
   * Dump in-memory lua data from various configs / managers.
   */
  public dumpLuaData(): void {
    const folder: TPath = getFS().update_path(roots.appDataRoot, "dumps");
    const name: TPath = "lua_data.json";

    logger.info("Dumping LUA state data as '%s'", name);

    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    saveTextToFile(folder, name, toJSON(data));
  }

  /**
   * Dump in-memory system.ini representation as text file.
   * Combines all included files as single text entity.
   */
  public dumpSystemIni(): void {
    const path: TPath = "_appdata_\\dumps\\system.ltx";

    logger.info("Saving system ini as '%s'", path);
    SYSTEM_INI.save_as(path);
  }
}
