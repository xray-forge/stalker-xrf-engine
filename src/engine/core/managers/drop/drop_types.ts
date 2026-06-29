import { TCount } from "@/engine/lib/types";

/**
 * Descriptor of the minimal and maximal amount of an item that can be dropped.
 */
export interface IItemDropAmountDescriptor {
  min: TCount;
  max: TCount;
}
