import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/actor/on_actor_radiation");
});

describe("on_actor_radiation", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_radiation", [])).not.toThrow();
  });
});
