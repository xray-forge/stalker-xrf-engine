import { ELtxFieldType, ILtxFieldDescriptor } from "#/utils/ltx/types";

import { Optional } from "@/mod/lib/types";

/**
 * todo;
 */
function assertIsNumber(it: unknown): asserts it is number {
  if (typeof it !== "number") {
    throw new Error(`Invalid number supplied: '${it}'.`);
  }
}

/**
 * todo;
 */
function assertIsBoolean(it: unknown): asserts it is boolean {
  if (typeof it !== "boolean") {
    throw new Error(`Invalid boolean supplied: '${it}'.`);
  }
}

/**
 * todo;
 */
function assertIsArray(it: unknown): asserts it is Array<unknown> {
  if (!Array.isArray(it)) {
    throw new Error(`Invalid array supplied, got '${typeof it}' type instead.`);
  }
}

/**
 * todo;
 */
function assertIsInteger(it: unknown): asserts it is number {
  if (typeof it !== "number" || !Number.isInteger(it)) {
    throw new Error(`Invalid integer number supplied: '${it}'.`);
  }
}

/**
 * todo;
 */
function toFloat(it: number, precision: number = 1): string {
  return Number.isInteger(it) ? it.toFixed(precision) : String(it);
}

/**
 * todo;
 */
function link(name: string, data: string, descriptor: Optional<ILtxFieldDescriptor<unknown>>): string {
  const comment: string = descriptor?.meta?.comment ? ` ; ${descriptor.meta.comment}` : "";

  if (descriptor === null) {
    return name + comment;
  } else if (descriptor.meta?.isBinding) {
    return `${name} ${data}` + comment;
  }

  return `${name} = ${data}` + comment;
}

/**
 * todo;
 */
export function renderField(name: string, value: Optional<ILtxFieldDescriptor<unknown>>): string {
  // In case of empty fields without data or placeholders.
  if (value === null) {
    return link(name, "", value);
  }

  switch (value.type) {
    case ELtxFieldType.STRING:
      return link(name, String(value.value), value);

    case ELtxFieldType.INTEGER:
      assertIsInteger(value.value);

      return link(name, String(value.value), value);

    case ELtxFieldType.FLOAT:
      assertIsNumber(value.value);

      return link(name, toFloat(value.value), value);

    case ELtxFieldType.BOOLEAN:
      assertIsBoolean(value.value);

      return link(name, String(value.value), value);

    case ELtxFieldType.STRING_ARRAY:
      assertIsArray(value.value);

      return link(name, (value.value as Array<string>).join(", "), value);

    case ELtxFieldType.INTEGER_ARRAY:
      assertIsArray(value.value);

      return link(
        name,
        (value.value as Array<number>)
          .map((it) => {
            assertIsInteger(it);

            return it;
          })
          .join(", "),
        value
      );

    case ELtxFieldType.FLOAT_ARRAY:
      assertIsArray(value.value);

      return link(
        name,
        (value.value as Array<number>)
          .map((it) => {
            assertIsNumber(it);

            return toFloat(it);
          })
          .join(", "),
        value
      );
  }

  throw new Error(`Unexpected LTX values supplied: '${JSON.stringify(value)}'.`);
}
