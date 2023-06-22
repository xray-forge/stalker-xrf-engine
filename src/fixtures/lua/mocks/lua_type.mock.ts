import { NIL } from "@/engine/lib/constants/words";

/**
 * todo;
 */
export function mockType(value: unknown): string {
  const type = typeof value;

  if (value === null || value === undefined) {
    return NIL;
  } else if (type === "symbol") {
    return "object";
  } else if (type === "object") {
    return "table";
  } else if (type === "bigint") {
    return "number";
  } else {
    return type;
  }
}
