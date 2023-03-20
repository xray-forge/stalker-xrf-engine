import { jest } from "@jest/globals";
import { game_graph } from "xray16";

import { MockActionBase } from "@/fixtures/xray/mocks/actions/ActionBase.mock";
import { MockAnim } from "@/fixtures/xray/mocks/actions/anim.mock";
import { MockLook } from "@/fixtures/xray/mocks/actions/look.mock";
import { MockMove } from "@/fixtures/xray/mocks/actions/move.mock";
import { MockCGameGraph } from "@/fixtures/xray/mocks/CGameGraph.mock";
import { mockGetConsole } from "@/fixtures/xray/mocks/console.mock";
import { MockCSightParams } from "@/fixtures/xray/mocks/CSightParams.mock";
import { MockEffector } from "@/fixtures/xray/mocks/effector.mock";
import { mockGameInterface } from "@/fixtures/xray/mocks/gameInterface.mock";
import { mockSystemIni } from "@/fixtures/xray/mocks/ini.mock";
import { IniFile } from "@/fixtures/xray/mocks/IniFile.mock";
import { MockAlifeSmartZone } from "@/fixtures/xray/mocks/objects/cse_alife_smart_zone.mock";
import { MockDangerObject } from "@/fixtures/xray/mocks/objects/danger_object.mock";
import { MockObjectBinder } from "@/fixtures/xray/mocks/objects/object_binder.mock";
import { MockPropertyEvaluator } from "@/fixtures/xray/mocks/PropertyEvaluator.mock";
import { mockStalkerIds } from "@/fixtures/xray/mocks/stalkerIds.mock";
import { MockCUIScriptWnd } from "@/fixtures/xray/mocks/ui/CUIScriptWnd.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * todo;
 */
export function mockXRay16({
  CSightParams = MockCSightParams,
  action_base = MockActionBase,
  anim = MockAnim,
  cse_alife_smart_zone = MockAlifeSmartZone,
  CUIScriptWnd = MockCUIScriptWnd,
  editor = () => false,
  effector = MockEffector,
  danger_object = MockDangerObject,
  game = mockGameInterface,
  game_graph = () => new MockCGameGraph(),
  get_console = mockGetConsole,
  ini_file = IniFile,
  look = MockLook,
  move = MockMove,
  object_binder = MockObjectBinder,
  property_evaluator = MockPropertyEvaluator,
  stalker_ids = mockStalkerIds,
  system_ini = mockSystemIni,
  vector = MockVector,
} = {}): void {
  jest.mock("xray16", () => ({
    CSightParams,
    LuabindClass: () => {},
    action_base,
    anim,
    cse_alife_smart_zone,
    CUIScriptWnd,
    editor,
    effector,
    danger_object,
    game,
    game_graph,
    get_console,
    ini_file,
    look,
    move,
    object_binder,
    property_evaluator,
    stalker_ids,
    system_ini,
    vector,
  }));
}
