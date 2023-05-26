import { jest } from "@jest/globals";
import type { EngineBinding } from "xray16";

/**
 * todo;
 */
interface IXR_EngineBinding {
  __name: string;
  __init: () => void;
  __finalize: () => void;
  __call: (...args: Array<any>) => void;
  __tostring: () => string;
}

/**
 * Mock abstraction for luabind classes.
 */
export class MockLuabindClass {
  public static get __name(): string {
    return this.name;
  }
}

/**
 * todo;
 */
export function mockLuabindBase({
  __name = "EngineBindingTest",
  __init = jest.fn(),
  __finalize = jest.fn(),
  __call = jest.fn(),
  __tostring = jest.fn(() => "TestBaseToString"),
}: Partial<EngineBinding> = {}): IXR_EngineBinding {
  return {
    __name,
    __init,
    __finalize,
    __call,
    __tostring,
  };
}
