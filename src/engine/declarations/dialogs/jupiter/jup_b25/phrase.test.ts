import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ACTOR_ID, AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { registry } from "@/engine/core/database";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

beforeAll(() => {
  require("@/engine/declarations/effects/game/inc_counter");
  require("@/engine/declarations/dialogs/jupiter/jup_b25/phrase");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

describe("jup_b25_frase_count_inc", () => {
  it("should increment the phrase counter through the shared effect", () => {
    callDialogsBinding("jup_b25_frase_count_inc", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "jup_b25_frase", 0)).toBe(1);

    callDialogsBinding("jup_b25_frase_count_inc", [registry.actor, MockGameObject.mock()]);
    expect(getPortableStoreValue(ACTOR_ID, "jup_b25_frase", 0)).toBe(2);
  });
});
