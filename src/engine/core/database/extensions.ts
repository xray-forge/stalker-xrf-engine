import { registry } from "@/engine/core/database/registry";
import { assert } from "@/engine/core/utils/assertion";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register game mod extension in the registry.
 *
 * @param extension - extension descriptor to register in the database
 * @returns registered extension descriptor
 */
export function registerExtension(extension: IExtensionsDescriptor): IExtensionsDescriptor {
  assert(extension.name, "Expected extension to have name when registering.");
  assert(extension.module, "Expected extension to have valid lua module object when registering.");
  assert(!registry.extensions.has(extension.name), "Declaring duplicated extension: '%s'.", extension.name);

  logger.info("Register extension:", extension.name);

  registry.extensions.set(extension.name, extension);

  return extension;
}

/**
 * Check whether game have any extensions activated.
 *
 * @returns if have at least one extension active
 */
export function haveExtensions(): boolean {
  return registry.extensions.length() > 0;
}
