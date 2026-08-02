import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/actor/on_actor_critical_max_power");
});

describe("on_actor_critical_max_power", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_critical_max_power", [])).not.toThrow();
  });
});
