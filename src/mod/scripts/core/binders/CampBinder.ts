import {
  ini_file,
  XR_cse_alife_object,
  object_binder,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_object_binder
} from "xray16";

import { AnyCallable, Optional } from "@/mod/lib/types";
import { CAMPS } from "@/mod/scripts/core/db";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/CampBinder");

const CAMP_SECTION: string = "camp";

export interface ICampBinder extends XR_object_binder {}

export const CampBinder: ICampBinder = declare_xr_class("CampBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);
    CAMPS.set(this.object.id(), { object: this.object });
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    log.info("Spawn camp", this.object.id());

    let ini: Optional<XR_ini_file> = this.object.spawn_ini()!;

    if (ini.section_exist(CAMP_SECTION)) {
      const filename: Optional<string> = getConfigString(ini, CAMP_SECTION, "cfg", null, false, "", null);

      if (filename !== null) {
        ini = new ini_file(filename);
      }

      CAMPS.set(this.object.id(), (get_global("sr_camp").CCampManager as AnyCallable)(this.object, ini));
    }

    return true;
  },
  net_destroy(): void {
    log.info("Destroy camp", this.object.id());

    CAMPS.delete(this.object.id());
    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    const camp = CAMPS.get(this.object.id());

    if (camp.camp !== null) {
      log.info("Updating camp", camp.object?.id());
      camp.camp.update();
    }
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "CampBinder");
    object_binder.save(this, packet);

    setSaveMarker(packet, true, "CampBinder");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "camp_binder");
    object_binder.load(this, packet);

    setLoadMarker(packet, true, "camp_binder");
  }
} as ICampBinder);
