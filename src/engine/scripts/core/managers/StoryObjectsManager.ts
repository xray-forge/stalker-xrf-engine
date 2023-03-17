import {
  alife,
  level,
  TXR_net_processor,
  XR_cse_abstract,
  XR_cse_alife_online_offline_group,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
} from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/engine/lib/constants/memory";
import { Maybe, Optional, TCount, TNumberId, TStringId } from "@/engine/lib/types";
import { SYSTEM_INI } from "@/engine/scripts/core/database/ini";
import { registry } from "@/engine/scripts/core/database/registry";
import { AbstractCoreManager } from "@/engine/scripts/core/managers/AbstractCoreManager";
import { getConfigString } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/engine/scripts/utils/game_save";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class StoryObjectsManager extends AbstractCoreManager {
  /**
   * todo;
   */
  public static checkSpawnIniForStoryId(se_obj: XR_cse_abstract): void {
    const spawnIni: XR_ini_file = se_obj.spawn_ini();

    if (spawnIni.section_exist("story_object")) {
      const [result, id, value] = spawnIni.r_line("story_object", 0, "", "");

      if (id !== "story_id") {
        abort("There is no 'story_id' field in [story_object] section :object [%s]", se_obj.name());
      }

      if (value === "") {
        abort("Field 'story_id' in [story_object] section got no value :object [%s]", se_obj.name());
      }

      StoryObjectsManager.getInstance().register(se_obj.id, value);

      return;
    }

    const spawn_sect = se_obj.section_name();
    const story_id = getConfigString(SYSTEM_INI, spawn_sect, "story_id", null, false, "", null);

    if (story_id !== null) {
      StoryObjectsManager.getInstance().register(se_obj.id, story_id);
    }
  }

  /**
   * todo;
   */
  public static getStoryObject(storyObjectId: TStringId): Optional<XR_game_object> {
    const objectId: Optional<TNumberId> = StoryObjectsManager.getInstance().get(storyObjectId);
    const possibleObject: Maybe<XR_game_object> = objectId ? registry.objects.get(objectId)?.object : null;

    if (possibleObject) {
      return possibleObject;
    } else if (level && objectId) {
      return level.object_by_id(objectId);
    }

    return null;
  }

  /**
   * todo;
   */
  public static getStoryObjectId(storyId: TStringId): Optional<TNumberId> {
    return StoryObjectsManager.getInstance().id_by_story_id.get(storyId);
  }

  /**
   * todo;
   */
  public static unregisterStoryObjectById(id: TNumberId): void {
    StoryObjectsManager.getInstance().unregister_by_id(id);
  }

  /**
   * todo;
   */
  public static unregisterStoryId(id: TStringId): void {
    StoryObjectsManager.getInstance().unregister_by_story_id(id);
  }

  /**
   * todo;
   */
  public static getStorySquad<T extends XR_cse_alife_online_offline_group>(storyId: TStringId): Optional<T> {
    const squadId: Optional<TNumberId> = StoryObjectsManager.getInstance().id_by_story_id.get(storyId);

    return squadId === null ? null : alife().object<T>(squadId);
  }

  public readonly id_by_story_id: LuaTable<TStringId, TNumberId> = new LuaTable();
  public readonly story_id_by_id: LuaTable<TNumberId, TStringId> = new LuaTable();

  /**
   * todo;
   */
  public register(objectId: TNumberId, storyObjectId: TStringId): void {
    if (this.id_by_story_id.get(storyObjectId) !== null) {
      if (objectId !== this.id_by_story_id.get(storyObjectId)) {
        const existingObjectName = alife().object(this.id_by_story_id.get(storyObjectId))?.name();
        const newObjectName = alife().object(objectId)?.name();

        abort(
          "You are trying to spawn two or more objects with the same story_id:[%s] --> [%s] try to add:[%s]",
          storyObjectId,
          existingObjectName,
          newObjectName
        );
      }
    } else if (this.story_id_by_id.get(objectId) !== null) {
      if (this.story_id_by_id.get(objectId) !== storyObjectId) {
        abort("Object [%s] is already in StoryObjectsRegistry with story_id: [%s]", tostring(objectId), storyObjectId);
      }
    }

    this.id_by_story_id.set(storyObjectId, objectId);
    this.story_id_by_id.set(objectId, storyObjectId);
  }

  /**
   * todo;
   */
  public unregister_by_id(objectId: TNumberId): void {
    if (this.story_id_by_id.get(objectId) !== null) {
      this.id_by_story_id.delete(this.story_id_by_id.get(objectId));
      this.story_id_by_id.delete(objectId);
    }
  }

  /**
   * todo;
   */
  public unregister_by_story_id(storyId: TStringId): void {
    if (this.id_by_story_id.get(storyId) !== null) {
      this.story_id_by_id.delete(this.id_by_story_id.get(storyId));
      this.id_by_story_id.delete(storyId);
    }
  }

  /**
   * todo;
   */
  public get(storyId: TStringId): Optional<TNumberId> {
    return this.id_by_story_id.get(storyId);
  }

  /**
   * todo;
   */
  public get_story_id(objectId: TNumberId): Optional<string> {
    return this.story_id_by_id.get(objectId);
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, StoryObjectsManager.name);

    let count = 0;

    for (const [k, v] of this.id_by_story_id) {
      count += 1;
    }

    if (count >= MAX_UNSIGNED_16_BIT) {
      abort("There is too many story_ids!");
    }

    packet.w_u16(count);

    for (const [k, v] of this.id_by_story_id) {
      packet.w_stringZ(k);
      packet.w_u16(v);
    }

    setSaveMarker(packet, true, StoryObjectsManager.name);
  }

  /**
   * todo;
   */
  public override load(packet: TXR_net_processor): void {
    setLoadMarker(packet, false, StoryObjectsManager.name);

    const count: TCount = packet.r_u16();

    for (const it of $range(1, count)) {
      const storyId: TStringId = packet.r_stringZ();
      const objectId: TNumberId = packet.r_u16();

      this.id_by_story_id.set(storyId, objectId);
      this.story_id_by_id.set(objectId, storyId);
    }

    setLoadMarker(packet, true, StoryObjectsManager.name);
  }
}
