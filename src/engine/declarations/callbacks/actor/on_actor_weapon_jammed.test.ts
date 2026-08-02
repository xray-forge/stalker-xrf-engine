import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/actor/on_actor_weapon_jammed");
});

describe("on_actor_weapon_jammed", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_weapon_jammed", [])).not.toThrow();
  });
});
