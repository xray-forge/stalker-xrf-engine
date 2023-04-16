import { CScriptXmlInit, CUIWindow, LuabindClass, XR_CScriptXmlInit, XR_CUIScriptWnd } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export abstract class AbstractDebugSection extends CUIWindow {
  public owner: XR_CUIScriptWnd;
  public xml: XR_CScriptXmlInit;

  public constructor(owner: XR_CUIScriptWnd, name: TName = AbstractDebugSection.__name) {
    super();

    this.owner = owner;
    this.xml = new CScriptXmlInit();

    this.SetWindowName(name);

    this.initializeControls();
    this.initializeCallBacks();
    this.initializeState();
  }

  /**
   * todo: Description.
   */
  public abstract initializeControls(): void;

  /**
   * todo: Description.
   */
  public abstract initializeCallBacks(): void;

  /**
   * todo: Description.
   */
  public abstract initializeState(): void;
}
