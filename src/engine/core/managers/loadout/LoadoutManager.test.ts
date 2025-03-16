import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { LoadoutManager } from "@/engine/core/managers/loadout/LoadoutManager";
import { ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject } from "@/fixtures/xray";

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
