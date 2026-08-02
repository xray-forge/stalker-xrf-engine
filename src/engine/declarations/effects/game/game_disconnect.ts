import { extern } from "xray16/lib";

import { disconnectFromGame } from "@/engine/core/utils/game";

/**
 * Disconnect from game simulator.
 * Stops current game and opens main manu.
 */
extern("xr_effects.game_disconnect", (): void => disconnectFromGame());
