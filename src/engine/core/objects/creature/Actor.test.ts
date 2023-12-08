import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SaveManager } from "@/engine/core/managers/save/SaveManager";
import { SimulationManager } from "@/engine/core/managers/simulation";
import { Actor } from "@/engine/core/objects/creature/Actor";
import { ServerObject } from "@/engine/lib/types";
import { EPacketDataType, MockAlifeHumanStalker, mockNetPacket, MockNetProcessor } from "@/fixtures/xray";

describe("Actor server object", () => {
  beforeEach(() => {
    jest.spyOn(getManager(SimulationManager), "onActorRegister").mockImplementation(jest.fn);
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
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
    const eventsManager: EventsManager = getManager(EventsManager);
    const actor: Actor = new Actor("actor");
    const killer: ServerObject = MockAlifeHumanStalker.mock();

    const onActorDeath = jest.fn();

    eventsManager.registerCallback(EGameEvent.ACTOR_DEATH, onActorDeath);

    actor.on_death(killer);

    expect(onActorDeath).toHaveBeenCalledWith(actor, killer);
  });

  it("should correctly handle save-load in appropriate manager", () => {
    const saveManager: SaveManager = getManager(SaveManager);
    const actor: Actor = new Actor("actor");
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    jest.spyOn(saveManager, "serverSave").mockImplementation(jest.fn());
    jest.spyOn(saveManager, "serverLoad").mockImplementation(jest.fn());

    actor.STATE_Write(mockNetPacket(netProcessor));

    expect(saveManager.serverSave).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.writeDataOrder).toEqual([EPacketDataType.STRING, EPacketDataType.U16]);
    expect(netProcessor.dataList).toEqual(["Actor", 0]);

    actor.STATE_Read(mockNetPacket(netProcessor), 0);

    expect(saveManager.serverLoad).toHaveBeenCalledWith(netProcessor);
    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toHaveLength(0);
  });

  it.todo("should correctly generate alife task");

  it.todo("should correctly check simulation availability");

  it.todo("should correctly check if available simulation squad target");

  it.todo("should correctly handle simulation callbacks");
});
