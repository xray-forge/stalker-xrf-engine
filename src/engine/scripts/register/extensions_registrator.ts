import { registerExtension } from "@/engine/core/database";
import { getAvailableExtensions, IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import {
  loadExtensionsOrder,
  saveExtensionsOrder,
  syncExtensionsOrder,
} from "@/engine/core/utils/extensions/extensions_order";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register extensions to the script engine.
 * Traverse gamedata extensions folder for valid extension modules and try to call register for each one.
 * Save extension load order and try to persist it every time.
 */
export function registerExtensions(): void {
  if (lfs === null) {
    return logger.warn("Skip externals registration, no `lfs` lib available");
  }

  const extensions: LuaArray<IExtensionsDescriptor> = getAvailableExtensions();
  const sortedExtensions: LuaArray<IExtensionsDescriptor> = syncExtensionsOrder(extensions, loadExtensionsOrder());

  if (extensions.length() > 0) {
    logger.info("Registering extensions:", extensions.length());
  } else {
    logger.info("No extensions detected");

    return;
  }

  for (const [, extension] of sortedExtensions) {
    registerExtension(extension);
    extension.module.register();
  }

  logger.info("Saving current extensions order");
  saveExtensionsOrder(sortedExtensions);
}
