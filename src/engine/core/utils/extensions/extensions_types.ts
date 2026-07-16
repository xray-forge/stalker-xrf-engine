import { AnyObject, Nillable, TName, TPath } from "xray16/lib";

/**
 * Descriptor of possible extension to work with.
 */
export interface IExtensionsDescriptor {
  isEnabled: boolean;
  isAvailable: Nillable<boolean>;
  availabilityReason: Nillable<string>;
  canToggle: boolean;
  path: TPath;
  entry: TPath;
  name: TName;
  module: AnyObject;
}

/**
 * Result of checking whether an extension can run in the current engine.
 */
export interface IExtensionCheckResult {
  enabled: boolean;
  reason?: Nillable<string>;
}
