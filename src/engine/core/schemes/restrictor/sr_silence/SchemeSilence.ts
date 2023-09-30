import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme/AbstractScheme";
import { SilenceManager } from "@/engine/core/schemes/restrictor/sr_silence/SilenceManager";
import { ISchemeSilenceState } from "@/engine/core/schemes/restrictor/sr_silence/sr_silence_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to implement zones where playing dynamic music is restricted.
 *
 * todo: Possibly deactivation part is missing for the scheme and was never implemented before.
 */
export class SchemeSilence extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_SILENCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override activate(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeSilenceState {
    const state: ISchemeSilenceState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    registry.silenceZones.set(object.id(), object.name());

    return state;
  }

  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSilenceState
  ): void {
    AbstractScheme.subscribe(object, state, new SilenceManager(object, state));
  }
}
