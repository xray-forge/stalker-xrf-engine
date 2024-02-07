import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager, registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { SmartCover } from "@/engine/core/objects/smart_cover/SmartCover";
import { LuaArray, TStringId } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { EPacketDataType, MockIniFile, MockNetProcessor } from "@/fixtures/xray";

describe("SmartCover server object", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly emit lifecycle events", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const smartCover: SmartCover = new SmartCover("monster");

    const onSmartCoverRegister = jest.fn();
    const onSmartCoverUnregister = jest.fn();

    eventsManager.registerCallback(EGameEvent.SMART_COVER_REGISTER, onSmartCoverRegister);
    eventsManager.registerCallback(EGameEvent.SMART_COVER_UNREGISTER, onSmartCoverUnregister);

    smartCover.on_register();

    expect(onSmartCoverRegister).toHaveBeenCalledWith(smartCover);
    expect(onSmartCoverUnregister).not.toHaveBeenCalled();

    smartCover.on_unregister();

    expect(onSmartCoverRegister).toHaveBeenCalledWith(smartCover);
    expect(onSmartCoverUnregister).toHaveBeenCalledWith(smartCover);
  });

  it("should handle registration events", () => {
    const cover: SmartCover = new SmartCover("test_smart_cover");

    jest.spyOn(cover, "spawn_ini").mockReturnValue(
      MockIniFile.mock("spawn.ini", {
        story_object: {
          story_id: "test-story-id",
        },
      })
    );

    expect(registry.smartCovers.length()).toBe(0);
    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);

    cover.on_before_register();

    expect(registry.smartCovers.length()).toBe(1);
    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
    expect(registry.smartCovers.get(cover.name())).toBe(cover);

    cover.on_register();

    expect(registry.storyLink.idBySid.get("test-story-id")).toBe(cover.id);
    expect(registry.storyLink.sidById.get(cover.id)).toBe("test-story-id");

    cover.on_unregister();

    expect(registry.smartCovers.length()).toBe(0);
    expect(registry.storyLink.idBySid.length()).toBe(0);
    expect(registry.storyLink.sidById.length()).toBe(0);
  });

  it("should correctly fill props when have description", () => {
    const cover: SmartCover = new SmartCover("test_smart_cover");
    const items: LuaArray<unknown> = new LuaTable();

    jest.spyOn(cover, "description").mockImplementation(() => "combat_prone");

    cover.FillProps("test-pref-1", items);

    expect(cover.lastDescription).toBe("combat_prone");
    expect(cover.loopholes).toEqualLuaTables({
      prone: true,
    });
    expect(cover.set_loopholes_table_checker).toHaveBeenCalledWith([
      items,
      "test-pref-1\\test_smart_cover\\loopholes\\prone",
      cover,
      cover.loopholes,
      "prone",
    ]);

    cover.FillProps("test-pref-1", items);

    expect(cover.loopholes).toEqualLuaTables({
      prone: true,
    });

    jest.spyOn(cover, "description").mockImplementation(() => "combat_front");

    cover.FillProps("test-pref-2", items);

    expect(cover.lastDescription).toBe("combat_front");
    expect(cover.loopholes).toEqualLuaTables({
      crouch_front: true,
      crouch_front_left: true,
      crouch_front_right: true,
      stand_front_left: true,
      stand_front_right: true,
    });
    expect(cover.set_loopholes_table_checker).toHaveBeenCalledTimes(7);
    for (const [key] of cover.loopholes) {
      expect(cover.set_loopholes_table_checker).toHaveBeenCalledWith([
        items,
        `test-pref-2\\test_smart_cover\\loopholes\\${key}`,
        cover,
        cover.loopholes,
        key,
      ]);
    }
  });

  it("should correctly fill props when have no description", () => {
    const cover: SmartCover = new SmartCover("test_smart_cover");
    const items: LuaArray<unknown> = new LuaTable();

    jest.spyOn(cover, "description").mockImplementation(() => null);

    cover.FillProps("test-pref-2", items);

    expect(cover.lastDescription).toBe("nil");
    expect(cover.loopholes).toEqualLuaTables({});
    expect(cover.set_loopholes_table_checker).not.toHaveBeenCalled();
  });

  it("should correctly save and load data", () => {
    const cover: SmartCover = new SmartCover("test_smart_cover");
    const processor: MockNetProcessor = new MockNetProcessor();

    cover.lastDescription = "combat_front";
    cover.loopholes = MockLuaTable.mockFromObject<TStringId, boolean>({
      crouch_front: true,
      crouch_front_left: false,
      crouch_front_right: true,
      stand_front_left: false,
    });

    cover.STATE_Write(processor.asNetPacket());

    expect(processor.writeDataOrder).toEqual([
      EPacketDataType.STRING,
      EPacketDataType.STRING,
      EPacketDataType.U8,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
      EPacketDataType.STRING,
      EPacketDataType.BOOLEAN,
    ]);
    expect(processor.dataList).toEqual([
      "state_write_from_SmartCover",
      "combat_front",
      4,
      "crouch_front",
      true,
      "crouch_front_left",
      false,
      "crouch_front_right",
      true,
      "stand_front_left",
      false,
    ]);

    const anotherCover: SmartCover = new SmartCover("test_smart_cover");

    anotherCover.STATE_Read(processor.asNetPacket(), 5001);

    expect(processor.dataList).toEqual([]);
    expect(anotherCover.lastDescription).toBe("combat_front");
    expect(cover.loopholes).toEqualLuaTables({
      crouch_front: true,
      crouch_front_left: false,
      crouch_front_right: true,
      stand_front_left: false,
    });
  });

  it("should fail if description does not exist on load", () => {
    const cover: SmartCover = new SmartCover("test_smart_cover");
    const processor: MockNetProcessor = new MockNetProcessor();

    cover.lastDescription = "not_existing";

    cover.STATE_Write(processor.asNetPacket());

    expect(() => cover.STATE_Read(processor.asNetPacket(), 5001)).toThrow(
      `SmartCover '${cover.name()}' has wrong description - 'not_existing'.`
    );
  });
});
