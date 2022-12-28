import { alife, system_ini, XR_cse_abstract, XR_ini_file, XR_LuaBindBase, XR_net_packet } from "xray16";

import { MAX_UNSIGNED_16_BIT } from "@/mod/globals/memory";
import { Optional } from "@/mod/lib/types";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/StoryObjectsRegistry");
let storyObjectsRegistry: Optional<IStoryObjectsRegistry> = null;

export interface IStoryObjectsRegistry extends XR_LuaBindBase {
  id_by_story_id: LuaTable<string, number>;
  story_id_by_id: LuaTable<number, string>;

  register(obj_id: number, story_obj_id: string): void;
  unregister_by_id(obj_id: number): void;
  unregister_by_story_id(story_id: string): void;
  get(story_obj_id: string): Optional<number>;
  get_story_id(obj_id: number): Optional<string>;
  save(packet: XR_net_packet): void;
  load(packet: XR_net_packet): void;
}

export const StoryObjectsRegistry: IStoryObjectsRegistry = declare_xr_class("StoryObjectsRegistry", null, {
  __init(): void {
    log.info("Init");
    this.id_by_story_id = new LuaTable();
    this.story_id_by_id = new LuaTable();
  },
  register(objectId: number, storyObjectId: string): void {
    log.info("Register:", objectId, storyObjectId);

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
  },
  unregister_by_id(obj_id: number): void {
    log.info("Unregister object id:", obj_id);
    if (this.story_id_by_id.get(obj_id) !== null) {
      this.id_by_story_id.delete(this.story_id_by_id.get(obj_id));
      this.story_id_by_id.delete(obj_id);
    }
  },
  unregister_by_story_id(story_id: string): void {
    log.info("Unregister story id:", story_id);

    if (this.id_by_story_id.get(story_id) !== null) {
      this.story_id_by_id.delete(this.id_by_story_id.get(story_id));
      this.id_by_story_id.delete(story_id);
    }
  },
  get(story_obj_id: string): Optional<number> {
    return this.id_by_story_id.get(story_obj_id);
  },
  get_story_id(obj_id: number): Optional<string> {
    return this.story_id_by_id.get(obj_id);
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "StoryObjectsRegistry");

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

    setSaveMarker(packet, true, "StoryObjectsRegistry");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "StoryObjectsRegistry");

    const count: number = packet.r_u16();

    for (const it of $range(1, count)) {
      const story_id: string = packet.r_stringZ();
      const obj_id: number = packet.r_u16();

      this.id_by_story_id.set(story_id, obj_id);
      this.story_id_by_id.set(obj_id, story_id);
    }

    setLoadMarker(packet, true, "StoryObjectsRegistry");
  }
} as IStoryObjectsRegistry);

export function getStoryObjectsRegistry(): IStoryObjectsRegistry {
  if (storyObjectsRegistry == null) {
    storyObjectsRegistry = create_xr_class_instance(StoryObjectsRegistry);
  }

  return storyObjectsRegistry;
}

export function checkSpawnIniForStoryId(se_obj: XR_cse_abstract): void {
  let spawnIni: XR_ini_file = se_obj.spawn_ini();

  if (spawnIni.section_exist("story_object")) {
    const [result, id, value] = spawnIni.r_line("story_object", 0, "", "");

    if (id !== "story_id") {
      abort("There is no 'story_id' field in [story_object] section :object [%s]", se_obj.name());
    }

    if (value === "") {
      abort("Field 'story_id' in [story_object] section got no value :object [%s]", se_obj.name());
    }

    getStoryObjectsRegistry().register(se_obj.id, value);

    return;
  }

  spawnIni = system_ini();

  const spawn_sect = se_obj.section_name();
  const story_id = getConfigString(spawnIni, spawn_sect, "story_id", null, false, "", null);

  if (story_id !== null) {
    getStoryObjectsRegistry().register(se_obj.id, story_id);
  }
}
