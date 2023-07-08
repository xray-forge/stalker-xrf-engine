import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import {
  objectLookAtAnotherObject,
  setItemCondition,
  setObjectTeamSquadGroup,
} from "@/engine/core/utils/object/object_set";
import { ClientObject, ServerHumanObject } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/utils";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("object_set utils", () => {
  it("'setItemCondition' should correctly set condition", () => {
    const object: ClientObject = mockClientGameObject();

    setItemCondition(object, 25);
    expect(object.set_condition).toHaveBeenCalledWith(0.25);

    setItemCondition(object, 100);
    expect(object.set_condition).toHaveBeenNthCalledWith(2, 1);

    setItemCondition(object, 0);
    expect(object.set_condition).toHaveBeenNthCalledWith(3, 0);
  });

  it("'setObjectTeamSquadGroup' should correctly set object group details", () => {
    const firstObject: ClientObject = mockClientGameObject();
    const firstServerObject: ServerHumanObject = mockServerAlifeHumanStalker({ id: firstObject.id() });

    setObjectTeamSquadGroup(firstServerObject, 432, 543, 654);

    expect(firstServerObject.team).toBe(432);
    expect(firstServerObject.squad).toBe(543);
    expect(firstServerObject.group).toBe(654);

    expect(firstObject.change_team).not.toHaveBeenCalled();

    const secondObject: ClientObject = mockClientGameObject();
    const secondServerObject: ServerHumanObject = mockServerAlifeHumanStalker({ id: secondObject.id() });

    registerObject(secondObject);
    setObjectTeamSquadGroup(secondServerObject, 443, 444, 445);

    expect(secondServerObject.team).not.toBe(443);
    expect(secondServerObject.squad).not.toBe(444);
    expect(secondServerObject.group).not.toBe(445);

    expect(secondObject.change_team).toHaveBeenCalledWith(443, 444, 445);
  });

  it("'objectLookAtAnotherObject' should correctly look at another object", () => {
    const firstObject: ClientObject = mockClientGameObject();
    const secondObject: ClientObject = mockClientGameObject();

    objectLookAtAnotherObject(firstObject, secondObject);
    expect(firstObject.set_sight).toHaveBeenNthCalledWith(1, 2, { x: 0, y: 0, z: 0 }, 0);

    replaceFunctionMock(firstObject.position, () => MockVector.mock(16, 4, 2));
    replaceFunctionMock(secondObject.position, () => MockVector.mock(2, 4, 16));

    objectLookAtAnotherObject(firstObject, secondObject);
    expect(firstObject.set_sight).toHaveBeenNthCalledWith(2, 2, { x: -14, y: 0, z: 14 }, 0);
  });
});
