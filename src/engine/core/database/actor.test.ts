import { describe, expect, it } from "@jest/globals";

import {
  registerActor,
  registerActorServer,
  unregisterActor,
  unregisterActorServer,
} from "@/engine/core/database/actor";
import { registry } from "@/engine/core/database/registry";
import { Actor } from "@/engine/core/objects/creature";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("actor module of the database", () => {
  it("should correctly register actor", () => {
    expect(registry.actor).toBeNull();

    const actor: GameObject = MockGameObject.mock({ idOverride: 0, sectionOverride: "actor" });

    expect(actor.id()).toBe(0);

    registerActor(actor);

    expect(registry.actor).toBe(actor);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(0)).toEqual({ object: actor });

    unregisterActor();

    expect(registry.actor).toBeNull();
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly register actor server", () => {
    expect(registry.actor).toBeNull();

    const actor: Actor = new Actor("actor");

    expect(actor.id).toBe(0);

    registerActorServer(actor);

    expect(registry.actorServer).toBe(actor);

    unregisterActorServer();

    expect(registry.actorServer).toBeNull();
  });
});
