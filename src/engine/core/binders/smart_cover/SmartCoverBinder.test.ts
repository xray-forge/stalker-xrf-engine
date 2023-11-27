import { describe, expect, it } from "@jest/globals";

import { SmartCoverBinder } from "@/engine/core/binders";
import { MockGameObject } from "@/fixtures/xray";

describe("SmartCoverBinder class", () => {
  it("should correctly initialize", () => {
    expect(() => new SmartCoverBinder(MockGameObject.mock())).not.toThrow();
  });
});
