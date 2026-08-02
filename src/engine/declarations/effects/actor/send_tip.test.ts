import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { NotificationManager } from "@/engine/core/managers/notifications";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/send_tip");
});

beforeEach(() => {
  resetRegistry();
});

describe("send_tip", () => {
  it("should send notifications for actor", () => {
    const manager: NotificationManager = getManager(NotificationManager);

    jest.spyOn(manager, "sendTipNotification").mockImplementation(jest.fn());

    expect(() => callXrEffect("send_tip", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Expected caption to be provided for sent_tip effect."
    );

    callXrEffect(
      "send_tip",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-caption",
      "test-icon",
      "test-sender"
    );

    expect(manager.sendTipNotification).toHaveBeenCalledTimes(1);
    expect(manager.sendTipNotification).toHaveBeenCalledWith("test-caption", "test-icon", 0, null, "test-sender");
  });
});
