import { EPlayableSound } from "@/engine/core/managers/sounds/sounds_types";
import { readIniString } from "@/engine/core/utils/ini";
import {
  AnyArgs,
  GameObject,
  IniFile,
  NetPacket,
  NetProcessor,
  Optional,
  SoundObject,
  TNumberId,
  TPath,
  TRate,
} from "@/engine/lib/types";
import { TSection } from "@/engine/lib/types/scheme";

/**
 * Todo.
 */
export abstract class AbstractPlayableSound {
  public abstract readonly type: EPlayableSound;

  public readonly section: TSection;
  public path: TPath;
  public soundObject: Optional<SoundObject> = null;
  public shouldPlayAlways: boolean = false;

  protected constructor(ini: IniFile, section: TSection) {
    this.section = section;
    this.path = readIniString(ini, section, "path", true);
  }

  /**
   * Todo: Description.
   */
  public isPlaying(...args: AnyArgs): boolean {
    return this.soundObject === null ? false : this.soundObject.playing();
  }

  /**
   * Todo: Description.
   */
  public stop(...args: AnyArgs): void {
    if (this.soundObject) {
      this.soundObject.stop();
    }
  }

  /**
   * Todo: Description.
   */
  public setVolume(level: TRate): void {
    if (this.soundObject) {
      this.soundObject.volume = level;
    }
  }

  /**
   * Todo: Description.
   */
  public abstract play(...args: AnyArgs): boolean;

  /**
   * Todo: Description.
   */
  public reset(...args: AnyArgs): void {}

  /**
   * Todo: Description.
   */
  public onSoundPlayEnded(objectId: TNumberId): void {}

  /**
   * Todo: Description.
   */
  public save(packet: NetPacket): void {}

  /**
   * Todo: Description.
   */
  public load(reader: NetProcessor): void {}

  /**
   * Todo: Description.
   */
  public saveObject(packet: NetPacket, object: GameObject): void {}

  /**
   * Todo: Description.
   */
  public loadObject(processor: NetProcessor, object: GameObject): void {}
}
