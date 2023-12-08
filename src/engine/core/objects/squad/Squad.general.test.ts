import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Squad } from "@/engine/core/objects/squad/index";
import { MockSquad, resetRegistry } from "@/fixtures/engine";

describe("Squad server object", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const squad: Squad = MockSquad.mock();

    const onSquadRegister = jest.fn();
    const onSquadUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.SQUAD_REGISTERED, onSquadRegister);
    eventsManager.registerCallback(EGameEvent.SQUAD_UNREGISTERED, onSquadUnregister);

    squad.on_register();

    expect(onSquadRegister).toHaveBeenCalledWith(squad);
    expect(onSquadUnregister).not.toHaveBeenCalled();

    squad.on_unregister();

    expect(onSquadRegister).toHaveBeenCalledWith(squad);
    expect(onSquadUnregister).toHaveBeenCalledWith(squad);
  });
});
