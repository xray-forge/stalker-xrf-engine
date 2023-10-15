import { device } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { RenderDevice } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether game is in wide screen mode right now.
 *
 * @returns whether game resolution is wide screen
 */
export function isWideScreen(): boolean {
  const renderDevice: RenderDevice = device();

  return renderDevice.width / renderDevice.height > 1024 / 768 + 0.01;
}
