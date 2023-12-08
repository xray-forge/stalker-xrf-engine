import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { EventsManager } from "@/engine/core/managers/events";
import { register } from "@/engine/extensions/enhanced_items_drop/main";
import { resetRegistry } from "@/fixtures/engine";

describe("enhanced drop", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly change config of drop", () => {
    const eventsManager: EventsManager = getManager(EventsManager);

    expect(eventsManager.getSubscribersCount()).toBe(0);

    register();

    expect(eventsManager.getSubscribersCount()).toBe(3);
  });
});
