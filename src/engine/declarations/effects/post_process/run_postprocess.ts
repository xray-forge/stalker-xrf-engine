import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName, TNumberId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { SYSTEM_INI } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Run complex effector by name (section) and Nillable ID override parameter.
 */
extern(
  "xr_effects.run_postprocess",
  (_: GameObject, __: GameObject, [name, id]: [Nillable<TName>, Nillable<TNumberId>]): void => {
    logger.info("Run postprocess");

    if (!name) {
      return;
    }

    if (SYSTEM_INI.section_exist(name)) {
      level.add_complex_effector(name, id && type(id) === "number" && id > 0 ? id : 2000 + math.random(100));
    } else {
      abort("Complex effector section does not exist in system ini: '%s'.", name);
    }
  }
);
