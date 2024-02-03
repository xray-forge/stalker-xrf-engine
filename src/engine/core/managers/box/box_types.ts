import { TCount } from "@/engine/lib/types";

/**
 * Probability descriptor for separate spawn item.
 */
export interface IBoxDropProbabilityDescriptor {
  min: TCount;
  max: TCount;
}
