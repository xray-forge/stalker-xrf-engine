import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerObject } from "xray16/alias";
import { MockAlifeObject, MockGameObject } from "xray16/mocks";

import { getManager, registerSimulator, registry } from "@/engine/core/database";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/remove_item");
});

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

describe("remove_item", () => {
  it("should release items from actor inventory", () => {
    const notificationManager: NotificationManager = getManager(NotificationManager);
    const item: GameObject = MockGameObject.mock({ section: "test_section" });
    const serverItem: ServerObject = MockAlifeObject.mock({ id: item.id() });
    const { actorGameObject } = mockRegisteredActor({ inventory: [["test_section", item]] });

    jest.spyOn(notificationManager, "sendItemRelocatedNotification").mockImplementation(jest.fn());

    expect(() => callXrEffect("remove_item", actorGameObject, MockGameObject.mock())).toThrow(
      "Wrong parameters in function 'remove_item'."
    );
    expect(() => callXrEffect("remove_item", actorGameObject, MockGameObject.mock(), "not_existing")).toThrow(
      "Actor has no item to remove with section 'not_existing'."
    );

    callXrEffect("remove_item", actorGameObject, MockGameObject.mock(), "test_section");

    expect(registry.simulator.release).toHaveBeenCalledTimes(1);
    expect(registry.simulator.release).toHaveBeenCalledWith(serverItem, true);
    expect(notificationManager.sendItemRelocatedNotification).toHaveBeenCalledTimes(1);
    expect(notificationManager.sendItemRelocatedNotification).toHaveBeenCalledWith(
      ENotificationDirection.OUT,
      "test_section"
    );
  });
});
