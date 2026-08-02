import { extern } from "xray16/lib";

/**
 * Always returns `false`.
 */
extern("xr_conditions.never", (): boolean => false);
