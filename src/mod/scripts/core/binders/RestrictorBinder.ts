import { LuabindClass, object_binder, XR_cse_alife_object, XR_game_object, XR_net_packet, XR_reader } from "xray16";

import { Optional, TNumberId } from "@/mod/lib/types";
import { ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { addZone, deleteZone, IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSoundManager } from "@/mod/scripts/core/managers/GlobalSoundManager";
import { initializeGameObject } from "@/mod/scripts/core/schemes/initializeGameObject";
import { issueSchemeEvent } from "@/mod/scripts/core/schemes/issueSchemeEvent";
import { loadObject, saveObject } from "@/mod/scripts/core/schemes/storing";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("RestrictorBinder");

/**
 * todo;
 */
@LuabindClass()
export class RestrictorBinder extends object_binder {
  public isInitialized: boolean = false;
  public isLoaded: boolean = false;
  public state: IStoredObject = {};

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo;
   */
  public override reload(section: TSection): void {
    super.reload(section);
  }

  /**
   * todo;
   */
  public override reinit(): void {
    super.reinit();

    this.state = {};
    registry.objects.set(this.object.id(), this.state);
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Net spawn:", this.object.name());

    addZone(this.object);

    const objectId: TNumberId = this.object.id();
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (registry.sounds.looped.get(objectId) !== null) {
      for (const [k, v] of registry.sounds.looped.get(objectId)) {
        globalSoundManager.playLoopedSound(objectId, k);
      }
    }

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    GlobalSoundManager.getInstance().stopSoundsByObjectId(this.object.id());

    const state: IStoredObject = this.state;

    if (state.active_scheme !== null) {
      issueSchemeEvent(this.object, state[state.active_scheme as string], "net_destroy");
    }

    deleteZone(this.object);

    registry.objects.delete(this.object.id());
    super.net_destroy();
  }

  /**
   * todo;
   */
  public override update(delta: number): void {
    const activeSection: Optional<TSection> = this.state.active_section as Optional<TSection>;
    const objectId: number = this.object.id();

    if (!this.isInitialized) {
      this.isInitialized = true;

      initializeGameObject(this.object, this.state, this.isLoaded, registry.actor, ESchemeType.RESTRICTOR);
    }

    this.object.info_clear();

    if (activeSection !== null) {
      this.object.info_add("section: " + activeSection);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + objectId + "]");

    if (this.state.active_section !== null) {
      issueSchemeEvent(this.object, this.state[this.state.active_scheme as string], "update", delta);
    }

    GlobalSoundManager.getInstance().updateForObjectId(objectId);
  }

  /**
   * todo;
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, RestrictorBinder.__name);
    super.save(packet);

    saveObject(this.object, packet);
    setSaveMarker(packet, true, RestrictorBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    setLoadMarker(reader, false, RestrictorBinder.__name);

    this.isLoaded = true;

    super.load(reader);

    loadObject(this.object, reader);
    setLoadMarker(reader, true, RestrictorBinder.__name);
  }
}
