import { ClientObject, TRate } from "@/engine/lib/types";

/**
 * Set item condition.
 *
 * @param object - client object to change condition
 * @param condition - value from 0 to 100, percents
 */
export function setItemCondition(object: ClientObject, condition: TRate): void {
  object.set_condition(condition / 100);
}
