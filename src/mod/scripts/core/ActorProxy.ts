import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/ActorProxy");

export interface IActorProxy extends XR_LuaBindBase {
  initialized: boolean;
  online: boolean;

  alife: Optional<XR_alife_simulator>;
  actor: Optional<XR_game_object>;
  actor_id: number;

  init(): void;
  deinit(): void;

  id(): number;
  has_info(info: string): boolean;
  dont_has_info(info: string): boolean;
  net_spawn(object: XR_game_object): void;
  net_destroy(): void;
}

/**
 * todo: Probably not necessary wrapper class.
 */
export const ActorProxy: IActorProxy = declare_xr_class("ActorProxy", null, {
  __init(): void {
    this.initialized = false;
    log.info("Create actor proxy");
  },
  init(): void {
    if (!this.initialized) {
      this.online = false;
      this.alife = alife();

      if (this.alife !== null) {
        this.actor_id = this.alife.actor().id;
      }

      this.actor = null;
      this.initialized = true;
    }
  },
  deinit(): void {
    if (this.initialized) {
      this.alife = null;
      this.actor = null;
      this.initialized = false;
    }
  },
  id(): number {
    this.init();

    return this.actor_id;
  },
  // todo: Probably not used.
  has_info(info: string): boolean {
    this.init();

    return !this.alife!.has_info(this.online ? 0 : this.actor_id, info);
  },
  dont_has_info(info: string): boolean {
    this.init();

    return !this.alife!.has_info(this.online ? 0 : this.actor_id, info);
  },
  net_spawn(object: XR_game_object): void {
    this.init();
    this.online = true;
    this.actor = object;
  },
  net_destroy(): void {
    this.init();
    this.online = false;
    this.actor = null;
  }
} as IActorProxy);
