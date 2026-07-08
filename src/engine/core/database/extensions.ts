import { assert } from "xray16/lib";
import { $filename } from "xray16/macros";

import { registry } from "@/engine/core/database/registry";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register game mod extension in the registry.
 *
 * @param extension - Extension descriptor to register in the database.
 * @returns Registered extension descriptor.
 */
export function registerExtension(extension: IExtensionsDescriptor): IExtensionsDescriptor {
  assert(extension.name, "Expected extension to have name when registering.");
  assert(extension.module, "Expected extension to have valid lua module object when registering.");
  assert(!registry.extensions.has(extension.name), "Declaring duplicated extension: '%s'.", extension.name);

  logger.info("Register extension: %s", extension.name);

  registry.extensions.set(extension.name, extension);

  return extension;
}

/**
 * Check whether game have any extensions activated.
 *
 * @returns If have at least one extension active.
 */
export function haveExtensions(): boolean {
  return registry.extensions.length() > 0;
}
