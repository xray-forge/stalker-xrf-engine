import { TCount, TSection } from "@/engine/lib/types";

/**
 * Descriptor of box item spawn.
 */
export interface IBoxDropItemDescriptor {
  count: TCount;
  section: TSection;
}

/**
 * Probability descriptor for separate spawn item.
 */
export interface IBoxDropProbabilityDescriptor {
  min: TCount;
  max: TCount;
}
