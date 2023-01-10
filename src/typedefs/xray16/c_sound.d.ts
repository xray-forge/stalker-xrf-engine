declare module "xray16" {
  /**
   * C++ class sound_params {
   * @customConstructor sound_params
   */
  export class XR_sound_params {
    public frequency: number;
    public max_distance: number;
    public min_distance: number;
    public position: XR_vector;
    public volume: number;
  }

  /**
   * C++ class sound_object {
   * @customConstructor sound_object
   */
  export class XR_sound_object {
    public static looped: 1;
    public static s2d: 2;
    public static s3d: 0;

    public frequency: number;
    public max_distance: number;
    public min_distance: number;
    public volume: number;

    public constructor(value: string);
    public constructor(value: string, type: unknown /* enum ESoundTypes */);

    public set_position(vector: XR_vector): unknown;
    public stop_deffered(): unknown;
    public get_position(): unknown;
    public stop(): unknown;
    public play_no_feedback(
      game_object: XR_game_object,
      value1: number,
      value2: number,
      vector: XR_vector,
      value3: number
    ): unknown;
    public play_at_pos(game_object: XR_game_object, vector: XR_vector): unknown;
    public play_at_pos(game_object: XR_game_object, vector: XR_vector, value1: number): unknown;
    public play_at_pos(game_object: XR_game_object, vector: XR_vector, value1: number, value2: number): unknown;
    public attach_tail(value: string): unknown;
    public length(): unknown;
    public play(game_object: XR_game_object): unknown;
    public play(game_object: XR_game_object, value1: number): unknown;
    public play(game_object: XR_game_object, value1: number, value2: number): unknown;
    public playing(): unknown;
  }

  /**
   * C++ class sound {
   * @customConstructor sound
   */
  export class XR_sound {
    public static attack: 3;
    public static attack_hit: 4;
    public static die: 7;
    public static eat: 2;
    public static idle: 1;
    public static panic: 11;
    public static steal: 10;
    public static take_damage: 5;
    public static threaten: 9;

    public constructor();
    public constructor(value1: string, value2: string);
    public constructor(value1: string, value2: string, vector: XR_vector);
    public constructor(value1: string, value2: string, vector: XR_vector, vector2: XR_vector);
    public constructor(value1: string, value2: string, vector: XR_vector, vector2: XR_vector, value3: boolean);
    public constructor(value1: string, vector: XR_vector);
    public constructor(value1: string, vector: XR_vector, vector2: XR_vector);
    public constructor(value1: string, vector: XR_vector, vector2: XR_vector, value3: boolean);
    public constructor(sound_object: XR_sound_object, value1: string, vector: XR_vector);
    public constructor(sound_object: XR_sound_object, value1: string, vector: XR_vector, vector2: XR_vector);
    public constructor(
      sound_object: XR_sound_object,
      value1: string,
      vector: XR_vector,
      vector2: XR_vector,
      value: boolean
    );
    public constructor(sound_object: XR_sound_object, vector: XR_vector);
    public constructor(sound_object: XR_sound_object, vector: XR_vector, vector2: XR_vector);
    public constructor(sound_object: XR_sound_object, vector: XR_vector, vector2: XR_vector, value: boolean);
    public constructor(type: unknown /* MonsterSound::EType */);
    public constructor(type: unknown /* enum MonsterSound::EType*/, value: number);
    public constructor(value1:string, value2: string, type: unknown /* enum MonsterSpace::EMonsterHeadAnimType */);

    public set_sound(value: string): void;
    public set_sound(sound_object: XR_sound_object): void;
    public set_position(vector: XR_vector): void;
    public set_bone(value: string): void;
    public set_angles(vector: XR_vector): unknown;
    public set_sound_type(type: unknown /* ESoundTypes */): unknown;
    public completed(): unknown;
  }

  export type TXR_sounds = typeof XR_sound;

  export type TXR_sound_key = Exclude<keyof TXR_sounds, "constructor" | "prototype">;

  export type TXR_sound = TXR_sounds[TXR_sound_key]

  /**
   C++ class SoundInfo {
    property danger;
    property position;
    property power;
    property time;
    property who;
  };
   */
  // todo;

  /**
   C++ class sound_memory_object : game_memory_object {
    property last_level_time;
    property level_time;
    property object_info;
    property power;
    property self_info;
    function object(const game_memory_object&);
    function type() const;
  };
   *
   */
  // todo;
}
