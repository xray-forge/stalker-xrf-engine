import { alife, level } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { AnomalyZoneBinder } from "@/engine/core/objects";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createEmptyVector } from "@/engine/core/utils/vector";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  EScheme,
  LuaArray,
  Optional,
  ServerObject,
  TDistance,
  TName,
  TNumberId,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);
