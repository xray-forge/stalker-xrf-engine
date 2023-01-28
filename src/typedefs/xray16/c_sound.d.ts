declare module "xray16" {
  /**
   * C++ class sound_params {
   * @customConstructor sound_params
   */
  export class XR_sound_params {
    public frequency: f32;
    public max_distance: f32;
    public min_distance: f32;
    public position: XR_vector;
    public volume: f32;

    private constructor();
  }

  /**
   * C++ class sound_object {
   * @customConstructor sound_object
   */
  export class XR_sound_object {
    public static s3d: 0;
    public static looped: 1;
    public static s2d: 2;

    public frequency: f32;
    public max_distance: f32;
    public min_distance: f32;
    public volume: f32;

    /**
     * @param sound_path - file path
     */
    public constructor(sound_path: string);
    /**
     * @param sound_path - file path
     * @param type - default 'no_sound' (0)
     */
    public constructor(sound_path: string, type: TXR_snd_type);

    public length(): number;
    public playing(): boolean;
    public get_position(): XR_vector;

    public set_position(vector: XR_vector): void;
    public attach_tail(sound_path: string): void;

    public play(object: XR_game_object): void;
    public play(object: XR_game_object, delay: number): void;
    public play(object: XR_game_object, delay: number, type: TXR_sound_object_type): void;
    public play_at_pos(object: XR_game_object, position: XR_vector): void;
    public play_at_pos(object: XR_game_object, position: XR_vector, delay: number): void;
    public play_at_pos(object: XR_game_object, position: XR_vector, delay: number, type: TXR_sound_object_type): void;
    public play_no_feedback(
      object: XR_game_object,
      type: TXR_sound_object_type,
      value1: number,
      position: XR_vector,
      value2: number
    ): void;

    public stop(): void;
    public stop_deffered(): void;
  }

  export type TXR_sound_object_types = typeof XR_sound_object;

  export type TXR_sound_object_type = TXR_sound_object_types[
    Exclude<keyof TXR_sound_object_types, "prototype" | "constructor">
  ];

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
    public set_angles(vector: XR_vector): void;
    public set_sound_type(type: unknown /* ESoundTypes */): void;
    public completed(): boolean;
  }

  export type TXR_sound_types = typeof XR_sound;

  export type TXR_sound_key = Exclude<keyof TXR_sound_types, "constructor" | "prototype">;

  export type TXR_sound_type = TXR_sound_types[TXR_sound_key]

  /**
   * C++ class snd_type
   * @customConstructor snd_type
   */
  export class XR_snd_type {
    public static ambient: 128;
    public static anomaly: 268435456;
    public static anomaly_idle: 268437504;
    public static attack: 8192;
    public static bullet_hit: 524288;
    public static die: 131072;
    public static drop: 33554432;
    public static eat: 4096;
    public static empty: 1048576;
    public static hide: 16777216;
    public static idle: 2048;
    public static injure: 65536;
    public static item: 1073741824;
    public static item_drop: 1107296256;
    public static item_hide: 1090519040;
    public static item_pick_up: 1140850688;
    public static item_take: 1082130432;
    public static item_use: 1077936128;
    public static monster: 536870912;
    public static monster_attack: 536879104;
    public static monster_die: 537001984;
    public static monster_eat: 536875008;
    public static monster_injure: 536936448;
    public static monster_step: 536903680;
    public static monster_talk: 536887296;
    public static no_sound: 0;
    public static object_break: 1024;
    public static object_collide: 512;
    public static object_explode: 256;
    public static pick_up: 67108864;
    public static reload: 262144;
    public static shoot: 2097152;
    public static step: 32768;
    public static take: 8388608;
    public static talk: 16384;
    public static use: 4194304;
    public static weapon: -2147483648;
    public static weapon_bullet_hit: -2146959360;
    public static weapon_empty: -2146435072;
    public static weapon_reload: -2147221504;
    public static weapon_shoot: -2145386496;
    public static world: 134217728;
    public static world_ambient: 134217856;
    public static world_object_break: 134218752;
    public static world_object_collide: 134218240;
    public static world_object_explode: 134217984;

    private constructor();
  }

  export type TXR_snd_types = typeof XR_snd_type;

  export type TXR_snd_type = TXR_snd_types[Exclude<keyof TXR_snd_types, "constructor" | "prototype">]

  /**
   * C++ class SoundInfo {
   * @customConstructor SoundInfo
   */
  export class XR_SoundInfo {
    public danger: unknown;
    public position: XR_vector;
    public power: number;
    public time: unknown;
    public who: XR_game_object;

    private constructor();
  }

  /**
   * C++ class sound_memory_object : game_memory_object {
   * @customConstructor sound_memory_object
   */
  export class XR_sound_memory_object extends XR_game_memory_object {
    public power: number;
    public type(): number;

    private constructor();
  }
}
