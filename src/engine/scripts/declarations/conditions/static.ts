import { extern } from "@/engine/core/utils/binding";

/**
 * Always returns `true`.
 */
extern("xr_conditions.always", (): boolean => true);

/**
 * Always returns `false`.
 */
extern("xr_conditions.never", (): boolean => false);
