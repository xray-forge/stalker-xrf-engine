import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/on_actor_satiety");
});

describe("on_actor_satiety", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_satiety", [])).not.toThrow();
  });
});
