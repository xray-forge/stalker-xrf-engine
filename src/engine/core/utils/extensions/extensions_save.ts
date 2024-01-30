import { registry } from "@/engine/core/database";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { AnyObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * @param extension - description of extension to save data for
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
 * todo
 */
export function loadExtension(extension: IExtensionsDescriptor): void {
  if (extension.module.load) {
    logger.info("Load extension: %s", extension.name);

    const data: AnyObject = registry.dynamicData.extensions[extension.name] ?? {};

    registry.dynamicData.extensions[extension.name] = data;

    extension.module.load(data);
  }
}
