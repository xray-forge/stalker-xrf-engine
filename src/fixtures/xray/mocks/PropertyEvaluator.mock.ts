import { ClientObject, Optional, TName } from "@/engine/lib/types";
import { MockPropertyStorage } from "@/fixtures/xray/mocks/actions/property_storage.mock";

/**
 * Mock property storage graph used in AI logics.
 */
export class MockPropertyEvaluator {
  public object!: ClientObject;
  public storage!: MockPropertyStorage;
  public __name: TName;

  public constructor(object: Optional<ClientObject> = null, name: TName) {
    this.__name = name || this.constructor.name;
  }

  public setup(object: ClientObject, storage: Optional<MockPropertyStorage> = null): void {
    this.object = object;
    this.storage = storage as MockPropertyStorage;
  }
}
