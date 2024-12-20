import { registry } from "@/engine/core/database";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Handle save event for provided extension.
 * Save data in registry dynamic storage for future serialization and storing with lua `marshal` lib.
 *
 * @param extension - descriptor of extension to save data for
 */
export function saveExtension(extension: IExtensionsDescriptor): void {
  if (extension.module.save) {
    logger.info("Save extension: %s", extension.name);

    const data: AnyObject = registry.dynamicData.extensions[extension.name] ?? {};

    registry.dynamicData.extensions[extension.name] = data;

    extension.module.save(data);
  }
}

/**
 * Handle load event for provided extension.
 * Load data into registry dynamic storage and deserialize it with lua `marshal` lib.
 *
 * @param extension - descriptor of extension to load data for
 */
export function loadExtension(extension: IExtensionsDescriptor): void {
  if (extension.module.load) {
    logger.info("Load extension: %s", extension.name);

    const data: AnyObject = registry.dynamicData.extensions[extension.name] ?? {};

    registry.dynamicData.extensions[extension.name] = data;

    extension.module.load(data);
  }
}
