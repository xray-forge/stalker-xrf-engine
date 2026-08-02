import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/game/alife_storage_manager");
});

describe("alife_storage_manager", () => {
  it("registers save callbacks", () => {
    expect((_G as AnyObject).alife_storage_manager.CALifeStorageManager_save).toBeDefined();
  });
});
