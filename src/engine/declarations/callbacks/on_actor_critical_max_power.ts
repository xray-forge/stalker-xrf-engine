import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/** Handle actor max power event. */
extern("on_actor_critical_max_power", (): void => logger.info("Actor critical max power"));
