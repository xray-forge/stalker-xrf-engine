/**
 * todo;
 */
export interface IExternCallbackDescriptor {
  parameterName?: string;
  parameterTypeName?: string;
}

/**
 * todo;
 */
export interface IExternFunction {
  file: string;
  name: string;
  parameters: Array<IExternCallbackDescriptor>;
  doc: string;
}

/**
 * todo;
 */
export interface IExternFileDescriptor {
  file: string;
  extern: Array<IExternFunction>;
}
