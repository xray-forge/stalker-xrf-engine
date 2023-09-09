import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { SaveManager } from "@/engine/core/managers/base/SaveManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import { Actor } from "@/engine/core/objects/server/creature/Actor";
import { ServerObject } from "@/engine/lib/types";
import { EPacketDataType, mockNetPacket, MockNetProcessor, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("Actor server object", () => {
  beforeEach(() => {
    jest.spyOn(SimulationBoardManager.getInstance(), "onActorRegister").mockImplementation(jest.fn);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const actor: Actor = new Actor("actor");

    const onActorRegister = jest.fn();
    const onActorUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.ACTOR_REGISTER, onActorRegister);
    eventsManager.registerCallback(EGameEvent.ACTOR_UNREGISTER, onActorUnregister);

    actor.on_register();

    expect(onActorRegister).toHaveBeenCalledWith(actor);
    expect(onActorUnregister).not.toHaveBeenCalled();

    actor.on_unregister();

    expect(onActorRegister).toHaveBeenCalledWith(actor);
    expect(onActorUnregister).toHaveBeenCalledWith(actor);
  });

  it("should correctly emit death events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const actor: Actor = new Actor("actor");
    const killer: ServerObject = mockServerAlifeHumanStalker();

    const onActorDeath = jest.fn();

    eventsManager.registerCallback(EGameEvent.ACTOR_DEATH, onActorDeath);

    actor.on_death(killer);

    expect(onActorDeath).toHaveBeenCalledWith(actor, killer);
  });

  it("should correctly handle save-load in appropriate manager", () => {
    const saveManager: SaveManager = SaveManager.getInstance();
    const actor: Actor = new Actor("actor");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    jest.spyOn(saveManager, "serverSave").mockImplementation(jest.fn());
    jest.spyOn(saveManager, "serverLoad").mockImplementation(jest.fn());

    actor.STATE_Write(mockNetPacket(netProcessor));

    expect(saveManager.serverSave).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual([0]);

    actor.STATE_Read(mockNetPacket(netProcessor), 1);

    expect(saveManager.serverLoad).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it.todo("should correctly generate alife task");

  it.todo("should correctly check simulation availability");

  it.todo("should correctly check if available simulation squad target");

  it.todo("should correctly handle simulation callbacks");
});
