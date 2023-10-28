import { command_line, LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registerObject,
  registry,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { LevelChanger } from "@/engine/core/objects/LevelChanger";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, Reader, ServerObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class LevelChangerBinder extends object_binder {
  public override reinit(): void {
    super.reinit();
    resetObject(this.object);
  }

  public override net_spawn(cse_object: ServerObject): boolean {
    if (!super.net_spawn(cse_object)) {
      return false;
    }

    const [index] = string.find(command_line(), "-designer");

    if (index !== null) {
      return true;
    }

    registerObject(this.object);

    const serverObject: LevelChanger = registry.simulator.object(this.object.id()) as LevelChanger;

    this.object.enable_level_changer(serverObject.isEnabled);
    this.object.set_level_changer_invitation(serverObject.invitationHint);

    logger.info("Go online:", this.object.name(), serverObject.isEnabled, serverObject.invitationHint);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Go offline:", this.object.name());
    unregisterObject(this.object);
    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, LevelChangerBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, LevelChangerBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, LevelChangerBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, LevelChangerBinder.__name);
  }
}
