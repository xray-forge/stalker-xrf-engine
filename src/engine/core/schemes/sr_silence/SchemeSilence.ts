import { registry } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/schemes/base/AbstractScheme";
import { ISchemeSilenceState } from "@/engine/core/schemes/sr_silence/ISchemeSilenceState";
import { SilenceManager } from "@/engine/core/schemes/sr_silence/SilenceManager";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, IniFile } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme to implement zones where playing dynamic music is restricted.
 */
export class SchemeSilence extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_SILENCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    const state: ISchemeSilenceState = AbstractScheme.assign(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section);

    registry.silenceZones.set(object.id(), object.name());
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeSilenceState
  ): void {
    SchemeSilence.subscribe(object, state, new SilenceManager(object, state));
  }
}
