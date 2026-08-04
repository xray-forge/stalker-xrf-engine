import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/** Handle actor weapon jammed event. */
extern("on_actor_weapon_jammed", (): void => logger.info("Actor weapon jammed"));
