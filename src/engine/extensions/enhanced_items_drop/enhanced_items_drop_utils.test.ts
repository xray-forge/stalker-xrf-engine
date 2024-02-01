import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { onItemGoOnlineFirstTime } from "@/engine/extensions/enhanced_items_drop/enhanced_items_drop_utils";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { MockAlifeObject, MockGameObject } from "@/fixtures/xray";

describe("enhanced_items_drop utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly handle item going online for actor and ignore additions", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    MockAlifeObject.mock({ id: object.id(), parentId: ACTOR_ID });

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();

    jest.spyOn(math, "random").mockImplementation(() => 0);
    onItemGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();
  });

  it("should correctly handle item going online for world", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });

    MockAlifeObject.mock({ id: object.id(), parentId: MAX_U16 });

    jest.spyOn(math, "random").mockImplementation(() => 100);
    onItemGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemGoOnlineFirstTime(object);
    expect(object.add_upgrade).toHaveBeenCalled();
  });

  it("should correctly handle item going online for owned", () => {
    const object: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74u });
    const owner: ServerObject = MockAlifeObject.mock();

    MockAlifeObject.mock({ id: object.id(), parentId: owner.id });

    jest.spyOn(math, "random").mockImplementation(() => 100);
    onItemGoOnlineFirstTime(object);
    expect(object.add_upgrade).not.toHaveBeenCalled();

    jest.spyOn(math, "random").mockImplementation(() => 1);
    onItemGoOnlineFirstTime(object);
    expect(object.add_upgrade).toHaveBeenCalled();
  });
});
