import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerObject, registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrEffect, MockSquad, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/make_actor_visible_to_squad");
});

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

describe("make_actor_visible_to_squad", () => {
  it("should make actor visible for squad", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const squad: MockSquad = MockSquad.mock();
    const firstServer: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
    const firstGame: GameObject = MockGameObject.mock({ id: firstServer.id });
    const secondServer: MockAlifeHumanStalker = MockAlifeHumanStalker.create();
    const secondGame: GameObject = MockGameObject.mock({ id: secondServer.id });

    registerObject(firstGame);
    registerStoryLink(squad.id, "test-sid");

    squad.mockAddMember(firstServer);
    squad.mockAddMember(secondServer);

    expect(() => callXrEffect("make_actor_visible_to_squad", actor, MockGameObject.mock(), "not-existing")).toThrow(
      "There is no squad with story id - 'not-existing'."
    );

    callXrEffect("make_actor_visible_to_squad", actor, MockGameObject.mock(), "test-sid");

    expect(firstGame.make_object_visible_somewhen).toHaveBeenCalledWith(actor);
    expect(secondGame.make_object_visible_somewhen).toHaveBeenCalledWith(actor);
  });
});
