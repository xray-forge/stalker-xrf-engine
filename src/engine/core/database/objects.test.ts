import { describe, expect, it } from "@jest/globals";

import { registerObject, resetObject, unregisterObject } from "@/engine/core/database/objects";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { ClientGameObject } from "@/engine/lib/types";
import { mockClientGameObject, MockIniFile } from "@/fixtures/xray";

describe("database objects utilities", () => {
  it("should correctly register, reset and unregister objects", () => {
    const object: ClientGameObject = mockClientGameObject();
    const mockIni: MockIniFile<{ a: number }> = new MockIniFile("test.ltx", { a: 1 });

    const state: IRegistryObjectState = registerObject(object);

    state.ini = mockIni.asMock();
    expect(registry.objects.get(object.id())).toEqual({ object, ini: mockIni });

    resetObject(object);
    expect(registry.objects.get(object.id())).toEqual({ object });

    unregisterObject(object);
    expect(registry.objects.get(object.id())).toBeNull();
  });
});
