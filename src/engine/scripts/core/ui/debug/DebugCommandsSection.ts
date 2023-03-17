import {
  CScriptXmlInit,
  CUIWindow,
  get_console,
  LuabindClass,
  ui_events,
  XR_CConsole,
  XR_CScriptXmlInit,
  XR_CUICheckButton,
  XR_CUIScriptWnd,
  XR_CUIScrollView,
  XR_CUIStatic,
} from "xray16";

import { on_off_cmds, zero_one_cmds } from "@/engine/forms/menu/debug/sections";
import { Optional } from "@/engine/lib/types";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { resolveXmlFormPath } from "@/engine/scripts/utils/ui";

const base: string = "menu\\debug\\DebugCommandsSection.component";
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class DebugCommandsSection extends CUIWindow {
  public owner: XR_CUIScriptWnd;
  public commandsList!: XR_CUIScrollView;

  /**
   * todo;
   */
  public constructor(owner: XR_CUIScriptWnd) {
    super();

    this.owner = owner;

    this.initControls();
    this.initCallBacks();
    this.initState();
  }

  /**
   * todo;
   */
  public initControls(): void {
    const xml: XR_CScriptXmlInit = new CScriptXmlInit();
    const console: XR_CConsole = get_console();

    xml.ParseFile(resolveXmlFormPath(base));

    this.commandsList = xml.InitScrollView("commands_list", this);

    zero_one_cmds.forEach((it) => this.initEntry(it, xml, console, "numeric"));
    on_off_cmds.forEach((it) => this.initEntry(it, xml, console, "boolean"));
  }

  /**
   * todo;
   */
  public initCallBacks(): void {}

  /**
   * todo;
   */
  public initState(): void {
    logger.info("Init state");
  }

  /**
   * todo;
   */
  public initEntry(name: string, xml: XR_CScriptXmlInit, console: XR_CConsole, type: "numeric" | "boolean"): void {
    logger.info("Init item:", name);

    const item: XR_CUIStatic = xml.InitStatic("command_item", this.commandsList);
    const caption: XR_CUIStatic = xml.InitStatic("command_label", item);
    const check: XR_CUICheckButton = xml.InitCheck("command_item_" + name, item);

    const value: Optional<boolean> = console.get_bool(name);

    logger.info("Set item:", name, value);

    check.SetCheck(value);
    caption.TextControl().SetText(name);

    this.owner.Register(check, name);
    this.owner.AddCallback(name, ui_events.CHECK_BUTTON_SET, () => this.onCheckboxChange(check, name, type), this);
    this.owner.AddCallback(name, ui_events.CHECK_BUTTON_RESET, () => this.onCheckboxChange(check, name, type), this);
  }

  /**
   * todo;
   */
  public onCheckboxChange(check: XR_CUICheckButton, name: string, type: "numeric" | "boolean"): void {
    const isEnabled: boolean = check.GetCheck();
    let cmd: string = name + " ";

    if (type === "boolean") {
      cmd += isEnabled ? "on" : "off";
    } else {
      cmd += isEnabled ? "1" : "0";
    }

    logger.info("Value toggle:", type, cmd);
    get_console().execute(cmd);
  }
}
