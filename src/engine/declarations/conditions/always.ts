import { extern } from "xray16/lib";

/**
 * Always returns `true`.
 */
extern("xr_conditions.always", (): boolean => true);
