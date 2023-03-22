import { describe, expect, it } from "@jest/globals";

import { EClientObjectClass } from "@/engine/lib/constants/class_ids";
import { registerGameClasses } from "@/engine/scripts/register/class_registrator";
import { mockObjectFactory } from "@/fixtures/xray/mocks/objects/ObjectFactory.mock";

describe("'class_registrator' entry point", () => {
  it("'registerGameClasses' should correctly link script and engine classes", () => {
    const [factory, factoryStore] = mockObjectFactory();

    registerGameClasses(factory);

    Object.values(EClientObjectClass).forEach((it) => {
      expect(factoryStore.registeredClientClasses.has(it)).toBeTruthy();
    });
  });
});
