import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { SmartCoverBinder } from "@/engine/core/binders/smart_cover";

describe("SmartCoverBinder", () => {
  it("should correctly initialize", () => {
    expect(() => new SmartCoverBinder(MockGameObject.mock())).not.toThrow();
  });
});
