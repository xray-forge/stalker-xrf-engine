import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/never");
});

describe("never", () => {
  it("should return false independently of actor, object and parameters", () => {
    expect(callXrCondition("never", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(callXrCondition("never", MockGameObject.mockActor(), MockGameObject.mock(), "first", 1)).toBe(false);
  });
});
