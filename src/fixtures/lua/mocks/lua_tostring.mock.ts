import { NIL } from "@/engine/lib/constants/words";

/**
 * Mock lua `tostring` global method.
 *
 * @param value - target value to cast into string
 * @returns value casted to string similar to lua
 */
export function mockToString(value: unknown): string {
  if (value === undefined || value === null) {
    return NIL;
  } else if (typeof value === "object") {
    return "table: 0x000000";
  } else if (typeof value === "function") {
    return "function: 0x000000";
  } else {
    return String(value);
  }
}
