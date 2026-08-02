import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/** Handle actor satiety levels change. */
extern("on_actor_satiety", () => logger.info("Actor satiety"));
