import { describe, expect, it, jest } from "@jest/globals";

import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Monster } from "@/engine/core/objects/creature/Monster";

describe("Monster server object", () => {
  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = EventsManager.getInstance();
    const monster: Monster = new Monster("monster");

    const onMonsterRegister = jest.fn();
    const onMonsterUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.MONSTER_REGISTER, onMonsterRegister);
    eventsManager.registerCallback(EGameEvent.MONSTER_UNREGISTER, onMonsterUnregister);

    monster.on_register();

    expect(onMonsterRegister).toHaveBeenCalledWith(monster);
    expect(onMonsterUnregister).not.toHaveBeenCalled();

    monster.on_unregister();

    expect(onMonsterRegister).toHaveBeenCalledWith(monster);
    expect(onMonsterUnregister).toHaveBeenCalledWith(monster);
  });

  it.todo("should correctly handle death callback");

  it.todo("should correctly handle registration event");

  it.todo("should correctly switch online and offline");

  it.todo("should correctly save and load data");
});
