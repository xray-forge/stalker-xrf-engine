import { smartCoversList } from "@/engine/core/animation/smart_covers";
import { getManager } from "@/engine/core/database";
import { GameOutroManager } from "@/engine/core/managers/outro";
import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";
import { SaveManager } from "@/engine/core/managers/save";
import { TradeManager } from "@/engine/core/managers/trade";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind game externals");

/**
 * Declare `main` function to enable custom scripts execution.
 * In case if custom script is executed from console and has no `main` function, this placeholder will be used.
 */
extern("main", () => {});

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
 * todo: Input callback.
 */
extern("level_input", {
  on_key_press: (key: TName, bind: TName) => logger.info("Todo: %s -> %s", key, bind),
});

extern("visual_memory_manager", {
  /**
   *
   * //Alundaio: hijack not_yet_visible_object to lua
   *     luabind::functor<float> funct;
   *     if (GEnv.ScriptEngine->functor("visual_memory_manager.get_visible_value", funct))
   *         return (funct(m_object ? m_object->lua_game_object() : nullptr, game_object
   *         ? game_object->lua_game_object()
   *         : nullptr, time_delta, current_state().m_time_quant, luminocity, current_state().m_velocity_factor,
   *         object_velocity, distance, object_distance, always_visible_distance));
   *     //-Alundaio
   */
});

/**
 * CALifeUpdateManager
 *     if (GEnv.ScriptEngine->functor("_G.CALifeUpdateManager__on_before_change_level", funct))
 *         funct(&net_packet);
 */

/**
 *  luabind::functor<void> funct;
 *     if (GEnv.ScriptEngine->functor("_G.CSE_ALifeDynamicObject_on_unregister", funct))
 *         funct(ID);
 *     Level().MapManager().OnObjectDestroyNotify(ID);
 */

extern("ai_stalker", {
  /**
   *  luabind::functor<CScriptGameObject*> funct;
   *     if (GEnv.ScriptEngine->functor("ai_stalker.update_best_weapon", funct))
   *     {
   */
});
