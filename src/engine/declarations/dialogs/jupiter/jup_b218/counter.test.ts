import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ACTOR_ID, AnyArgs, AnyObject, TName } from "xray16/lib";

import { setPortableStoreValue } from "@/engine/core/database/portable_store";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b218/counter");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

describe("jup_b218_counter_not_3", () => {
  it("should follow the squad members counter", () => {
    expect(callDialogsBinding("jup_b218_counter_not_3")).toBe(true);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);
    expect(callDialogsBinding("jup_b218_counter_not_3")).toBe(false);
  });
});

describe("jup_b218_counter_equal_3", () => {
  it("should follow the squad members counter", () => {
    expect(callDialogsBinding("jup_b218_counter_equal_3")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);
    expect(callDialogsBinding("jup_b218_counter_equal_3")).toBe(true);
  });
});

describe("jup_b218_counter_not_0", () => {
  it("should follow the squad members counter", () => {
    expect(callDialogsBinding("jup_b218_counter_not_0")).toBe(false);

    setPortableStoreValue(ACTOR_ID, "jup_b218_squad_members_count", 3);
    expect(callDialogsBinding("jup_b218_counter_not_0")).toBe(true);
  });
});
