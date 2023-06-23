import { NIL } from "@/engine/lib/constants/words";

/**
 * todo;
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
