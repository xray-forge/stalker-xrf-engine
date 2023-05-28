import { Optional } from "#/utils";

/**
 * todo;
 */
export type TPrimitive = string | number | boolean | symbol | Array<TPrimitive>;

/**
 * todo;
 */
export enum ELtxFieldType {
  STRING,
  INTEGER,
  BOOLEAN,
  FLOAT,
  CONDLIST,
  STRING_ARRAY,
  INTEGER_ARRAY,
  FLOAT_ARRAY,
}

/**
 * todo;
 */
export interface ILtxFieldMeta {
  comment?: Optional<string>;
  isBinding?: boolean;
}

/**
 * todo;
 */
export interface ILtxFieldDescriptor<T> {
  $isField: boolean;
  type: ELtxFieldType;
  value: T;
  meta?: ILtxFieldMeta;
}

/**
 * todo;
 */
export interface ILtxConfigDescriptor
  extends Record<
    string,
    ILtxConfigDescriptor | Record<string, ILtxFieldDescriptor<unknown> | TPrimitive> | TPrimitive
  > {
  [index: symbol]: Record<string, ILtxFieldDescriptor<unknown> | TPrimitive> | TPrimitive;
}

/**
 * todo;
 */
export const LTX_ROOT: unique symbol = Symbol("LTX_ROOT");

/**
 * todo;
 */
export const LTX_EXTEND: unique symbol = Symbol("LTX_EXTEND");

/**
 * todo;
 */
export const LTX_INCLUDE: unique symbol = Symbol("LTX_INCLUDE");

/**
 * todo;
 */
export interface IConditionListDescriptor {
  condition?: Array<string>;
  action?: Array<string>;
  value?: string | number | boolean;
}
