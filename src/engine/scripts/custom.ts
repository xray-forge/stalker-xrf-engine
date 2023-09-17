import { alife, class_info, clsid, level } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { ServerMonsterBaseObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
const target = level.get_target_obj();

if (target !== null) {
  const server = alife().object(target.id()) as ServerMonsterBaseObject;

  logger.info("Captured:", target.name());
  logger.info("CM:", target.character_community());
  logger.info("SDATA:", server.group, server.squad, server.team);
  logger.info("SDATA:", type(server.community), target.clsid(), clsid.boar, clsid.boar_s);

  for (const [k, v] of class_info(server).methods) {
    logger.info("XXZ:", k, v);
  }

  for (const [k, v] of class_info(server).attributes) {
    logger.info("XXV:", k, v, (server as any)[v]);
  }
}
