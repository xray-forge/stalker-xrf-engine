import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resolveXmlFormPath } from "@/mod/scripts/utils/ui";
import { zero_one_cmds, on_off_cmds } from "@/mod/ui/menu/debug/sections";

const base: string = "menu\\debug\\DebugCommandsSection.component";
const log: LuaLogger = new LuaLogger("DebugCommandsSection");

export interface IDebugCommandsSection extends XR_CUIScriptWnd {
  owner: XR_CUIScriptWnd;

  commandsList: XR_CUIScrollView;

  InitControls(): void;
  InitCallBacks(): void;
  InitState(): void;
  InitEntry(name: string, xml: XR_CScriptXmlInit, console: XR_CConsole, type: "numeric" | "boolean"): void;

  onCheckboxChange(check: XR_CUICheckButton, name: string, type: "numeric" | "boolean"): void;
}

export const DebugCommandsSection: IDebugCommandsSection = declare_xr_class("DebugCommandsSection", CUIWindow, {
  __init(this: IDebugCommandsSection, owner: XR_CUIScriptWnd): void {
    xr_class_super();

    log.info("Init");

    this.owner = owner;

    this.InitControls();
    this.InitCallBacks();
    this.InitState();
  },
  __finalize(): void {
    log.info("Finalize");
  },
  InitControls(): void {
    log.info("Init controls");

    const xml: XR_CScriptXmlInit = new CScriptXmlInit();
    const console: XR_CConsole = get_console();

    xml.ParseFile(resolveXmlFormPath(base));

    this.commandsList = xml.InitScrollView("commands_list", this);

    zero_one_cmds.forEach((it) => this.InitEntry(it, xml, console, "numeric"));
    on_off_cmds.forEach((it) => this.InitEntry(it, xml, console, "boolean"));
  },
  InitCallBacks(): void {
    log.info("Init callbacks");
  },
  InitState(): void {
    log.info("Init state");
  },
  InitEntry(name: string, xml: XR_CScriptXmlInit, console: XR_CConsole, type: "numeric" | "boolean"): void {
    log.info("Init item:", name);

    const item: XR_CUIStatic = xml.InitStatic("command_item", this.commandsList);
    const caption: XR_CUIStatic = xml.InitStatic("command_label", item);
    const check: XR_CUICheckButton = xml.InitCheck("command_item_" + name, item);

    const value: Optional<boolean> = console.get_bool(name);

    log.info("Set item:", name, value);

    check.SetCheck(value);
    caption.TextControl().SetText(name);

    this.owner.Register(check, name);
    this.owner.AddCallback(name, ui_events.CHECK_BUTTON_SET, () => this.onCheckboxChange(check, name, type), this);
    this.owner.AddCallback(name, ui_events.CHECK_BUTTON_RESET, () => this.onCheckboxChange(check, name, type), this);
  },
  onCheckboxChange(check: XR_CUICheckButton, name: string, type: "numeric" | "boolean"): void {
    const isEnabled: boolean = check.GetCheck();

    let cmd: string = name + " ";

    if (type === "boolean") {
      cmd += isEnabled ? "on" : "off";
    } else {
      cmd += isEnabled ? "1" : "0";
    }

    log.info("Value toggle:", type, cmd);
    get_console().execute(cmd);
  }
} as IDebugCommandsSection);
