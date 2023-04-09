import { beforeEach, describe, expect, it } from "@jest/globals";
import { XR_game_object } from "xray16";

import { registerActor, unregisterActor } from "@/engine/core/database/actor";
import { registry } from "@/engine/core/database/registry";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'actor' module of the database", () => {
  beforeEach(() => {
    registry.objects = new LuaTable();
  });

  it("should correctly register actor", () => {
    expect(registry.actor).toBeNull();

    const actor: XR_game_object = mockClientGameObject({ idOverride: 0, sectionOverride: "actor" });

    expect(actor.id()).toBe(0);

    registerActor(actor);

    expect(registry.actor).toBe(actor);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(0)).toEqual({ object: actor });

    unregisterActor();

    expect(registry.actor).toBeNull();
    expect(registry.objects.length()).toBe(0);
  });
});
