import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { ISchemeParticleState } from "@/engine/core/schemes/restrictor/sr_particle/ISchemeParticleState";
import { ParticleManager } from "@/engine/core/schemes/restrictor/sr_particle/ParticleManager";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeParticle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PARTICLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeParticleState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.name = readIniString(ini, section, "name", true, "");
    state.path = readIniString(ini, section, "path", true, "");
    state.mode = readIniNumber(ini, section, "mode", true);
    state.looped = readIniBoolean(ini, section, "looped", false);

    if (state.path === null || state.path === "") {
      abort("Scheme sr_particle: invalid path name");
    }

    if (state.mode !== 1 && state.mode !== 2) {
      abort("Scheme sr_particle: invalid mode");
    }
  }

  /**
   * Add scheme handler and subscribe it to events.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeParticleState
  ): void {
    SchemeParticle.subscribe(object, state, new ParticleManager(object, state));
  }
}
