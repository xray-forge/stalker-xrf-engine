import { Vector } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger("actor");

// todo: Move to input manager or effects state.
export const actorState: { actorPositionForRestore: Nillable<Vector> } = {
  actorPositionForRestore: null,
};
