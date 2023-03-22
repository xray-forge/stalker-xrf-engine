import { XR_render_device } from "xray16";

/**
 * todo;
 */
export function mockRenderDevice({ width = 1920, height = 1080 }: Partial<XR_render_device> = {}): XR_render_device {
  return {
    width,
    height,
  } as XR_render_device;
}
