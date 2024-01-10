import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { TLabel, TName } from "@/engine/lib/types";

/**
 * @param value - any data to cast for lua logging
 * @returns value casted to log string
 */
export function toLogValue(value: unknown): TLabel {
  const itType: TName = type(value);

  switch (itType) {
    case NIL:
      return "<nil>";

    case "string": {
      return value === "" ? "<empty_str>" : (value as string);
    }

    case "number": {
      return tostring(value);
    }

    case "boolean": {
      return string.format("<boolean: %s>", value === true ? TRUE : FALSE);
      break;
    }

    case "userdata": {
      return "<userdata>";
    }

    default: {
      return string.format("<%s: %s>", itType, tostring(value));
    }
  }
}
