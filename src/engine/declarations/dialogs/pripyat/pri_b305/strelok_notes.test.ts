import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { ammo } from "@/engine/constants/items/ammo";
import { artefacts } from "@/engine/constants/items/artefacts";
import { drugs } from "@/engine/constants/items/drugs";
import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import {
  giveMoneyToActor,
  transferItemsFromActor,
  transferItemsToActor,
  transferMoneyFromActor,
} from "@/engine/core/utils/reward";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

/**
 * Sections of the three Strelok notes, indexed the same way the dialog predicates name them.
 */
const NOTES: Array<TSection> = [questItems.jup_b10_notes_01, questItems.jup_b10_notes_02, questItems.jup_b10_notes_03];

/**
 * All possible combinations of carried Strelok notes, described by their 1-based indexes.
 */
const NOTE_COMBINATIONS: Array<Array<number>> = [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_pripyat"]);
}

/**
 * Re-register the actor carrying the provided 1-based Strelok note indexes and extra sections.
 */
function mockActorWithNotes(indexes: Array<number>, extra: Array<TSection> = []): void {
  resetRegistry();
  mockRegisteredActor({
    inventory: [...indexes.map((index) => NOTES[index - 1]), ...extra].map((section) => [
      section,
      MockGameObject.mock({ section }),
    ]),
  });
}

/**
 * Verify that a note predicate accepts only the exact note combination it is named after.
 */
function checkNotePredicate(name: TName, expected: Array<number>): void {
  for (const combination of NOTE_COMBINATIONS) {
    mockActorWithNotes(combination);

    const isExpected: boolean =
      combination.length === expected.length && expected.every((index) => combination.includes(index));

    expect(callDialogsBinding(name)).toBe(isExpected);
  }
}

jest.mock("@/engine/core/utils/reward");

beforeAll(() => {
  require("@/engine/declarations/dialogs/pripyat/pri_b305/strelok_notes");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(giveMoneyToActor);
  resetFunctionMock(transferItemsFromActor);
  resetFunctionMock(transferItemsToActor);
  resetFunctionMock(transferMoneyFromActor);
});

describe("pri_b305_actor_has_strelok_notes", () => {
  it("should detect any of the three notes", () => {
    for (const combination of NOTE_COMBINATIONS) {
      mockActorWithNotes(combination);

      expect(callDialogsBinding("pri_b305_actor_has_strelok_notes")).toBe(combination.length > 0);
    }
  });
});

describe("pri_b305_actor_has_strelok_note_1", () => {
  it("should accept only the first note alone", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_1", [1]);
  });
});

describe("pri_b305_actor_has_strelok_note_2", () => {
  it("should accept only the second note alone", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_2", [2]);
  });
});

describe("pri_b305_actor_has_strelok_note_3", () => {
  it("should accept only the third note alone", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_3", [3]);
  });
});

describe("pri_b305_actor_has_strelok_note_12", () => {
  it("should accept only the first and second notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_12", [1, 2]);
  });
});

describe("pri_b305_actor_has_strelok_note_13", () => {
  it("should accept only the first and third notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_13", [1, 3]);
  });
});

describe("pri_b305_actor_has_strelok_note_23", () => {
  it("should accept only the second and third notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_23", [2, 3]);
  });
});

describe("pri_b305_actor_has_strelok_note_all", () => {
  it("should accept only all three notes together", () => {
    checkNotePredicate("pri_b305_actor_has_strelok_note_all", [1, 2, 3]);
  });
});

describe("pri_b305_sell_strelok_notes", () => {
  it("should take a single note and reward medkits only", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(1);
    expect(transferItemsFromActor).toHaveBeenCalledWith(npc, questItems.jup_b10_notes_01);
    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
    expect(registry.actor.has_info(infoPortions.pri_b305_all_strelok_notes_given)).toBe(false);
  });

  it("should add the fire artefact starting from the second note", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1, 2]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(2);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_fire);
    expect(transferItemsToActor).not.toHaveBeenCalledWith(npc, artefacts.af_glass);
    expect(registry.actor.has_info(infoPortions.pri_b305_all_strelok_notes_given)).toBe(false);
  });

  it("should add the glass artefact and mark completion for all three notes", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1, 2, 3]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).toHaveBeenCalledTimes(3);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_fire);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, artefacts.af_glass);
    expect(registry.actor.has_info(infoPortions.pri_b305_all_strelok_notes_given)).toBe(true);
  });

  it("should reward gauss ammunition instead of medkits when the actor owns the gauss rifle", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([1], [weapons.wpn_gauss]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsToActor).toHaveBeenCalledWith(npc, ammo.ammo_gauss, 2);
    expect(transferItemsToActor).not.toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
  });

  it("should do nothing but reward medkits when no notes are carried", () => {
    const npc: GameObject = MockGameObject.mock();

    mockActorWithNotes([]);
    callDialogsBinding("pri_b305_sell_strelok_notes", [registry.actor, npc]);

    expect(transferItemsFromActor).not.toHaveBeenCalled();
    expect(transferItemsToActor).toHaveBeenCalledTimes(1);
    expect(transferItemsToActor).toHaveBeenCalledWith(npc, drugs.medkit_scientic, 3);
  });
});
