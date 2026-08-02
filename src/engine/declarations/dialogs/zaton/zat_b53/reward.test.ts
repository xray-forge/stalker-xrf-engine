import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { artefacts } from "@/engine/constants/items/artefacts";
import { detectors } from "@/engine/constants/items/detectors";
import { drugs } from "@/engine/constants/items/drugs";
import { registry } from "@/engine/core/database";
import { transferItemsToActor } from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/reward");

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_zaton"]);
}

function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

function checkTransferToActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, section, count);
  }
}

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  registry.simulator = MockAlifeSimulator.getInstance();
  resetFunctionMock(transferItemsToActor);
});

beforeAll(() => {
  require("@/engine/declarations/dialogs/zaton/zat_b53/reward");
});

describe("zat_b53_if_actor_has_detector_advanced", () => {
  it("should accept any detector above the basic one", () => {
    expect(callDialogsBinding("zat_b53_if_actor_has_detector_advanced")).toBe(false);

    for (const detector of [detectors.detector_advanced, detectors.detector_elite, detectors.detector_scientific]) {
      mockActorWith([detector]);
      expect(callDialogsBinding("zat_b53_if_actor_has_detector_advanced")).toBe(true);
    }
  });
});
describe("zat_b53_if_actor_hasnt_detector_advanced", () => {
  it("should invert the advanced detector check", () => {
    expect(
      callDialogsBinding("zat_b53_if_actor_hasnt_detector_advanced", [registry.actor, MockGameObject.mock()])
    ).toBe(true);

    mockActorWith([detectors.detector_advanced]);
    expect(
      callDialogsBinding("zat_b53_if_actor_hasnt_detector_advanced", [registry.actor, MockGameObject.mock()])
    ).toBe(false);
  });
});
describe("zat_b53_transfer_medkit_to_npc", () => {
  it("should release the preferred medkit and raise the actor reputation", () => {
    mockActorWith([drugs.medkit_army, drugs.medkit]);
    registry.simulator = MockAlifeSimulator.getInstance();

    const release = jest.spyOn(registry.simulator, "release").mockImplementation(jest.fn());

    callDialogsBinding("zat_b53_transfer_medkit_to_npc", [registry.actor, MockGameObject.mock()]);

    expect(release).toHaveBeenCalled();
    expect(registry.actor.change_character_reputation).toHaveBeenCalledWith(10);

    release.mockRestore();
  });

  it("should do nothing when the actor has no medkit", () => {
    callDialogsBinding("zat_b53_transfer_medkit_to_npc", [registry.actor, MockGameObject.mock()]);

    expect(registry.actor.change_character_reputation).not.toHaveBeenCalled();
  });
});
describe("zat_b53_transfer_detector_advanced_to_actor", () => {
  it("should give the advanced detector", () => {
    checkTransferToActor("zat_b53_transfer_detector_advanced_to_actor", detectors.detector_advanced);
  });
});
describe("zat_b53_transfer_fireball_to_actor", () => {
  it("should give the fireball artefact", () => {
    checkTransferToActor("zat_b53_transfer_fireball_to_actor", artefacts.af_fireball);
  });
});
describe("zat_b53_transfer_medkit_to_actor", () => {
  it("should give the plain medkit", () => {
    checkTransferToActor("zat_b53_transfer_medkit_to_actor", drugs.medkit);
  });
});
