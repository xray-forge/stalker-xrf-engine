import { extern } from "xray16/lib";

import { isBlackScreen } from "@/engine/core/utils/game";

/**
 * Check if currently game rendering black screen.
 */
extern("xr_conditions.black_screen", (): boolean => isBlackScreen());
