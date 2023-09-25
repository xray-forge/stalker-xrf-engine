import type { EngineBinding } from "xray16";

/**
 * todo;
 */
interface IXR_EngineBinding {
  __name: string;
}

/**
 * Mock abstraction for luabind classes.
 */
export class MockLuabindClass {
  public static get __name(): string {
    return this.name;
  }

  public get __name(): string {
    return this.constructor.name;
  }
}

/**
 * todo;
 */
export function mockLuabindBase({ __name = "EngineBindingTest" }: Partial<EngineBinding> = {}): IXR_EngineBinding {
  return {
    __name,
  };
}
