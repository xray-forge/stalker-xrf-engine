import { game, time_global, XR_game_object, XR_ini_file } from "xray16";

import { STRINGIFIED_NIL } from "@/engine/lib/constants/lua";
import { Optional, TNumberId } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";
import { registry } from "@/engine/scripts/core/database";
import { SmartTerrain } from "@/engine/scripts/core/objects/alife/smart/SmartTerrain";
import { ESchemeEvent } from "@/engine/scripts/core/schemes/base/index";
import { issueSchemeEvent } from "@/engine/scripts/core/schemes/issueSchemeEvent";
import { resetGenericSchemesOnSchemeSwitch } from "@/engine/scripts/core/schemes/resetGenericSchemesOnSchemeSwitch";
import { sendToNearestAccessibleVertex } from "@/engine/scripts/utils/alife";
import { getConfigOverrides, getSchemeBySection } from "@/engine/scripts/utils/config";
import { abort } from "@/engine/scripts/utils/debug";
import { getObjectBoundSmart } from "@/engine/scripts/utils/gulag";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 * todo
 * todo
 * todo
 */
export function activateSchemeBySection(
  object: XR_game_object,
  ini: XR_ini_file,
  section: TSection,
  additional: Optional<string>,
  loading: boolean
): void {
  logger.info("Activate by section:", object.name(), section, additional);

  if (loading === null) {
    abort("core/logic: activateBySection: loading field is null, true || false expected");
  }

  const objectId: TNumberId = object.id();

  if (!loading) {
    registry.objects.get(objectId).activation_time = time_global();
    registry.objects.get(objectId).activation_game_time = game.get_game_time();
  }

  if (section === STRINGIFIED_NIL) {
    registry.objects.get(objectId).overrides = null;
    resetGenericSchemesOnSchemeSwitch(object, EScheme.NIL, STRINGIFIED_NIL);
    registry.objects.get(objectId).active_section = null;
    registry.objects.get(objectId).active_scheme = null;

    return;
  }

  if (section === null) {
    const currentSmartTerrain: Optional<SmartTerrain> = getObjectBoundSmart(object);

    if (currentSmartTerrain === null) {
      abort("core/logic: activate_by_section: section is NIL && NPC !in gulag.");
    }

    const job = currentSmartTerrain.getJob(objectId)!;

    section = job.section;
  }

  if (!ini.section_exist(section)) {
    abort("object '%s': activate_by_section: section '%s' does !exist", object.name(), section);
  }

  const scheme: Optional<EScheme> = getSchemeBySection(section);

  if (scheme === null) {
    abort("object '%s': unable to determine scheme name from section name '%s'", object.name(), section);
  }

  registry.objects.get(objectId).overrides = getConfigOverrides(ini, section, object) as any;

  resetGenericSchemesOnSchemeSwitch(object, scheme, section);

  const schemeImplementation = registry.schemes.get(scheme);

  if (schemeImplementation === null) {
    abort("core/logic: scheme '%s' is !registered in modules.script", scheme);
  }

  logger.info("Set active scheme:", object.name(), scheme, section, additional);
  schemeImplementation.setScheme(object, ini, scheme, section as TSection, additional);

  registry.objects.get(objectId).active_section = section;
  registry.objects.get(objectId).active_scheme = scheme;

  if (registry.objects.get(objectId).stype === ESchemeType.STALKER) {
    sendToNearestAccessibleVertex(object, object.level_vertex_id());
    issueSchemeEvent(object, registry.objects.get(objectId)[scheme]!, ESchemeEvent.ACTIVATE_SCHEME, loading, object);
  } else {
    issueSchemeEvent(object, registry.objects.get(objectId)[scheme]!, ESchemeEvent.RESET_SCHEME, loading, object);
  }
}
