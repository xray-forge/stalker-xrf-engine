import {
  alife,
  command_line,
  LuabindClass,
  object_binder,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { TSection } from "@/mod/lib/types/scheme";
import { LevelChanger } from "@/mod/scripts/core/alife/LevelChanger";
import { addObject, deleteObject, resetObject } from "@/mod/scripts/core/database";
import { loadObject, saveObject } from "@/mod/scripts/core/schemes/storing";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("LevelChangerBinder");

/**
 * todo;
 */
@LuabindClass()
export class LevelChangerBinder extends object_binder {
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo;
   */
  public override update(delta: number): void {
    super.update(delta);
  }

  /**
   * todo;
   */
  public override reload(section: TSection): void {
    super.reload(section);
  }

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  /**
   * todo;
   */
  public override net_spawn(cse_object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(cse_object)) {
      return false;
    }

    const [index] = string.find(command_line(), "-designer");

    if (index !== null) {
      return true;
    }

    addObject(this.object);

    const s_obj: LevelChanger = alife().object(this.object.id()) as LevelChanger;

    this.object.enable_level_changer(s_obj.enabled);
    this.object.set_level_changer_invitation(s_obj.hint);

    logger.info("Net spawned:", this.object.id(), s_obj.enabled, s_obj.hint);

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());
    deleteObject(this.object);
    super.net_destroy();
  }

  /**
   * todo;
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, LevelChangerBinder.__name);

    super.save(packet);
    saveObject(this.object, packet);

    setSaveMarker(packet, true, LevelChangerBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, LevelChangerBinder.__name);

    super.load(reader);
    loadObject(this.object, reader);

    setLoadMarker(reader, true, LevelChangerBinder.__name);
  }
}
