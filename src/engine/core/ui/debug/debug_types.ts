import { CUIScriptWnd } from "xray16";

import { DebugCommandsSection } from "@/engine/core/ui/debug/sections/DebugCommandsSection";
import { DebugGeneralSection } from "@/engine/core/ui/debug/sections/DebugGeneralSection";
import { DebugItemsSection } from "@/engine/core/ui/debug/sections/DebugItemsSection";
import { DebugObjectSection } from "@/engine/core/ui/debug/sections/DebugObjectSection";
import { DebugPlayerSection } from "@/engine/core/ui/debug/sections/DebugPlayerSection";
import { DebugPositionSection } from "@/engine/core/ui/debug/sections/DebugPositionSection";
import { DebugRegistrySection } from "@/engine/core/ui/debug/sections/DebugRegistrySection";
import { DebugSoundSection } from "@/engine/core/ui/debug/sections/DebugSoundSection";
import { DebugSpawnSection } from "@/engine/core/ui/debug/sections/DebugSpawnSection";
import { DebugTaskSection } from "@/engine/core/ui/debug/sections/DebugTaskSection";
import { DebugTeleportSection } from "@/engine/core/ui/debug/sections/DebugTeleportSection";
import { DebugTreasuresSection } from "@/engine/core/ui/debug/sections/DebugTreasuresSection";

/**
 * Possible debug sections to attach and edit game functionality.
 */
export enum EDebugSection {
  COMMANDS = "commands",
  GENERAL = "general",
  ITEMS = "items",
  OBJECT = "object",
  PLAYER = "player",
  POSITION = "position",
  REGISTRY = "registry",
  SOUND = "sound",
  SPAWN = "spawn",
  TASK = "task",
  TELEPORT = "teleport",
  TREASURES = "treasures",
}

export const sectionsMap = {
  [EDebugSection.COMMANDS]: (owner: CUIScriptWnd) => new DebugCommandsSection(owner),
  [EDebugSection.GENERAL]: (owner: CUIScriptWnd) => new DebugGeneralSection(owner),
  [EDebugSection.ITEMS]: (owner: CUIScriptWnd) => new DebugItemsSection(owner),
  [EDebugSection.OBJECT]: (owner: CUIScriptWnd) => new DebugObjectSection(owner),
  [EDebugSection.PLAYER]: (owner: CUIScriptWnd) => new DebugPlayerSection(owner),
  [EDebugSection.POSITION]: (owner: CUIScriptWnd) => new DebugPositionSection(owner),
  [EDebugSection.REGISTRY]: (owner: CUIScriptWnd) => new DebugRegistrySection(owner),
  [EDebugSection.SOUND]: (owner: CUIScriptWnd) => new DebugSoundSection(owner),
  [EDebugSection.SPAWN]: (owner: CUIScriptWnd) => new DebugSpawnSection(owner),
  [EDebugSection.TASK]: (owner: CUIScriptWnd) => new DebugTaskSection(owner),
  [EDebugSection.TELEPORT]: (owner: CUIScriptWnd) => new DebugTeleportSection(owner),
  [EDebugSection.TREASURES]: (owner: CUIScriptWnd) => new DebugTreasuresSection(owner),
};
