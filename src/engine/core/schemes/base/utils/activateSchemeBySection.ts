import { game, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ISmartTerrainJob } from "@/engine/core/objects/server/smart_terrain/types";
import { ESchemeEvent, TAbstractSchemeConstructor } from "@/engine/core/schemes";
import { resetObjectGenericSchemesOnSectionSwitch } from "@/engine/core/schemes/base/utils/resetObjectGenericSchemesOnSectionSwitch";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { getObjectConfigOverrides } from "@/engine/core/utils/ini/config";
import { getSchemeFromSection } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain, sendToNearestAccessibleVertex } from "@/engine/core/utils/object/object_general";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/logic";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, IniFile, Optional, TNumberId } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 * todo
 * todo
 * todo
 */
export function activateSchemeBySection(
  object: ClientObject,
  ini: IniFile,
  section: TSection,
  additional: Optional<string>,
  loading: boolean
): void {
  logger.info("Activate scheme:", object.name(), section, additional);

  assertDefined(loading, "core/logic: activateBySection: loading field is null, true || false expected");

  const objectId: TNumberId = object.id();

  if (!loading) {
    registry.objects.get(objectId).activation_time = time_global();
    registry.objects.get(objectId).activation_game_time = game.get_game_time();
  }

  if (section === NIL) {
    registry.objects.get(objectId).overrides = null;
    resetObjectGenericSchemesOnSectionSwitch(object, EScheme.NIL, NIL);
    registry.objects.get(objectId).active_section = null;
    registry.objects.get(objectId).active_scheme = null;

    return;
  }

  if (section === null) {
    const currentSmartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    if (currentSmartTerrain === null) {
      abort("core/logic: activate_by_section: section is NIL && NPC !in gulag.");
    }

    const job: ISmartTerrainJob = currentSmartTerrain.getJob(objectId)!;

    section = job.section;
  }

  if (!ini.section_exist(section)) {
    abort("object '%s': activate_by_section: section '%s' does !exist", object.name(), section);
  }

  const scheme: Optional<EScheme> = getSchemeFromSection(section);

  assertDefined(scheme, "object '%s': unable to determine scheme name from section name '%s'", object.name(), section);

  registry.objects.get(objectId).overrides = getObjectConfigOverrides(ini, section, object) as any;

  resetObjectGenericSchemesOnSectionSwitch(object, scheme, section);

  const schemeImplementation: Optional<TAbstractSchemeConstructor> = registry.schemes.get(scheme);

  if (schemeImplementation === null) {
    abort("core/logic: scheme '%s' is !registered in modules.script", scheme);
  }

  logger.info("Set active scheme:", scheme, "->", object.name(), section, additional);
  schemeImplementation.activate(object, ini, scheme, section as TSection, additional);

  registry.objects.get(objectId).active_section = section;
  registry.objects.get(objectId).active_scheme = scheme;

  if (registry.objects.get(objectId).schemeType === ESchemeType.STALKER) {
    sendToNearestAccessibleVertex(object, object.level_vertex_id());
    emitSchemeEvent(object, registry.objects.get(objectId)[scheme]!, ESchemeEvent.ACTIVATE_SCHEME, loading, object);
  } else {
    emitSchemeEvent(object, registry.objects.get(objectId)[scheme]!, ESchemeEvent.RESET_SCHEME, loading, object);
  }
}
