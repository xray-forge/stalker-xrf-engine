import { describe, expect, it, jest } from "@jest/globals";

import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SmartCover } from "@/engine/core/objects/server/smart_cover";

describe("SmartCover server object", () => {
  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const smartCover: SmartCover = new SmartCover("monster");

    const onSmartCoverRegister = jest.fn();
    const onSmartCoverUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.SMART_COVER_REGISTER, onSmartCoverRegister);
    eventsManager.registerCallback(EGameEvent.SMART_COVER_UNREGISTER, onSmartCoverUnregister);

    smartCover.on_register();

    expect(onSmartCoverRegister).toHaveBeenCalledWith(smartCover);
    expect(onSmartCoverUnregister).not.toHaveBeenCalled();

    smartCover.on_unregister();

    expect(onSmartCoverRegister).toHaveBeenCalledWith(smartCover);
    expect(onSmartCoverUnregister).toHaveBeenCalledWith(smartCover);
  });

  it.todo("should handle registration events");

  it.todo("should correctly fill props");

  it.todo("should correctly save and load data");
});
