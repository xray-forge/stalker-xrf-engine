import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/** Handle actor bleeding. */
extern("on_actor_bleeding", (): void => logger.info("Actor bleeding"));
