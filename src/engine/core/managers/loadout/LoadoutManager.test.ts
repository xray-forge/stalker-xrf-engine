import { beforeEach, describe, expect, it } from "@jest/globals";
import { ServerObject } from "xray16/alias";
import { MockAlifeObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { LoadoutManager } from "@/engine/core/managers/loadout/LoadoutManager";
import { resetRegistry } from "@/fixtures/engine";

describe("LoadoutManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly handle loadout generation event", () => {
    const manager: LoadoutManager = getManager(LoadoutManager);
    const object: ServerObject = MockAlifeObject.mock();

    expect(manager.onGenerateServerObjectLoadout(object, object.id, "[test]")).toBe(false);
  });
});
