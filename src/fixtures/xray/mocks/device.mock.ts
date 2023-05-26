import { render_device } from "xray16";

import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * todo;
 */
export function mockRenderDevice({
  width = 1920,
  height = 1080,
  cam_dir = MockVector.mock(0, 0, 0),
}: Partial<render_device> = {}): render_device {
  return {
    width,
    height,
    cam_dir,
  } as render_device;
}
