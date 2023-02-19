import { game, time_global, XR_game_object, XR_ini_file } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { registry } from "@/mod/scripts/core/db";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { resetGenericSchemesOnSchemeSwitch } from "@/mod/scripts/core/schemes/resetGenericSchemesOnSchemeSwitch";
import { sendToNearestAccessibleVertex } from "@/mod/scripts/utils/alife";
import { cfg_get_overrides, get_scheme_by_section } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { get_npc_smart } from "@/mod/scripts/utils/gulag";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("activateBySection");

/**
 * todo
 * todo
 * todo
 * todo
 */
export function activateBySection(
  npc: XR_game_object,
  ini: XR_ini_file,
  section: TSection,
  gulag_name: string,
  loading: boolean
): void {
  logger.info("Activate by section:", npc.name(), section, gulag_name);

  if (loading === null) {
    abort("core/logic: activate_by_section: loading field is null, true || false expected");
  }

  const npc_id = npc.id();

  if (!loading) {
    registry.objects.get(npc_id).activation_time = time_global();
    // -- GAMETIME added by Stohe.
    registry.objects.get(npc_id).activation_game_time = game.get_game_time();
  }

  if (section === "nil") {
    registry.objects.get(npc_id).overrides = null;
    resetGenericSchemesOnSchemeSwitch(npc, EScheme.NIL, "nil");
    registry.objects.get(npc_id).active_section = null;
    registry.objects.get(npc_id).active_scheme = null;

    return;
  }

  if (section === null) {
    const current_gulag = get_npc_smart(npc);

    if (current_gulag === null) {
      abort("core/logic: activate_by_section: section is NIL && NPC !in gulag.");
    }

    const t = current_gulag.getJob(npc_id) as AnyObject;

    section = t.section;
  }

  if (!ini.section_exist(section)) {
    abort("object '%s': activate_by_section: section '%s' does !exist", npc.name(), section);
  }

  const scheme: Optional<EScheme> = get_scheme_by_section(section);

  if (scheme === null) {
    abort("object '%s': unable to determine scheme name from section name '%s'", npc.name(), section);
  }

  registry.objects.get(npc_id).overrides = cfg_get_overrides(ini, section, npc) as any;

  resetGenericSchemesOnSchemeSwitch(npc, scheme, section);

  const filenameOrHandler = registry.schemes.get(scheme);

  if (filenameOrHandler === null) {
    abort("core/logic: scheme '%s' is !registered in modules.script", scheme);
  }

  logger.info("Set active scheme:", npc.name(), scheme, section, gulag_name);
  filenameOrHandler.set_scheme(npc, ini, scheme, section, gulag_name);

  registry.objects.get(npc_id).active_section = section;
  registry.objects.get(npc_id).active_scheme = scheme;

  if (registry.objects.get(npc_id).stype === ESchemeType.STALKER) {
    // -- ����� �������� ����������� �������� �� ���� ��� ��������� ������������
    sendToNearestAccessibleVertex(npc, npc.level_vertex_id());

    issueEvent(npc, registry.objects.get(npc_id)[scheme], "activate_scheme", loading, npc);
  } else {
    issueEvent(npc, registry.objects.get(npc_id)[scheme], "reset_scheme", loading, npc);
  }
}
