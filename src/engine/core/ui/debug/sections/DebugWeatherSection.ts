import { LuabindClass } from "xray16";

import { AbstractDebugSection } from "@/engine/core/ui/debug/sections/AbstractDebugSection";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resolveXmlFile } from "@/engine/core/utils/ui";
import { TPath } from "@/engine/lib/types";

const base: TPath = "menu\\debug\\DebugWeatherSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugWeatherSection extends AbstractDebugSection {
  public initControls(): void {
    resolveXmlFile(base, this.xml);
  }

  public initCallBacks(): void {}

  public initState(): void {}
}
