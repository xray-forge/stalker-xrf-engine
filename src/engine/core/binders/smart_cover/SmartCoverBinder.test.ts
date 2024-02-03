import { describe, expect, it } from "@jest/globals";

import { SmartCoverBinder } from "@/engine/core/binders/smart_cover";
import { MockGameObject } from "@/fixtures/xray";

describe("SmartCoverBinder", () => {
  it("should correctly initialize", () => {
    expect(() => new SmartCoverBinder(MockGameObject.mock())).not.toThrow();
  });
});
