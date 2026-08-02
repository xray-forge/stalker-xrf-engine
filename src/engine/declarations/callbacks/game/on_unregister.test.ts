import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/game/on_unregister");
});

describe("CSE_ALifeDynamicObject_on_unregister", () => {
  it("registers the callback", () => {
    expect((_G as AnyObject).CSE_ALifeDynamicObject_on_unregister).toBeDefined();
  });
});
