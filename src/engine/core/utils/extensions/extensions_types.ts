import { AnyObject, TName, TPath } from "@/engine/lib/types";

/**
 * Descriptor of possible extension to work with.
 */
export interface IExtensionsDescriptor {
  isEnabled: boolean;
  path: TPath;
  entry: TPath;
  name: TName;
  module: AnyObject;
}
