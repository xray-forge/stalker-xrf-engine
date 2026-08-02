import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/static/always");
});

describe("always", () => {
  it("should return true independently of actor, object and parameters", () => {
    expect(callXrCondition("always", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
    expect(callXrCondition("always", MockGameObject.mockActor(), MockGameObject.mock(), "first", 1)).toBe(true);
  });
});
