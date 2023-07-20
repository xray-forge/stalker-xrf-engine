import { beforeAll, describe, it } from "@jest/globals";

import { checkBinding } from "@/fixtures/engine";

describe("'game' external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/game");
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("smart_covers");
    checkBinding("outro");
    checkBinding("trade_manager");
  });
});
