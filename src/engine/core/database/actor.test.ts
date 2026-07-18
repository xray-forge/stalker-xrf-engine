import { afterEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import {
  registerActor,
  registerActorServer,
  unregisterActor,
  unregisterActorServer,
} from "@/engine/core/database/actor";
import { registry } from "@/engine/core/database/registry";
import { Actor } from "@/engine/core/objects/creature";

describe("registerActor", () => {
  afterEach(() => unregisterActor());

  it("should register actor", () => {
    expect(registry.actor).toBeNull();

    const actor: GameObject = MockGameObject.mockActor({ section: "actor" });

    expect(actor.id()).toBe(0);

    registerActor(actor);

    expect(registry.actor).toBe(actor);
    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(0)).toEqual({ object: actor });
  });
});

describe("unregisterActor", () => {
  it("should unregister actor", () => {
    const actor: GameObject = MockGameObject.mockActor({ section: "actor" });

    registerActor(actor);

    unregisterActor();

    expect(registry.actor).toBeNull();
    expect(registry.objects.length()).toBe(0);
  });
});

describe("registerActorServer", () => {
  afterEach(() => unregisterActorServer());

  it("should register actor server", () => {
    expect(registry.actorServer).toBeNull();

    const actor: Actor = new Actor("actor");

    expect(actor.id).toBe(0);

    registerActorServer(actor);

    expect(registry.actorServer).toBe(actor);
  });
});

describe("unregisterActorServer", () => {
  it("should unregister actor server", () => {
    const actor: Actor = new Actor("actor");

    registerActorServer(actor);

    unregisterActorServer();

    expect(registry.actorServer).toBeNull();
  });
});
