import { ClientObject } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockObjectBinder extends MockLuabindClass {
  public constructor(public object: ClientObject) {
    super();
  }

  public load(): void {}

  public net_Relcase(): void {}

  public net_destroy(): void {}

  public net_export(): void {}

  public net_import(): void {}

  public net_save_relevant(): boolean {
    return true;
  }

  public net_spawn(): boolean {
    return true;
  }

  public reinit(): void {}

  public reload(): void {}

  public save(): void {}

  public update(): void {}
}
