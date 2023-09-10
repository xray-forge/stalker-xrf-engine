import { beforeEach, describe, it } from "@jest/globals";

import { registry } from "@/engine/core/database/registry";

describe("'simulation' module of the database", () => {
  beforeEach(() => {
    registry.objects = new LuaTable();
  });

  it.todo("should correctly register simulation objects");

  it.todo("should correctly unregister simulation objects");

  it.todo("should correctly initialize simulation objects properties");
});
