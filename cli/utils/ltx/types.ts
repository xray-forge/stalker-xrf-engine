import { Optional } from "@/mod/lib/types";

/**
 * todo;
 */
export enum ELtxFieldType {
  EMPTY,
  STRING,
  IDENTIFIER,
  INTEGER,
  BOOLEAN,
  FLOAT,
  IDENTIFIER_ARRAY,
  STRING_ARRAY,
  INTEGER_ARRAY,
  FLOAT_ARRAY,
}

/**
 * todo;
 */
export interface ILtxFieldMeta {
  comment?: Optional<string>;
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
export interface ILtxConfigDescriptor extends Record<string, Record<string, ILtxFieldDescriptor<unknown>>> {}
