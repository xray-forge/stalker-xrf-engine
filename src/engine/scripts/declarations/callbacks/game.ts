import { calculateObjectVisibility, selectBestStalkerWeapon } from "@/engine/core/ai/combat";
import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LoadoutManager } from "@/engine/core/managers/loadout";
import { GameOutroManager } from "@/engine/core/managers/outro";
import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";
import { SaveManager } from "@/engine/core/managers/save";
import { TradeManager } from "@/engine/core/managers/trade";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, ServerObject, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind game externals");

/**
 * Declare `main` function to enable custom scripts execution.
 * In case if custom script is executed from console and has no `main` function, this placeholder will be used.
 */
extern("main", () => {});

/**
 * Declare method for all dynamic objects unregister event.
 * Good place to remove ids from persistent tables and clean up all object data.
 */
extern("CSE_ALifeDynamicObject_on_unregister", (id: TNumberId) => {
  EventsManager.emitEvent(EGameEvent.SERVER_OBJECT_UNREGISTERED, id);
});

/**
 * Handle event before level change.
 * As an idea - clear corpses or other cleanup logics parts.
 */
extern("CALifeUpdateManager__on_before_change_level", (packet: NetPacket) => {
  logger.info("On before level change callback");

  EventsManager.emitEvent(EGameEvent.BEFORE_LEVEL_CHANGE, packet);
});

/**
 * Declare list of available smart covers for game engine.
 * Xray uses it internally.
 */
extern("smart_covers", {
  descriptions: smartCoversList,
});

/**
 * Module of callbacks related to game outro.
 */
extern("outro", {
  conditions: gameOutroConfig.OUTRO_CONDITIONS,
  start_bk_sound: () => getManager(GameOutroManager).startBlackScreenAndSound(),
  stop_bk_sound: () => getManager(GameOutroManager).stopBlackScreenAndSound(),
  update_bk_sound_fade_start: (factor: number) =>
    getManager(GameOutroManager).updateBlackScreenAndSoundFadeStart(factor),
  update_bk_sound_fade_stop: (factor: number) => getManager(GameOutroManager).updateBlackScreenAndSoundFadeStop(factor),
});

/**
 * Trading callbacks module.
 * Adjust pricing / trading from lua.
 */
extern("trade_manager", {
  get_sell_discount: (objectId: TNumberId) => getManager(TradeManager).getSellDiscountForObject(objectId),
  get_buy_discount: (objectId: TNumberId) => getManager(TradeManager).getBuyDiscountForObject(objectId),
});

/**
 * AlifeStorage callbacks module.
 * Includes methods working with game saves to provide alternatives for storage packets.
 * Alternative variants are:
 *  - Flexible, not hardcoded, can contain extensive data
 *  - Not limited by game save file upper limits
 */
extern("alife_storage_manager", {
  /**
   * Called from game engine on loading game save.
   */
  CALifeStorageManager_load: (saveName: TName) => getManager(SaveManager).onGameLoad(saveName),
  /**
   * Called from game engine after successful game load.
   */
  CALifeStorageManager_after_load: (saveName: TName) => getManager(SaveManager).onAfterGameLoad(saveName),
  /**
   * Called from game engine just before creating game save.
   */
  CALifeStorageManager_before_save: (saveName: TName) => getManager(SaveManager).onBeforeGameSave(saveName),
  /**
   * Called from game engine when game save is created.
   */
  CALifeStorageManager_save: (saveName: TName) => getManager(SaveManager).onGameSave(saveName),
});

/**
 * Callbacks related to game input from player.
 */
extern("level_input", {
  on_key_press: (key: TNumberId, bind: TNumberId) => getManager(ActorInputManager).onKeyPress(key, bind),
});

/**
 * Callbacks related to objects visibility and memory calculation for AI logics execution.
 */
extern("visual_memory_manager", {
  get_visible_value: calculateObjectVisibility,
});

/**
 * Callbacks related to objects AI logics calculation and execution.
 */
extern("ai_stalker", {
  update_best_weapon: selectBestStalkerWeapon,
  CSE_ALifeObject_spawn_supplies: (object: ServerObject, id: TNumberId, iniData: string) => {
    return getManager(LoadoutManager).onGenerateServerObjectLoadout(object, id, iniData);
  },
});
