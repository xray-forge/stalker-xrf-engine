import { describe, expect, it } from "@jest/globals";

import { IDynamicObjectState, IRegistryObjectState } from "@/engine/core/database/database_types";
import {
  getObjectDynamicState,
  registerObject,
  registerObjectDynamicState,
  resetObject,
  unregisterObject,
  unregisterObjectDynamicState,
} from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject, MockIniFile } from "@/fixtures/xray";

describe("database objects utilities", () => {
  it("should correctly register, reset and unregister objects", () => {
    const object: ClientObject = mockClientGameObject();
    const mockIni: MockIniFile<{ a: number }> = new MockIniFile("test.ltx", { a: 1 });
    const state: IRegistryObjectState = registerObject(object);

    state.ini = mockIni.asMock();
    expect(registry.objects.get(object.id())).toEqual({ object, ini: mockIni });

    resetObject(object);
    expect(registry.objects.get(object.id())).toEqual({ object });

    unregisterObject(object);
    expect(registry.objects.get(object.id())).toBeNull();
  });

  it("should correctly register, get and unregister dynamic state for objects", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IDynamicObjectState = registerObjectDynamicState(object.id());

    expect(registry.dynamicData.objects.get(object.id())).toEqual({});
    expect(registry.dynamicData.objects.get(object.id())).toBe(state);
    expect(getObjectDynamicState(object.id())).toBe(state);

    unregisterObjectDynamicState(object.id());
    expect(getObjectDynamicState(object.id())).toBeNull();
    expect(registry.dynamicData.objects.get(object.id())).toBeNull();

    expect(getObjectDynamicState(object.id(), true)).toEqual({});
  });
});
