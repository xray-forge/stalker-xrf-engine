import { describe, expect, it, jest } from "@jest/globals";

import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Stalker } from "@/engine/core/objects/server/creature/Stalker";

describe("Stalker server object", () => {
  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const stalker: Stalker = new Stalker("stalker");

    const onStalkerRegister = jest.fn();
    const onStalkerUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.STALKER_REGISTER, onStalkerRegister);
    eventsManager.registerCallback(EGameEvent.STALKER_UNREGISTER, onStalkerUnregister);

    stalker.on_register();

    expect(onStalkerRegister).toHaveBeenCalledWith(stalker);
    expect(onStalkerUnregister).not.toHaveBeenCalled();

    stalker.on_unregister();

    expect(onStalkerRegister).toHaveBeenCalledWith(stalker);
    expect(onStalkerUnregister).toHaveBeenCalledWith(stalker);
  });

  it.todo("should correctly handle death callback");

  it.todo("should correctly handle registration event");

  it.todo("should correctly switch online and offline");

  it.todo("should correctly save and load data");

  it.todo("should correctly overwrite current vertex only if it is not null on load");
});
