import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/on_actor_psy");
});

describe("on_actor_psy", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_psy", [])).not.toThrow();
  });
});
