import { beforeAll, describe, it } from "@jest/globals";

import { checkBinding, checkNestedBinding } from "@/fixtures/engine";

describe("'game' external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/game");
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("main");
    checkBinding("smart_covers");
    checkNestedBinding("smart_covers", "descriptions");
    checkBinding("outro");
    checkBinding("trade_manager");
  });
});
