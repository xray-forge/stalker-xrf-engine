import { game } from "xray16";
import { extern } from "xray16/lib";

/**
 * Check if any game tutorial is active.
 */
extern("xr_conditions.has_active_tutorial", (): boolean => game.has_active_tutorial());
