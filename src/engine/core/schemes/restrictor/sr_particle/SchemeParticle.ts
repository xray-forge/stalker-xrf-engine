import { AbstractScheme } from "@/engine/core/ai/scheme";
import { ParticleManager } from "@/engine/core/schemes/restrictor/sr_particle/ParticleManager";
import {
  EParticleBehaviour,
  ISchemeParticleState,
} from "@/engine/core/schemes/restrictor/sr_particle/sr_particale_types";
import { abort } from "@/engine/core/utils/assertion";
import { getConfigSwitchConditions, readIniBoolean, readIniNumber, readIniString } from "@/engine/core/utils/ini";
import { EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export class SchemeParticle extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_PARTICLE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeParticleState {
    const state: ISchemeParticleState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);
    state.name = readIniString(ini, section, "name", true);
    state.path = readIniString(ini, section, "path", true);
    state.mode = readIniNumber(ini, section, "mode", true);
    state.looped = readIniBoolean(ini, section, "looped", false);

    if (state.path === null || state.path === "") {
      abort("Scheme sr_particle: invalid path name in configuration.");
    }

    if (state.mode !== EParticleBehaviour.SIMPLE && state.mode !== EParticleBehaviour.COMPLEX) {
      abort("Scheme sr_particle: invalid mode in configuration.");
    }

    return state;
  }

  public static override add(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeParticleState
  ): void {
    AbstractScheme.subscribe(state, new ParticleManager(object, state));
  }
}
