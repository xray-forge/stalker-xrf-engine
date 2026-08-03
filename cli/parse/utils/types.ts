/**
 * Descriptor of callback parameter.
 */
export interface IExternCallbackParameterDescriptor {
  parameterName: string;
  parameterTypeName: string;
  optional?: boolean;
  doc?: string;
}

export interface IExternDocumentation {
  description?: string;
  returns?: string;
}

/**
 * Descriptor of an externalized callable or value for usage in configs/scripts.
 */
export interface IExternFunction {
  file: string;
  name: string;
  parameters?: Array<IExternCallbackParameterDescriptor>;
  returnTypeName?: string;
  typeName?: string;
  documentation?: IExternDocumentation;
  doc: string;
}

/**
 * Descriptor of file externalized methods.
 */
export interface IExternFileDescriptor {
  file: string;
  extern: Array<IExternFunction>;
}
