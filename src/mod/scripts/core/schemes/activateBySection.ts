import { game, time_global, XR_game_object, XR_ini_file } from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { AnyObject, Optional, TName, TNumberId } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { registry } from "@/mod/scripts/core/database";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { resetGenericSchemesOnSchemeSwitch } from "@/mod/scripts/core/schemes/resetGenericSchemesOnSchemeSwitch";
import { sendToNearestAccessibleVertex } from "@/mod/scripts/utils/alife";
import { cfg_get_overrides, get_scheme_by_section } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { getObjectBoundSmart } from "@/mod/scripts/utils/gulag";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("activateBySection");

/**
 * todo
 * todo
 * todo
 * todo
 */
export function activateBySection(
  object: XR_game_object,
  ini: XR_ini_file,
  section: TSection,
  gulagName: TName,
  loading: boolean
): void {
  logger.info("Activate by section:", object.name(), section, gulagName);

  if (loading === null) {
    abort("core/logic: activate_by_section: loading field is null, true || false expected");
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
    const current_gulag = getObjectBoundSmart(object);

    if (current_gulag === null) {
      abort("core/logic: activate_by_section: section is NIL && NPC !in gulag.");
    }

    const t = current_gulag.getJob(objectId) as AnyObject;

    section = t.section;
  }

  if (!ini.section_exist(section)) {
    abort("object '%s': activate_by_section: section '%s' does !exist", object.name(), section);
  }

  const scheme: Optional<EScheme> = get_scheme_by_section(section);

  if (scheme === null) {
    abort("object '%s': unable to determine scheme name from section name '%s'", object.name(), section);
  }

  registry.objects.get(objectId).overrides = cfg_get_overrides(ini, section, object) as any;

  resetGenericSchemesOnSchemeSwitch(object, scheme, section);

  const filenameOrHandler = registry.schemes.get(scheme);

  if (filenameOrHandler === null) {
    abort("core/logic: scheme '%s' is !registered in modules.script", scheme);
  }

  logger.info("Set active scheme:", object.name(), scheme, section, gulagName);
  filenameOrHandler.setScheme(object, ini, scheme, section, gulagName);

  registry.objects.get(objectId).active_section = section;
  registry.objects.get(objectId).active_scheme = scheme;

  if (registry.objects.get(objectId).stype === ESchemeType.STALKER) {
    sendToNearestAccessibleVertex(object, object.level_vertex_id());

    issueEvent(object, registry.objects.get(objectId)[scheme], "activateScheme", loading, object);
  } else {
    issueEvent(object, registry.objects.get(objectId)[scheme], "resetScheme", loading, object);
  }
}
