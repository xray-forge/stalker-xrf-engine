import { describe, expect, it, jest } from "@jest/globals";
import { XR_cse_alife_creature_actor } from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { Actor } from "@/engine/core/objects";
import { ItemArtefact } from "@/engine/core/objects/server/item/ItemArtefact";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { MockAlifeCreatureActor, MockAlifeSimulator, mockServerAlifeCreatureActor } from "@/fixtures/xray";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

describe("Item server class", () => {
  it("should correctly create generic objects without story links", () => {
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    expect(itemArtefact.section_name()).toBe("test-section");
    expect(itemArtefact.keep_saved_data_anyway()).toBe(false);
    expect(itemArtefact.can_switch_online()).toBe(true);

    itemArtefact.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    itemArtefact.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly create generic objects with story links", () => {
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    jest.spyOn(itemArtefact, "spawn_ini").mockReturnValue(
      mockIniFile("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    itemArtefact.on_register();

    expect(registry.storyLink.idBySid.length()).toBe(1);
    expect(registry.storyLink.sidById.length()).toBe(1);

    expect(getServerObjectByStoryId("test-story-id")).toBe(itemArtefact);
    expect(getObjectIdByStoryId("test-story-id")).toBe(itemArtefact.id);
    expect(getStoryIdByObjectId(itemArtefact.id)).toBe("test-story-id");

    itemArtefact.on_unregister();

    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should respect distance for offline switch", () => {
    const actor: MockAlifeCreatureActor = new MockAlifeCreatureActor("actor-test");
    const itemArtefact: ItemArtefact = new ItemArtefact("test-section");

    expect(itemArtefact.can_switch_offline()).toBe(true);

    MockAlifeSimulator.addToRegistry(actor.asMock());

    jest
      .spyOn(actor.position, "distance_to")
      .mockImplementationOnce(() => logicsConfig.ARTEFACT_OFFLINE_DISTANCE - 1)
      .mockImplementationOnce(() => logicsConfig.ARTEFACT_OFFLINE_DISTANCE)
      .mockImplementationOnce(() => logicsConfig.ARTEFACT_OFFLINE_DISTANCE + 1)
      .mockImplementationOnce(() => logicsConfig.ARTEFACT_OFFLINE_DISTANCE + 1000);

    expect(itemArtefact.can_switch_offline()).toBe(false);
    expect(itemArtefact.can_switch_offline()).toBe(false);
    expect(itemArtefact.can_switch_offline()).toBe(true);
    expect(itemArtefact.can_switch_offline()).toBe(true);
  });
});
