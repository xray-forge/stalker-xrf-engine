import { ObjectFactory, TClassKey } from "@/engine/lib/types";

/**
 * Mock implementation of game objects factory.
 */
export class MockObjectFactory {
  public registeredClientClasses: Set<string> = new Set();
  public registeredServerClasses: Set<string> = new Set();
  public registeredClassIds: Set<string> = new Set();
  public registeredScriptClassIds: Set<string> = new Set();

  public register(clientObjectClass: string, serverObjectClass: string, clsId: string, scriptClsId: TClassKey): void;
  public register(clientObjectClass: string, clsId: string, scriptClsId: TClassKey): void;
  public register(...args: Array<string>): void {
    this.registeredClientClasses.add(args[0]);

    if (args.length === 4) {
      this.registeredServerClasses.add(args[1]);
      this.registeredClassIds.add(args[2]);
      this.registeredScriptClassIds.add(args[3]);
    } else {
      this.registeredClassIds.add(args[2]);
      this.registeredScriptClassIds.add(args[3]);
    }
  }
}

/**
 * Mock generic object factory.
 */
export function mockObjectFactory(): [ObjectFactory, MockObjectFactory] {
  const factory: MockObjectFactory = new MockObjectFactory();

  return [factory, factory];
}
