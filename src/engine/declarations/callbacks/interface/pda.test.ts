import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/interface/pda");
});

describe("pda", () => {
  it("registers PDA callbacks", () => {
    expect((_G as AnyObject).pda.get_stat).toBeDefined();
  });
});
