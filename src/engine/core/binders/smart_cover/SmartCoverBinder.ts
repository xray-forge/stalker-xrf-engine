import { LuabindClass, object_binder } from "xray16";

/**
 * Binder class for interception of client-side lifecycle for smart cover objects.
 */
@LuabindClass()
export class SmartCoverBinder extends object_binder {}
