import { RenderDevice } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * todo;
 */
export function mockRenderDevice({
  width = 1920,
  height = 1080,
  cam_dir = MockVector.mock(0, 0, 0),
}: Partial<RenderDevice> = {}): RenderDevice {
  return {
    width,
    height,
    cam_dir,
  } as RenderDevice;
}
