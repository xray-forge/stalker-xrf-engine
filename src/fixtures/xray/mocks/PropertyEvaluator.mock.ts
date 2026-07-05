import { GameObject } from "xray16/alias";
import { Nullable, TName } from "xray16/lib";

import { MockPropertyStorage } from "@/fixtures/xray/mocks/actions/property_storage.mock";

/**
 * Mock property storage graph used in AI logics.
 */
export class MockPropertyEvaluator {
  public object!: GameObject;
  public storage!: MockPropertyStorage;
  public __name: TName;

  public constructor(object: Nullable<GameObject> = null, name: TName) {
    this.__name = name || this.constructor.name;
  }

  public setup(object: GameObject, storage: Nullable<MockPropertyStorage> = null): void {
    this.object = object;
    this.storage = storage as MockPropertyStorage;
  }
}
