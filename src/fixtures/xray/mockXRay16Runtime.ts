import { jest } from "@jest/globals";
import {
  MockAlifeSimulator,
  MockCGameFont,
  MockCGameGraph,
  MockConsole,
  MockDevice,
  MockFileSystem,
  MockIniFile,
} from "xray16/mocks";

/**
 * Single runtime stand-in for the `xray16` engine module under jest/node.
 *
 * This file is the `^xray16$` `moduleNameMapper` target: every `require("xray16")` — from engine source, test
 * files, and the built `xray16/lib` in `node_modules` — resolves here, so there is ONE instance of each global.
 * A test doing `jest.spyOn(level, ...)` therefore affects the same object the lib reads. The real `xray16`
 * module only exists inside the game process.
 */

// Direct re-exports of the migrated `xray16/mocks` classes/objects under their engine global names.
export {
  MockCALifeSmartTerrainTask as CALifeSmartTerrainTask,
  MockCGameFont as CGameFont,
  MockCGameTask as CGameTask,
  MockCHelicopter as CHelicopter,
  MockPhraseDialog as CPhraseDialog,
  MockPhysicObject as CPhysicObject,
  MockCSavedGameWrapper as CSavedGameWrapper,
  MockCScriptXmlInit as CScriptXmlInit,
  MockCServerList as CServerList,
  MockCSightParams as CSightParams,
  MockCTime as CTime,
  MockCUI3tButton as CUI3tButton,
  MockCUICheckButton as CUICheckButton,
  MockCUIComboBox as CUIComboBox,
  MockCUICustomSpin as CUICustomSpin,
  MockCUIEditBox as CUIEditBox,
  MockCUIListBox as CUIListBox,
  MockCUIListBoxItem as CUIListBoxItem,
  MockCUIListBoxItemMsgChain as CUIListBoxItemMsgChain,
  MockCUIMMShniaga as CUIMMShniaga,
  MockCUIMapInfo as CUIMapInfo,
  MockCUIMapList as CUIMapList,
  MockCUIMessageBoxEx as CUIMessageBoxEx,
  MockCUIScriptWnd as CUIScriptWnd,
  MockCUIScrollView as CUIScrollView,
  MockCUISpinFlt as CUISpinFlt,
  MockCUISpinNum as CUISpinNum,
  MockCUISpinText as CUISpinText,
  MockCUIStatic as CUIStatic,
  MockCUITabControl as CUITabControl,
  MockCUITextWnd as CUITextWnd,
  MockCUITrackBar as CUITrackBar,
  MockCUIWindow as CUIWindow,
  MockCZoneCampfire as CZoneCampfire,
  mockDikKeys as DIK_keys,
  MockFbox as Fbox,
  MockFileSystem as FS,
  MockFrect as Frect,
  MockGameType as GAME_TYPE,
  mockGetARGB as GetARGB,
  MockActionBase as action_base,
  MockActionPlanner as action_planner,
  mockActorStatsInterface as actor_stats,
  MockAnim as anim,
  mockCallbacks as callback,
  mockCastPlanner as cast_planner,
  mockClsid as clsid,
  MockColor as color,
  mockCommandLine as command_line,
  MockCond as cond,
  MockConnectErrorCb as connect_error_cb,
  mockCreateIniFile as create_ini_file,
  MockAlifeCreatureActor as cse_alife_creature_actor,
  MockAlifeDynamicObject as cse_alife_dynamic_object,
  MockAlifeDynamicObjectVisual as cse_alife_dynamic_object_visual,
  MockAlifeHelicopter as cse_alife_helicopter,
  MockAlifeHumanStalker as cse_alife_human_stalker,
  MockAlifeInventoryBox as cse_alife_inventory_box,
  MockAlifeItem as cse_alife_item,
  MockAlifeItemAmmo as cse_alife_item_ammo,
  MockAlifeItemArtefact as cse_alife_item_artefact,
  MockAlifeItemOutfit as cse_alife_item_custom_outfit,
  MockAlifeItemDetector as cse_alife_item_detector,
  MockAlifeItemExplosive as cse_alife_item_explosive,
  MockAlifeItemGrenade as cse_alife_item_grenade,
  MockAlifeItemHelmet as cse_alife_item_helmet,
  MockAlifeItemPda as cse_alife_item_pda,
  MockAlifeItemTorch as cse_alife_item_torch,
  MockAlifeItemWeapon as cse_alife_item_weapon,
  MockAlifeItemWeaponAutoShotgun as cse_alife_item_weapon_auto_shotgun,
  MockAlifeItemWeaponMagazined as cse_alife_item_weapon_magazined,
  MockAlifeItemWeaponMagazinedWGL as cse_alife_item_weapon_magazined_w_gl,
  MockAlifeItemWeaponShotgun as cse_alife_item_weapon_shotgun,
  MockAlifeLevelChanger as cse_alife_level_changer,
  MockAlifeMonsterBase as cse_alife_monster_base,
  MockAlifeHangingLamp as cse_alife_object_hanging_lamp,
  MockAlifeObjectPhysic as cse_alife_object_physic,
  MockAlifeOnlineOfflineGroup as cse_alife_online_offline_group,
  MockAlifeSmartZone as cse_alife_smart_zone,
  MockSpaceRestrictor as cse_alife_space_restrictor,
  MockAnomalousZone as cse_anomalous_zone,
  MockAlifeSmartCover as cse_smart_cover,
  MockTorridZone as cse_torrid_zone,
  MockZoneVisual as cse_zone_visual,
  MockDangerObject as danger_object,
  MockEffector as effector,
  MockEntityAction as entity_action,
  MockFlags32 as flags32,
  mockGameInterface as game,
  MockGameObject as game_object,
  mockGetGameHud as get_hud,
  MockHangingLamp as hanging_lamp,
  MockHit as hit,
  MockIniFile as ini_file,
  mockLevelInterface as level,
  MockLoginOperationCb as login_operation_cb,
  MockLook as look,
  mockMainMenuInterface as main_menu,
  MockMove as move,
  MockNoise as noise,
  MockObject as object,
  MockObjectBinder as object_binder,
  MockParticleObject as particles_object,
  MockPatrol as patrol,
  MockPhysicsJoint as physics_joint,
  MockPhysicsShell as physics_shell,
  MockProfile as profile,
  MockProfileTimer as profile_timer,
  MockPropertiesHelper as properties_helper,
  MockPropertyEvaluator as property_evaluator,
  MockPropertyStorage as property_storage,
  mockRelationRegistryInterface as relation_registry,
  MockSightParameters as sight_params,
  mockSndType as snd_type,
  MockSound as sound,
  MockSoundObject as sound_object,
  mockStalkerIds as stalker_ids,
  MockTask as task,
  mockUiEvents as ui_events,
  MockVector as vector,
  MockVector2D as vector2,
  MockWorldProperty as world_property,
  MockWorldState as world_state,
} from "xray16/mocks";

