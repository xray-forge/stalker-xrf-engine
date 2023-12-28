import { beforeEach, describe, expect, it } from "@jest/globals";

import { disposeManager, getManager } from "@/engine/core/database";
import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs/dialog_types";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { DialogManager } from "@/engine/core/managers/dialogs/DialogManager";
import { fillPriorityTable } from "@/engine/core/managers/dialogs/utils/dialog_priority";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { EPacketDataType, MockGameObject, MockNetProcessor } from "@/fixtures/xray";

describe("DialogManager class", () => {
  beforeEach(() => {
    resetRegistry();

    dialogConfig.ACTIVE_SPEAKER = null;
  });

  it("should correctly initialize and destroy", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    getManager(DialogManager);

    expect(eventsManager.getSubscribersCount()).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.STALKER_INTERACTION)).toBe(1);

    disposeManager(DialogManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly save and load dialogs for objects with default state", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DialogManager = getManager(DialogManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    manager.saveObjectDialogs(object, netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([false, false, false, false, false, 5]);

    disposeManager(DialogManager);

    const another: DialogManager = getManager(DialogManager);

    another.loadObjectDialogs(object, netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toEqual([]);
  });

  it("should correctly save and load dialogs for objects with updated state", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DialogManager = getManager(DialogManager);
    const netProcessor: MockNetProcessor = new MockNetProcessor();

    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      manager.priorityTable.get(EGenericPhraseCategory.HELLO)
    );

    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      manager.priorityTable.get(EGenericPhraseCategory.INFORMATION)
    );

    manager.saveObjectDialogs(object, netProcessor.asMockNetPacket());

    expect(netProcessor.writeDataOrder).toEqual([
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.BOOLEAN,
      EPacketDataType.U16,
    ]);
    expect(netProcessor.dataList).toEqual([true, false, false, false, true, 5]);

    disposeManager(DialogManager);

    const another: DialogManager = getManager(DialogManager);

    another.loadObjectDialogs(object, netProcessor.asMockNetProcessor());

    expect(netProcessor.readDataOrder).toEqual(netProcessor.writeDataOrder);
    expect(netProcessor.dataList).toEqual([]);
  });

  it("should correctly check if phrase categories are told already", () => {
    const manager: DialogManager = getManager(DialogManager);
    const object: GameObject = MockGameObject.mock();

    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      manager.priorityTable.get(EGenericPhraseCategory.INFORMATION)
    );

    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES)
    );

    expect(manager.isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.ANOMALIES)).toBe(false);
    expect(manager.isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.INFORMATION)).toBe(false);
    expect(manager.isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.PLACE)).toBe(false);

    manager.priorityTable.get(EGenericPhraseCategory.INFORMATION).get(object.id()).told = true;
    manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).told = true;

    expect(manager.isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.ANOMALIES)).toBe(true);
    expect(manager.isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.INFORMATION)).toBe(true);
    expect(manager.isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.PLACE)).toBe(false);
  });

  it("should correctly disable/reset phrases", () => {
    const manager: DialogManager = getManager(DialogManager);
    const object: GameObject = MockGameObject.mock();

    expect(manager.disabledPhrases.length()).toBe(0);

    manager.disableObjectPhrase(object.id(), "test");

    expect(manager.disabledPhrases.length()).toBe(1);
    expect(manager.disabledPhrases.get(object.id())).toEqualLuaTables({ test: true });

    manager.resetObjectPhrases(object.id());

    expect(manager.disabledPhrases.length()).toBe(0);
  });

  it("should correctly handle object interactions", () => {
    const manager: DialogManager = getManager(DialogManager);
    const object: GameObject = MockGameObject.mock();

    manager.onInteractWithObject(object);

    expect(dialogConfig.ACTIVE_SPEAKER).toBe(object);
  });
});
