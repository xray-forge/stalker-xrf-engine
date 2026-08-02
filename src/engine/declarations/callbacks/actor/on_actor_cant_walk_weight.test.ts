import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/actor/on_actor_cant_walk_weight");
});

describe("on_actor_cant_walk_weight", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_cant_walk_weight", [])).not.toThrow();
  });
});