// Globals with behaviour beyond a plain mock re-export (computed values, singletons, primitive helpers).
export const GetFontDI = jest.fn(() => new MockCGameFont());
export const GetFontGraffiti19Russian = jest.fn(() => new MockCGameFont());
export const GetFontGraffiti22Russian = jest.fn(() => new MockCGameFont());
export const GetFontGraffiti32Russian = jest.fn(() => new MockCGameFont());
export const GetFontGraffiti50Russian = jest.fn(() => new MockCGameFont());
export const GetFontLetterica16Russian = jest.fn(() => new MockCGameFont());
export const GetFontLetterica18Russian = jest.fn(() => new MockCGameFont());
export const GetFontLetterica25 = jest.fn(() => new MockCGameFont());
export const GetFontMedium = jest.fn(() => new MockCGameFont());
export const GetFontSmall = jest.fn(() => new MockCGameFont());
export const IsDynamicMusic = jest.fn(() => true);
export const IsGameTypeSingle = jest.fn(() => true);
export const IsImportantSave = jest.fn(() => true);

export const alife = jest.fn(() => MockAlifeSimulator.mock());
export const bit_and = jest.fn((first: number, second: number) => first & second);
export const bit_or = jest.fn((first: number, second: number) => first | second);
export const device = jest.fn(() => MockDevice.getInstance());
export const editor = jest.fn(() => false);
export const game_graph = jest.fn((): MockCGameGraph => MockCGameGraph.getInstance());
export const getFS = jest.fn((): MockFileSystem => MockFileSystem.getInstance());
export const get_console = jest.fn((): MockConsole => MockConsole.getInstance());
export const log = jest.fn();
export const print_stack = jest.fn();
export const set_start_game_vertex_id = jest.fn();
export const set_start_position = jest.fn();
export const system_ini = jest.fn(() => MockIniFile.mock("system.ini"));
export const time_global = jest.fn(() => Date.now());
export const user_name = jest.fn(() => "os_user_name");
export const verify_if_thread_is_running = jest.fn((): void => {});

export function LuabindClass(): void {}
