import { CScriptXmlInit, CUIScriptWnd, CUIWindow, LuabindClass } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { TName, XmlInit } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Abstract debug section to display in debug settings.
 */
@LuabindClass()
export abstract class AbstractDebugSection extends CUIWindow {
  public owner: CUIScriptWnd;
  public xml: XmlInit;

  public constructor(owner: CUIScriptWnd, name?: TName) {
    super();

    this.owner = owner;
    this.xml = new CScriptXmlInit();

    this.SetWindowName(name || this.__name);

    this.initializeControls();
    this.initializeCallBacks();
    this.initializeState();
  }

  /**
   * Initialize controls on first render for debug section.
   */
  public abstract initializeControls(): void;

  /**
   * Initialize controls handlers on first render for debug section.
   */
  public initializeCallBacks(): void {}

  /**
   * Initialize debug form view representation based on data.
   */
  public initializeState(): void {}
}
