/**
 * Mock abstraction for luabind classes.
 * Handles wrapper around __name of luabind classes injected with custom transformer.
 */
export class MockLuabindClass {
  public static get __name(): string {
    return this.name;
  }

  public get __name(): string {
    return this.constructor.name;
  }
}
