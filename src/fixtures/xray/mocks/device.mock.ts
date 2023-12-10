import { jest } from "@jest/globals";

import { Optional, TCount, TRate, TSize } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mocked game device.
 */
export class MockDevice {
  protected static instance: Optional<MockDevice> = null;

  public static getInstance(): MockDevice {
    if (!MockDevice.instance) {
      MockDevice.instance = new MockDevice();
    }

    return MockDevice.instance;
  }

  public width: TSize = 1920;
  public height: TSize = 1080;
  public fov: TRate = 70;
  public precache_frame: TCount = 0;
  public cam_dir: MockVector = MockVector.create(0.5, 0, 0.5);
  public pause = jest.fn();
}
