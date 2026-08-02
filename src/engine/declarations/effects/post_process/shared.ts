import { Nillable, TNumberId } from "xray16/lib";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger("post_process");

export const postProcessState: { camEffectorPlayingObjectId: Nillable<TNumberId> } = {
  camEffectorPlayingObjectId: null,
};
