import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

import { gameOutroConfig } from "@/engine/core/managers/outro";

beforeAll(() => {
  require("@/engine/declarations/callbacks/outro");
});

describe("outro", () => {
  it("exposes configured outro conditions", () => {
    expect((_G as AnyObject).outro.conditions).toBe(gameOutroConfig.OUTRO_CONDITIONS);
  });
});
