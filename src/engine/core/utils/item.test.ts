import { describe, expect, it } from "@jest/globals";

import { setItemCondition } from "@/engine/core/utils/item";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("item utils", () => {
  it("setItemCondition should correctly set condition", () => {
    const object: ClientObject = mockClientGameObject();

    setItemCondition(object, 25);
    expect(object.set_condition).toHaveBeenCalledWith(0.25);

    setItemCondition(object, 100);
    expect(object.set_condition).toHaveBeenNthCalledWith(2, 1);

    setItemCondition(object, 0);
    expect(object.set_condition).toHaveBeenNthCalledWith(3, 0);
  });
});
