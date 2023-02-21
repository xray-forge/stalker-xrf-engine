import {
  ini_file,
  object_binder,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { CampStoryManager } from "@/mod/scripts/core/schemes/base/CampStoryManager";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("CampBinder");

export interface ICampBinder extends XR_object_binder {}

export const CampBinder: ICampBinder = declare_xr_class("CampBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);

    const camp = registry.camps.stories.get(this.object.id());

    // todo: Probably not needed.
    if (camp !== null) {
      camp.object = this.object;
    }
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    logger.info("Net spawn camp:", this.object.name());

    const ini: XR_ini_file = this.object.spawn_ini();

    if (ini.section_exist(CampStoryManager.SCHEME_SECTION)) {
      const filename: Optional<string> = getConfigString(
        ini,
        CampStoryManager.SCHEME_SECTION,
        "cfg",
        null,
        false,
        "",
        null
      );

      registry.camps.stories.set(
        this.object.id(),
        new CampStoryManager(this.object, filename === null ? ini : new ini_file(filename))
      );
    }

    return true;
  },
  net_destroy(): void {
    logger.info("Net destroy camp:", this.object.id());

    registry.camps.stories.delete(this.object.id());
    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    const camp = registry.camps.stories.get(this.object.id());

    if (camp !== null) {
      camp.update();
    }
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, CampBinder.__name);
    object_binder.save(this, packet);

    setSaveMarker(packet, true, CampBinder.__name);
  },
  load(reader: XR_reader): void {
    setLoadMarker(reader, false, CampBinder.__name);
    object_binder.load(this, reader);

    setLoadMarker(reader, true, CampBinder.__name);
  },
} as ICampBinder);
