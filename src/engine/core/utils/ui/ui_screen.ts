import { device } from "xray16";
import { RenderDevice } from "xray16/alias";

/**
 * Check whether game is in wide screen mode right now.
 *
 * @returns Whether game resolution is wide screen.
 */
export function isWideScreen(): boolean {
  const renderDevice: RenderDevice = device();

  return renderDevice.width / renderDevice.height > 1024 / 768 + 0.01;
}
