import { createCondlist, joinCondlists } from "#/utils/ltx/condlist";
import {
  ELtxFieldType,
  IConditionListDescriptor,
  ILtxFieldDescriptor,
  ILtxFieldMeta,
  LTX_EXTEND,
} from "#/utils/ltx/types";

/**
 * Create generic field descriptor.
 */
export function newField<T>(type: ELtxFieldType, value: T, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<T> {
  return {
    $isField: true,
    type: type,
    value: value,
    meta,
  };
}

/**
 * Create string field descriptor.
 */
export function newStringField<T extends string>(value: T, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<T> {
  return newField(ELtxFieldType.STRING, value, meta);
}

/**
 * Create integer field descriptor.
 */
export function newIntegerField(value: number, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<number> {
  return newField(ELtxFieldType.INTEGER, value, meta);
}

/**
 * Create float field descriptor.
 */
export function newFloatField(value: number, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<number> {
  return newField(ELtxFieldType.FLOAT, value, meta);
}

/**
 * Create boolean field descriptor.
 */
export function newBooleanField(value: boolean, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<boolean> {
  return newField(ELtxFieldType.BOOLEAN, value, meta);
}

/**
 * Create condlist field descriptor.
 */
export function newCondlistField(
  value?: boolean | IConditionListDescriptor,
  meta: ILtxFieldMeta = {}
): ILtxFieldDescriptor<string> {
  return newField(ELtxFieldType.CONDLIST, createCondlist(value), meta);
}

/**
 * Create condlist array field descriptor.
 */
export function newCondlistsField(
  value: Array<boolean | IConditionListDescriptor>,
  meta: ILtxFieldMeta = {}
): ILtxFieldDescriptor<string> {
  return newField(ELtxFieldType.CONDLIST, joinCondlists(...value.map(createCondlist)), meta);
}

/**
 * Create string array field descriptor.
 */
export function newStringsField<T extends string>(
  value: Array<T>,
  meta: ILtxFieldMeta = {}
): ILtxFieldDescriptor<Array<T>> {
  return newField(ELtxFieldType.STRING_ARRAY, value, meta);
}

/**
 * Create integer array field descriptor.
 */
export function newIntegersField(value: Array<number>, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<Array<number>> {
  return newField(ELtxFieldType.INTEGER_ARRAY, value, meta);
}

/**
 * Create float array field descriptor.
 */
export function newFloatsField(value: Array<number>, meta: ILtxFieldMeta = {}): ILtxFieldDescriptor<Array<number>> {
  return newField(ELtxFieldType.FLOAT_ARRAY, value, meta);
}

/**
 * Create section descriptor.
 */
export function newSection<T>(value: T, ltxExtend?: string | Array<string>): T {
  if (ltxExtend) {
    value[LTX_EXTEND] = ltxExtend;
  }

  return value;
}
