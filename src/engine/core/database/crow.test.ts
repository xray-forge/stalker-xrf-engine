import { describe, expect, it } from "@jest/globals";

import { registerCrow, unregisterCrow } from "@/engine/core/database/crow";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { GameObject } from "@/engine/lib/types";
import { mockGameObject } from "@/fixtures/xray";

describe("database crow objects utilities", () => {
  it("should correctly register and unregister crow objects", () => {
    const first: GameObject = mockGameObject();
    const second: GameObject = mockGameObject();

    const firstState: IRegistryObjectState = registerCrow(first);

    expect(registry.crows.count).toBe(1);
    expect(registry.crows.storage.length()).toBe(1);
    expect(registry.crows.storage.get(first.id())).toBe(first.id());
    expect(firstState).toBe(registry.objects.get(first.id()));

    const secondState: IRegistryObjectState = registerCrow(second);

    expect(registry.crows.count).toBe(2);
    expect(registry.crows.storage.length()).toBe(2);
    expect(registry.crows.storage.get(second.id())).toBe(second.id());
    expect(secondState).toBe(registry.objects.get(second.id()));

    unregisterCrow(first);

    expect(registry.crows.count).toBe(1);
    expect(registry.crows.storage.length()).toBe(1);
    expect(registry.objects.length()).toBe(1);

    unregisterCrow(first);

    expect(registry.crows.count).toBe(1);
    expect(registry.crows.storage.length()).toBe(1);
    expect(registry.objects.length()).toBe(1);

    unregisterCrow(first);
    unregisterCrow(second);

    expect(registry.crows.count).toBe(0);
    expect(registry.crows.storage.length()).toBe(0);
    expect(registry.objects.length()).toBe(0);
  });
});
