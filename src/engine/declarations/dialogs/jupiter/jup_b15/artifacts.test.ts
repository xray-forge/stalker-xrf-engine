import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TCount, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { artefacts } from "@/engine/constants/items/artefacts";
import { outfits } from "@/engine/constants/items/outfits";
import { registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import {
  giveItemsToActor,
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

/**
 * Re-register the actor carrying the provided sections, dropping any previously given info portions.
 *
 * Inventory keys are index-suffixed so repeating the same section registers separate items, while
 * `object(section)` lookups still resolve by section.
 */
function mockActorWith(sections: Array<TSection>, config: AnyObject = {}): GameObject {
  resetRegistry();

  return mockRegisteredActor({
    ...config,
    inventory: sections.map((section, index) => [`${section}_${index}`, MockGameObject.mock({ section })]),
  }).actorGameObject;
}

/**
 * Verify a predicate flips once the provided section is in the actor inventory.
 */
function checkHasItemPredicate(name: TName, section: TSection, expected: boolean = true): void {
  mockActorWith([]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(!expected);

  mockActorWith([section]);
  expect(callDialogsBinding(name, [registry.actor, MockGameObject.mock()])).toBe(expected);
}

/**
 * Verify an action transfers the expected section from the actor to the NPC speaker.
 */
function checkTransferFromActor(name: TName, section: TSection, count?: TCount): void {
  const npc: GameObject = MockGameObject.mock();

  callDialogsBinding(name, [registry.actor, npc]);

  if (count === undefined) {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section);
  } else {
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, section, count);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/effects/game/dec_counter");
  require("@/engine/declarations/dialogs/jupiter/jup_b15/artifacts");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveItemsToActor);
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("if_actor_has_af_mincer_meat", () => {
  it("should check the mincer meat artefact on the first speaker", () => {
    checkHasItemPredicate("if_actor_has_af_mincer_meat", artefacts.af_mincer_meat);
  });
});

describe("if_actor_has_af_fuzz_kolobok", () => {
  it("should check the fuzz kolobok artefact on the first speaker", () => {
    checkHasItemPredicate("if_actor_has_af_fuzz_kolobok", artefacts.af_fuzz_kolobok);
  });
});

describe("actor_has_first_or_second_artefact", () => {
  it("should accept either of the two b9 artefacts", () => {
    expect(callDialogsBinding("actor_has_first_or_second_artefact", [registry.actor, MockGameObject.mock()])).toBe(
      false
    );

    for (const artefact of [artefacts.af_mincer_meat, artefacts.af_fuzz_kolobok]) {
      mockActorWith([artefact]);
      expect(callDialogsBinding("actor_has_first_or_second_artefact", [registry.actor, MockGameObject.mock()])).toBe(
        true
      );
    }
  });
});

describe("transfer_af_mincer_meat", () => {
  it("should take the mincer meat artefact", () => {
    checkTransferFromActor("transfer_af_mincer_meat", artefacts.af_mincer_meat);
  });
});

describe("jup_b15_dec_counter", () => {
  it("should decrement the drunk counter through the shared effect", () => {
    setPortableStoreValue(ACTOR_ID, "jup_b15_full_drunk_count", 3);

    callDialogsBinding("jup_b15_dec_counter", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "jup_b15_full_drunk_count", 0)).toBe(2);
  });

  it("should not decrement the counter below zero", () => {
    callDialogsBinding("jup_b15_dec_counter", [registry.actor, MockGameObject.mock()]);

    expect(getPortableStoreValue(ACTOR_ID, "jup_b15_full_drunk_count", 0)).toBe(0);
  });
});

describe("transfer_af_fuzz_kolobok", () => {
  it("should take the fuzz kolobok artefact", () => {
    checkTransferFromActor("transfer_af_fuzz_kolobok", "af_fuzz_kolobok");
  });
});

describe("jup_b15_actor_sci_outfit", () => {
  it("should check the scientific outfit", () => {
    checkHasItemPredicate("jup_b15_actor_sci_outfit", outfits.scientific_outfit);
  });
});

describe("jup_b15_no_actor_sci_outfit", () => {
  it("should invert the scientific outfit check", () => {
    checkHasItemPredicate("jup_b15_no_actor_sci_outfit", outfits.scientific_outfit, false);
  });
});
