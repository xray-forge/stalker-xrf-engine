import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { PhantomBinder } from "@/engine/core/binders/physic/PhantomBinder";
import { getManager } from "@/engine/core/database";
import { PhantomManager } from "@/engine/core/managers/psy";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("PhantomBinder class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize / destroy", () => {
    const manager: PhantomManager = getManager(PhantomManager);

    jest.spyOn(manager, "addPhantom").mockImplementation(jest.fn());
    jest.spyOn(manager, "removePhantom").mockImplementation(jest.fn());

    const object: GameObject = MockGameObject.mock();
    const binder: PhantomBinder = new PhantomBinder(object);

    expect(manager.addPhantom).toHaveBeenCalledTimes(1);

    binder.net_destroy();

    expect(manager.removePhantom).toHaveBeenCalledTimes(1);
  });
});
