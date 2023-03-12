import { ELtxFieldType, ILtxFieldDescriptor } from "#/utils/ltx/types";

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
export function renderField(name: string, value: ILtxFieldDescriptor<unknown>): string {
  const comment: string = value.meta?.comment ? `; ${value.meta.comment}` : ";";

  switch (value.type) {
    case ELtxFieldType.IDENTIFIER:
      return `${name} = ${value.value}` + comment;

    case ELtxFieldType.STRING:
      return `${name} = "${value.value}"` + comment;

    case ELtxFieldType.INTEGER:
      assertIsInteger(value.value);

      return `${name} = ${value.value}` + comment;

    case ELtxFieldType.FLOAT:
      assertIsNumber(value.value);

      return `${name} = ${toFloat(value.value)}` + comment;

    case ELtxFieldType.BOOLEAN:
      assertIsBoolean(value.value);

      return `${name} = ${String(value.value)}` + comment;

    case ELtxFieldType.EMPTY:
      return `${name}` + comment;

    case ELtxFieldType.STRING_ARRAY:
      assertIsArray(value.value);

      return `${name} = ${(value.value as Array<string>).map((it) => `"${it}"`).join(", ")}` + comment;

    case ELtxFieldType.IDENTIFIER_ARRAY:
      assertIsArray(value.value);

      return `${name} = ${(value.value as Array<string>).join(", ")}` + comment;

    case ELtxFieldType.INTEGER_ARRAY:
      assertIsArray(value.value);

      return (
        `${name} = ${(value.value as Array<number>)
          .map((it) => {
            assertIsInteger(it);

            return it;
          })
          .join(", ")}` + comment
      );

    case ELtxFieldType.FLOAT_ARRAY:
      assertIsArray(value.value);

      return (
        `${name} = ${(value.value as Array<number>)
          .map((it) => {
            assertIsNumber(it);

            return toFloat(it);
          })
          .join(", ")}` + comment
      );
  }

  throw new Error(`Unexpected LTX values supplied: '${JSON.stringify(value)}'.`);
}
