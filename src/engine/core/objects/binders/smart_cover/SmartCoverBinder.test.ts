import { describe, expect, it } from "@jest/globals";

import { SmartCoverBinder } from "@/engine/core/objects/binders";
import { mockGameObject } from "@/fixtures/xray";

describe("SmartCoverBinder class", () => {
  it("should correctly initialize", () => {
    expect(() => new SmartCoverBinder(mockGameObject())).not.toThrow();
  });
});
