import { object_factory, TXR_class_key } from "xray16";

/**
 * todo;
 */
export class MockObjectFactory {
  public registeredClientClasses: Set<string> = new Set();
  public registeredServerClasses: Set<string> = new Set();
  public registeredClassIds: Set<string> = new Set();
  public registeredScriptClassIds: Set<string> = new Set();

  public register(
    client_object_class: string,
    server_object_class: string,
    clsid: string,
    script_clsid: TXR_class_key
  ): void;
  public register(client_object_class: string, clsid: string, script_clsid: TXR_class_key): void;
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
 * todo;
 */
export function mockObjectFactory(): [object_factory, MockObjectFactory] {
  const factory: MockObjectFactory = new MockObjectFactory();

  return [factory, factory];
}
