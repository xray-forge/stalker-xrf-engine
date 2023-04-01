import { XR_CUIScriptWnd } from "xray16";

import { DebugCommandsSection } from "@/engine/core/ui/debug/sections/DebugCommandsSection";
import { DebugGeneralSection } from "@/engine/core/ui/debug/sections/DebugGeneralSection";
import { DebugItemsSection } from "@/engine/core/ui/debug/sections/DebugItemsSection";
import { DebugPlayerSection } from "@/engine/core/ui/debug/sections/DebugPlayerSection";
import { DebugUiSection } from "@/engine/core/ui/debug/sections/DebugUiSection";
import { DevDebugPositionSection } from "@/engine/core/ui/debug/sections/DevDebugPositionSection";
import { DevDebugSoundSection } from "@/engine/core/ui/debug/sections/DevDebugSoundSection";
import { DevDebugSpawnSection } from "@/engine/core/ui/debug/sections/DevDebugSpawnSection";
import { DevDebugWorldSection } from "@/engine/core/ui/debug/sections/DevDebugWorldSection";

export enum EDebugSection {
  GENERAL = "general",
  COMMANDS = "commands",
  ITEMS = "items",
  POSITION = "position",
  PLAYER = "player",
  SOUND = "sound",
  SPAWN = "spawn",
  UI = "ui",
  WORLD = "world",
}

export const sectionsMap = {
  [EDebugSection.GENERAL]: (owner: XR_CUIScriptWnd) => new DebugGeneralSection(owner),
  [EDebugSection.COMMANDS]: (owner: XR_CUIScriptWnd) => new DebugCommandsSection(owner),
  [EDebugSection.ITEMS]: (owner: XR_CUIScriptWnd) => new DebugItemsSection(owner),
  [EDebugSection.POSITION]: (owner: XR_CUIScriptWnd) => new DevDebugPositionSection(owner),
  [EDebugSection.PLAYER]: (owner: XR_CUIScriptWnd) => new DebugPlayerSection(owner),
  [EDebugSection.SOUND]: (owner: XR_CUIScriptWnd) => new DevDebugSoundSection(owner),
  [EDebugSection.SPAWN]: (owner: XR_CUIScriptWnd) => new DevDebugSpawnSection(owner),
  [EDebugSection.UI]: (owner: XR_CUIScriptWnd) => new DebugUiSection(owner),
  [EDebugSection.WORLD]: (owner: XR_CUIScriptWnd) => new DevDebugWorldSection(owner),
};
