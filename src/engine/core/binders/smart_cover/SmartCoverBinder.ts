import { LuabindClass, object_binder } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder class for interception of client-side lifecycle for smart cover objects.
 */
@LuabindClass()
export class SmartCoverBinder extends object_binder {}
