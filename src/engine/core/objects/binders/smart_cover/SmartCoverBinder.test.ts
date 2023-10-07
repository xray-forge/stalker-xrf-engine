import { describe, expect, it } from "@jest/globals";

import { SmartCoverBinder } from "@/engine/core/objects/binders";
import { mockClientGameObject } from "@/fixtures/xray";

describe("SmartCoverBinder class", () => {
  it("should correctly initialize", () => {
    expect(() => new SmartCoverBinder(mockClientGameObject())).not.toThrow();
  });
});
