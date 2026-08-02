import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/on_actor_bleeding");
});

describe("on_actor_bleeding", () => {
  it("handles the callback", () => {
    expect(() => callBinding("on_actor_bleeding", [])).not.toThrow();
  });
});
