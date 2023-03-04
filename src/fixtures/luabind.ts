import { jest } from "@jest/globals";
import type { XR_EngineBinding } from "xray16";

interface IXR_EngineBinding {
  __name: string;
  __init: () => void;
  __finalize: () => void;
  __call: (...args: Array<any>) => void;
  __tostring: () => string;
}

export function mockLuabindBase({
  __name = "EngineBindingTest",
  __init = jest.fn(),
  __finalize = jest.fn(),
  __call = jest.fn(),
  __tostring = jest.fn(() => "TestBaseToString"),
}: Partial<XR_EngineBinding> = {}): IXR_EngineBinding {
  return {
    __name,
    __init,
    __finalize,
    __call,
    __tostring,
  };
}
