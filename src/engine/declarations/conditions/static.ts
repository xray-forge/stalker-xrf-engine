import { extern } from "xray16/lib";

/**
 * Always returns `true`.
 */
extern("xr_conditions.always", (): boolean => true);

/**
 * Always returns `false`.
 */
extern("xr_conditions.never", (): boolean => false);
