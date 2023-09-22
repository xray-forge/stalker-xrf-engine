import { describe, expect, it } from "@jest/globals";

import { isWideScreen } from "@/engine/core/utils/ui/ui_screen";
import { MockDevice } from "@/fixtures/xray";

describe("ui_screen utils", () => {
  it("isWideScreen should correctly check whether game is in wide screen mode", () => {
    expect(isWideScreen()).toBe(true);

    const device: MockDevice = MockDevice.getInstance();

    device.width = 1024;
    device.height = 768;

    expect(isWideScreen()).toBe(false);

    device.width = 640;
    device.height = 480;

    expect(isWideScreen()).toBe(false);

    device.width = 2048;
    device.height = 1536;

    expect(isWideScreen()).toBe(false);

    device.width = 1024;
    device.height = 540;

    expect(isWideScreen()).toBe(true);

    device.width = 2560;
    device.height = 1440;

    expect(isWideScreen()).toBe(true);

    device.width = 3840;
    device.height = 2160;

    expect(isWideScreen()).toBe(true);

    device.width = 1920;
    device.height = 1080;

    expect(isWideScreen()).toBe(true);
  });
});
