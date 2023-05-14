import { describe, expect, it } from "@jest/globals";

import { registerDoor, unregisterDoor } from "@/engine/core/database/doors";
import { registry } from "@/engine/core/database/registry";
import { LabX8DoorBinder } from "@/engine/core/objects";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'doors' module of the database", () => {
  it("should correctly register doors", () => {
    const door: LabX8DoorBinder = new LabX8DoorBinder(mockClientGameObject());

    registerDoor(door);

    expect(registry.objects.length()).toBe(1);
    expect(registry.objects.get(door.object.id())).toEqual({ object: door.object });
    expect(registry.doors.length()).toBe(1);
    expect(registry.doors.get(door.object.name())).toEqual(door);

    unregisterDoor(door);

    expect(registry.objects.length()).toBe(0);
    expect(registry.doors.length()).toBe(0);
  });
});
