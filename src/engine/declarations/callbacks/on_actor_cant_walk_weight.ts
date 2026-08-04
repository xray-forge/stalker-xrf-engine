import { extern } from "xray16/lib";
import { $filename } from "xray16/macros";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/** Handle actor weight change with cannot walk event. */
extern("on_actor_cant_walk_weight", (): void => logger.info("Actor cant walk weight"));
