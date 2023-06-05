/**
 * Descriptor of callback parameter.
 */
export interface IExternCallbackParameterDescriptor {
  parameterName?: string;
  parameterTypeName?: string;
}

/**
 * Descriptor of externalized function for usage in configs/scripts.
 */
export interface IExternFunction {
  file: string;
  name: string;
  parameters: Array<IExternCallbackParameterDescriptor>;
  doc: string;
}

/**
 * Descriptor of file externalized methods.
 */
export interface IExternFileDescriptor {
  file: string;
  extern: Array<IExternFunction>;
}
