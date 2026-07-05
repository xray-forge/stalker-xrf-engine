import { FALSE, NIL, TLabel, TName, TRUE } from "xray16/lib";

/**
 * @param value - Any data to cast for lua logging.
 * @returns Value casted to log string.
 */
export function toLogValue(value: unknown): TLabel {
  const valueType: TName = type(value);

  switch (valueType) {
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
    }

    case "userdata": {
      return "<userdata>";
    }

    default: {
      return string.format("<%s: %s>", valueType, tostring(value));
    }
  }
}
