import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SaveManager } from "@/engine/core/managers/save/SaveManager";
import { Actor } from "@/engine/core/objects/creature/Actor";
import { ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockAlifeHumanStalker, MockNetProcessor } from "@/fixtures/xray";

describe("Actor server object", () => {
  beforeEach(() => {
    resetRegistry();
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
    const manager: SaveManager = getManager(SaveManager);
    const actor: Actor = new Actor("actor");
    const processor: MockNetProcessor = new MockNetProcessor();

    jest.spyOn(manager, "serverSave").mockImplementation(jest.fn());
    jest.spyOn(manager, "serverLoad").mockImplementation(jest.fn());

    actor.STATE_Write(processor.asNetPacket());

    expect(manager.serverSave).toHaveBeenCalledWith(processor);
    expect(processor.writeDataOrder).toEqual([EPacketDataType.STRING, EPacketDataType.U16]);
    expect(processor.dataList).toEqual(["state_write_from_Actor", 0]);

    actor.STATE_Read(processor.asNetPacket(), 0);

    expect(manager.serverLoad).toHaveBeenCalledWith(processor);
    expect(processor.readDataOrder).toEqual(processor.writeDataOrder);
    expect(processor.dataList).toHaveLength(0);
  });

  it.todo("should correctly generate alife task");

  it.todo("should correctly check simulation availability");

  it.todo("should correctly check if available simulation squad target");

  it.todo("should correctly handle simulation callbacks");
});
