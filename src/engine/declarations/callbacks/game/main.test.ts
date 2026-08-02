import { beforeAll, describe, expect, it } from "@jest/globals";

import { callBinding } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/callbacks/game/main");
});

describe("main", () => {
  it("provides a callable entry point", () => {
    expect(() => callBinding("main", [])).not.toThrow();
  });
});
