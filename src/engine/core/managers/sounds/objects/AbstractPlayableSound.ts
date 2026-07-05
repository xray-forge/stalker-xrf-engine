import { GameObject, IniFile, NetPacket, NetProcessor, SoundObject } from "xray16/alias";
import { AnyArgs, Nillable, TNumberId, TPath, TRate, TSection } from "xray16/lib";

import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { readIniString } from "@/engine/core/utils/ini";

/**
 * Abstract base class representing a playable sound type loaded from an ini section.
 */
export abstract class AbstractPlayableSound {
  public abstract readonly type: EPlayableSound;

  public readonly section: TSection;
  public path: TPath;
  public soundObject: Nillable<SoundObject> = null;
  public shouldPlayAlways: boolean = false;

  protected constructor(ini: IniFile, section: TSection) {
    this.section = section;
    this.path = readIniString(ini, section, "path", true);
  }

  /**
   * Check whether the sound is currently playing.
   *
   * @param args - Nillable arguments passed by overriding implementations.
   * @returns Whether the sound object exists and is playing.
   */
  public isPlaying(...args: AnyArgs): boolean {
    return this.soundObject ? this.soundObject.playing() : false;
  }

  /**
   * Stop the sound if a sound object currently exists.
   *
   * @param args - Nillable arguments passed by overriding implementations.
   */
  public stop(...args: AnyArgs): void {
    if (this.soundObject) {
      this.soundObject.stop();
    }
  }

  /**
   * Set the playback volume of the sound object if it exists.
   *
   * @param level - Volume level to apply to the sound object.
   */
  public setVolume(level: TRate): void {
    if (this.soundObject) {
      this.soundObject.volume = level;
    }
  }

  /**
   * Play the sound.
   *
   * @param args - Arguments required by the concrete sound implementation.
   * @returns Whether the sound started playing successfully.
   */
  public abstract play(...args: AnyArgs): boolean;

  /**
   * Reset the sound state.
   *
   * @param args - Arguments required by the concrete sound implementation.
   */
  public reset(...args: AnyArgs): void {}

  /**
   * Handle the event when sound playback has ended for an object.
   *
   * @param objectId - Identifier of the object whose sound playback ended.
   */
  public onSoundPlayEnded(objectId: TNumberId): void {}

  /**
   * Save the sound state to the save packet.
   *
   * @param packet - Net packet to write the sound state into.
   */
  public save(packet: NetPacket): void {}

  /**
   * Load the sound state from the save reader.
   *
   * @param reader - Net processor to read the sound state from.
   */
  public load(reader: NetProcessor): void {}

  /**
   * Save the per-object sound state to the save packet.
   *
   * @param packet - Net packet to write the per-object sound state into.
   * @param object - Game object whose sound state is being saved.
   */
  public saveObject(packet: NetPacket, object: GameObject): void {}

  /**
   * Load the per-object sound state from the save reader.
   *
   * @param processor - Net processor to read the per-object sound state from.
   * @param object - Game object whose sound state is being loaded.
   */
  public loadObject(processor: NetProcessor, object: GameObject): void {}
}
