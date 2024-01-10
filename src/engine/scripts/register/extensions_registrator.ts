import { registerExtension } from "@/engine/core/database";
import { getAvailableExtensions, IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import {
  loadExtensionsState,
  saveExtensionsState,
  syncExtensionsState,
} from "@/engine/core/utils/extensions/extensions_state";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyCallablesModule, LuaArray } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register extensions to the script engine.
 * Traverse gamedata extensions folder for valid extension modules and try to call register for each one.
 * Save extension load order and try to persist it every time.
 */
export function registerExtensions(isNewGame: boolean): void {
  if (lfs === null) {
    return logger.format("Skip externals registration, no `lfs` lib available");
  }

  const extensions: LuaArray<IExtensionsDescriptor> = getAvailableExtensions();
  const sortedExtensions: LuaArray<IExtensionsDescriptor> = syncExtensionsState(extensions, loadExtensionsState());

  if (extensions.length() === 0) {
    logger.format("No extensions detected");

    return;
  } else {
    logger.format("Registering extensions: %s", extensions.length());
  }

  for (const [, extension] of sortedExtensions) {
    if (extension.isEnabled) {
      registerExtension(extension);
      (extension.module as AnyCallablesModule).register(isNewGame, extension);
    } else {
      (extension.module as AnyCallablesModule)?.unregister?.(isNewGame, extension);
    }
  }

  logger.format("Saving current extensions order");
  saveExtensionsState(sortedExtensions);
}
