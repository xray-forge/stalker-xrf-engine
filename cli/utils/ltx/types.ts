import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export enum ELtxFieldType {
  STRING,
  INTEGER,
  BOOLEAN,
  FLOAT,
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
  type: ELtxFieldType;
  value: T;
  meta?: ILtxFieldMeta;
}

/**
 * todo;
 */
export interface ILtxConfigDescriptor extends Record<string, Record<string, ILtxFieldDescriptor<unknown>>> {
  [index: symbol]: Record<string, ILtxFieldDescriptor<unknown>>;
}

/**
 * todo;
 */
export const LTX_ROOT: unique symbol = Symbol("LTX_ROOT");
