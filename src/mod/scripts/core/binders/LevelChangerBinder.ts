import {
  alife,
  command_line,
  object_binder,
  XR_cse_alife_level_changer,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_object_binder
} from "xray16";

import { AnyCallable } from "@/mod/lib/types";
import { setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

import { addObject, deleteObject, storage } from "../db";

const log: LuaLogger = new LuaLogger("core/binders/LevelChangerBinder");

export interface ILevelChangerBinder extends XR_object_binder {}

export const LevelChangerBinder: ILevelChangerBinder = declare_xr_class("LevelChangerBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);

    log.info("Init:", object.name());
  },
  update(delta: number): void {
    object_binder.update(this, delta);
  },
  reload(section: string): void {
    object_binder.reload(this, section);
  },
  reinit(): void {
    object_binder.reinit(this);
    storage.set(this.object.id(), {} as any);
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

    const s_obj: any = alife().object(this.object.id()) as XR_cse_alife_level_changer;

    // todo: Use correct declaration after se_level_changer update, class extending CLevelChanger.
    this.object.enable_level_changer(s_obj.enabled);
    this.object.set_level_changer_invitation(s_obj.hint);

    log.info("Net spawned:", this.object.id(), s_obj.enabled, s_obj.hint);

    return true;
  },
  net_destroy(): void {
    log.info("Destroy:", this.object.name());
    deleteObject(this.object);
    object_binder.net_destroy(this);
  },
  net_save_relevant(target: XR_object_binder): boolean {
    return true;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "LevelChangerBinder");
    object_binder.save(this, packet);
    (get_global("xr_logic").save_obj as AnyCallable)(this.object, packet);
    setSaveMarker(packet, true, "LevelChangerBinder");
  },
  load(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "LevelChangerBinder");
    object_binder.load(this, packet);
    (get_global("xr_logic").xr_logic as AnyCallable)(this.object, packet);
    setSaveMarker(packet, true, "LevelChangerBinder");
  }
} as ILevelChangerBinder);
