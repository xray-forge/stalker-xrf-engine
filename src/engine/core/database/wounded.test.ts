import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { registerWoundedObject, unRegisterWoundedObject } from "@/engine/core/database/wounded";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("database objects utilities", () => {
  it("should correctly register and unregister wounded objects", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    registerWoundedObject(object);
    expect(registry.objectsWounded.get(object.id())).toBe(state);

    unRegisterWoundedObject(object);
    expect(registry.objectsWounded.get(object.id())).toBeNull();
  });
});
