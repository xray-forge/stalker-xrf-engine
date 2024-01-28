import { describe, expect, it } from "@jest/globals";

import { HelicopterBinder } from "@/engine/core/binders/helicopter/HelicopterBinder";
import {
  registerHelicopter,
  registerHelicopterEnemy,
  unregisterHelicopter,
  unregisterHelicopterEnemy,
} from "@/engine/core/database/helicopters";
import { registry } from "@/engine/core/database/registry";
import { GameObject, TIndex } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("helicopters module of the database", () => {
  it("should correctly register helicopter binders", () => {
    const helicopter: HelicopterBinder = new HelicopterBinder(MockGameObject.mock());

    registerHelicopter(helicopter);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(helicopter.object.id())).toEqual({ object: helicopter.object });
    expect(registry.helicopter.storage.length()).toBe(1);
    expect(registry.helicopter.storage.get(helicopter.object.id())).toEqual(helicopter.object);

    unregisterHelicopter(helicopter);

    expect(registry.objects.length()).toBe(0);
    expect(registry.helicopter.storage.length()).toBe(0);
  });

  it("should correctly register helicopter enemies", () => {
    const first: GameObject = MockGameObject.mock();
    const firstIndex: TIndex = registerHelicopterEnemy(first);

    expect(firstIndex).toBe(0);
    expect(registry.helicopter.enemyIndex).toBe(1);
    expect(registry.helicopter.enemies.get(firstIndex)).toBe(first);

    const second: GameObject = MockGameObject.mock();
    const secondIndex: TIndex = registerHelicopterEnemy(second);

    expect(secondIndex).toBe(1);
    expect(registry.helicopter.enemyIndex).toBe(2);
    expect(registry.helicopter.enemies.get(secondIndex)).toBe(second);

    unregisterHelicopterEnemy(firstIndex);
    unregisterHelicopterEnemy(secondIndex);

    expect(registry.helicopter.enemyIndex).toBe(2);
    expect(registry.helicopter.enemies.length()).toBe(0);
  });
});
