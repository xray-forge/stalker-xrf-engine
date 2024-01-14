import { GameObject, ObjectBinder } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";
import { MockNetProcessor } from "@/fixtures/xray/mocks/save";

/**
 * Mocking binder object that wraps client objects lifecycle.
 */
export class MockObjectBinder extends MockLuabindClass {
  public static asMock(binder: ObjectBinder): MockObjectBinder {
    return binder as unknown as MockObjectBinder;
  }

  public canSpawn: boolean = true;

  public constructor(public object: GameObject) {
    super();
  }

  public net_Relcase(): void {}

  public net_destroy(): void {}

  public net_export(): void {}

  public net_import(): void {}

  public net_save_relevant(): boolean {
    return false;
  }

  public net_spawn(): boolean {
    return this.canSpawn;
  }

  public reinit(): void {}

  public reload(): void {}

  public save(packet: MockNetProcessor): void {
    packet.w_stringZ("save_from_" + this.constructor.name);
  }

  public load(packet: MockNetProcessor): void {
    packet.r_stringZ();
  }

  public update(): void {}
}
