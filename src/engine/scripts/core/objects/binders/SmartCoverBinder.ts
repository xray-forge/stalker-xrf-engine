import { LuabindClass, object_binder } from "xray16";

import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class SmartCoverBinder extends object_binder {}
