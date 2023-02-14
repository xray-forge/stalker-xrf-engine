import {
  alife,
  command_line,
  object_binder,
  XR_cse_alife_object,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
} from "xray16";

import { addObject, deleteObject, storage } from "@/mod/scripts/core/db";
import { load_obj, save_obj } from "@/mod/scripts/core/schemes/storing";
import { ILevelChanger } from "@/mod/scripts/se/LevelChanger";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("LevelChangerBinder");

export interface ILevelChangerBinder extends XR_object_binder {}

export const LevelChangerBinder: ILevelChangerBinder = declare_xr_class("LevelChangerBinder", object_binder, {
  reinit(): void {
    object_binder.reinit(this);
    storage.set(this.object.id(), {});
  },
  net_spawn(cse_object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, cse_object)) {
      return false;
    }

    const [index] = string.find(command_line(), "-designer");

    if (index !== null) {
      return true;
    }

    addObject(this.object);

    const s_obj: ILevelChanger = alife().object(this.object.id()) as ILevelChanger;

    this.object.enable_level_changer(s_obj.enabled);
    this.object.set_level_changer_invitation(s_obj.hint);

    logger.info("Net spawned:", this.object.id(), s_obj.enabled, s_obj.hint);

    return true;
  },
  net_destroy(): void {
    logger.info("Destroy:", this.object.name());
    deleteObject(this.object);
    object_binder.net_destroy(this);
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, LevelChangerBinder.__name);

    object_binder.save(this, packet);
    save_obj(this.object, packet);

    setSaveMarker(packet, true, LevelChangerBinder.__name);
  },
  load(reader: XR_reader): void {
    setLoadMarker(reader, false, LevelChangerBinder.__name);

    object_binder.load(this, reader);
    load_obj(this.object, reader);

    setLoadMarker(reader, true, LevelChangerBinder.__name);
  },
} as ILevelChangerBinder);
