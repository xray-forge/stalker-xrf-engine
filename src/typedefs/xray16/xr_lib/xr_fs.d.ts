declare module "xray16" {
  /**
   * C++ class FS_file_list {
   * @customConstructor FS_file_list
   */
  export class XR_FS_file_list {
    public Free(): void;
    public GetAt(number: u32): XR_FS_item;
    public Size(): u32;
  }

  /**
   * C++ class FS_file_list_ex {
   * @customConstructor FS_file_list_ex
   */
  export class XR_FS_file_list_ex {
    public Sort(number: u32): void;
    public GetAt(index: u32): XR_FS_item;
    public Size(): u32;
  }

  /**
   * C++ class FS_item {
   * @customConstructor FS_item
   */
  export class XR_FS_item {
    public Modif(): string;
    public NameFull(): string;
    public NameShort(): string;
    public ModifDigitOnly(): string;
    public Size(): u32;
  }

  /**
   * C++ class CSavedGameWrapper {
   * @customConstructor CSavedGameWrapper
   */
  export class XR_CSavedGameWrapper extends XR_EngineBinding {
    public __init(this: void, target: XR_CSavedGameWrapper, name: string): void;
    public constructor(name: string);

    public level_name(): string;
    public level_id(): u8;
    public game_time(): XR_CTime;
    public actor_health(): f32;
  }

  /**
   * C++ class fs_file {
   * @customConstructor fs_file
   */
  export class XR_fs_file {
    public modif: u32;
    public name: string;
    public ptr: u32;
    public size_compressed: u32;
    public size_real: u32;
  }

  /**
   * C++ class FS {
   * @customConstructor FS
   */
  export class XR_FS {
    public static FS_ClampExt: 4;
    public static FS_ListFiles: 1;
    public static FS_ListFolders: 2;
    public static FS_RootOnly: 8;
    public static FS_sort_by_modif_down: 5;
    public static FS_sort_by_modif_up: 4;
    public static FS_sort_by_name_down: 1;
    public static FS_sort_by_name_up: 0;
    public static FS_sort_by_size_down: 3;
    public static FS_sort_by_size_up: 2;

    public append_path(a: string, b: string, c: string, d: number): unknown /* FS_Path */;
    public dir_delete(fs: XR_FS, a: string, b: string, c: number): void;
    public dir_delete(fs: XR_FS, a: string, c: number): void;
    public exist(folderAlias: string, filename: string, fs_type: TXR_fs_type): i32 | null;
    public exist(folderAlias: string, filename: string): i32 | null;
    public exist(path: string): i32 | null;
    public file_copy(a: string, b: string): void;
    public file_length(a: string): i32;
    public file_list_open(a: string, b: string, c: u32): XR_FS_file_list;
    public file_list_open(a: string, b: u32): XR_FS_file_list;
    public file_list_open_ex(a: string, b: u32, c: string): XR_FS_file_list_ex;
    public file_rename(a: string, b: string, c: boolean): void;
    public get_file_age(a: string): u32;
    public get_file_age_str(fs: XR_FS, a: string): u32;
    public path_exist(a: string): boolean;
    public r_close(reader: XR_reader): void;
    public r_open(a: string): XR_reader;
    public r_open(a: string, b: string): XR_reader;
    public update_path(alias: string, addition: string): string;
    public w_close(writer: unknown /* IWriter */): void;
    public rescan_path(path: string): void;

    /**
     * Not registered in LUA, will throw.
     */
    public get_path(alias: string): unknown;
    public file_delete(a: string, b: string): void;
    public file_delete(fs: string): void;
    public w_open(a: string, b: string): unknown /* IWriter */;
    public w_open(a: string): unknown /* IWriter */;
  }

  export type TXR_fs_type = EnumerateStaticsValues<typeof XR_FS>;

  // todo: Clarify param names.
  // todo: Clarify read line multireturn.
  /**
   * C++ class ini_file {
   * @customConstructor ini_file
   */
  export class XR_ini_file {
    public constructor();
    public constructor(path: string);

    public line_count(section: string): u32;
    public section_count(): u32;
    public remove_line(section: string, param: string): void;

    public r_bool(section: string, param: string): boolean;
    public section_exist(section: string): boolean;
    public r_float(section: string, param: string): f32;
    public r_clsid(section: string, param: string): i32;
    public r_s32(section: string, param: string): i32;
    public r_line(section: string, line_number: number, c: string, d: string): LuaMultiReturn<Array<string>>;
    public r_token(section: string, param: string, list: XR_token_list): i32;
    public r_vector(section: string, param: string): XR_vector;
    public r_u32(section: string, param: string): u32;
    public r_string_wq(section: string, param: string): string;
    public r_string(section: string, param: string): string;
    public line_exist(section: string, param: string): boolean;

    public w_fvector2(section: string, param: string, vector: XR_vector2, chat: string): void
    public w_fvector3(section: string, param: string, vector: XR_vector, chat: string): void
    public w_fvector4(section: string, param: string, vector: never, chat: string): void // struct _vector4<float>
    public w_fcolor(section: string, param: string, color: XR_fcolor, chat: string): void
    public w_color(section: string, param: string, color: u32, chat: string): void

    public w_bool(section: string, param: string, bool: boolean, chat: string): void;
    public w_s8(section: string, param: string, uchar: u8, chat: string): void;
    public w_u8(section: string, param: string, uchar: u8, chat: string): void;
    public w_s16(section: string, param: string, sshort: i16, chat: string): void;
    public w_u16(section: string, param: string, ushort: u16, chat: string): void;
    public w_s32(section: string, param: string, sint: i32, chat: string): void;
    public w_u32(section: string, param: string, uint: u32, chat: string): void;
    public w_s64(section: string, param: string, sint: i64, chat: string): void;
    public w_u64(section: string, param: string, uint: u64, chat: string): void;
    public w_float(section: string, param: string, float: f32, char: string): void
    public w_string(section: string, param: string, string: string, char: string): void

    public set_override_names(override: boolean): void;
    public save_as(path: string): boolean;
    public save_at_end(bool: boolean): void;
  }

  /**
   * C++ class net_packet {
   * @customConstructor net_packet
   */
  export class XR_net_packet {
    public r_advance(value: u32): void;
    public r_angle16(value: f32): void;
    public r_angle8(value: f32): void;
    public r_begin(value: u16): u32;
    public r_bool(): boolean;
    public r_clientID(): XR_ClientID;
    public r_dir(vector: XR_vector): void;
    public r_elapsed(): u32;
    public r_eof(): boolean;
    public r_float(): f32;
    public r_float(value: f32): f32;
    public r_float_q16(value1: f32, value2: f32, value3: f32): f32;
    public r_float_q8(value1: f32, value2: f32, value3: f32): f32;
    public r_matrix(matrix: XR_matrix): XR_matrix;
    public r_s16(): i16;
    public r_s16(value: u16): u16;
    public r_s32(): i32;
    public r_s32(value: i32): i32;
    public r_s64(): i64;
    public r_s64(value: i64): i64;
    public r_s8(): i8;
    public r_s8(value: i8): i8;
    public r_sdir(vector: XR_vector): void;
    public r_seek(value: u32): void;
    public r_stringZ(): string;
    public r_tell(): u32;
    public r_u16(): u16;
    public r_u16(value: u16): u16;
    public r_u32(): u32;
    public r_u32(value: u32): u32;
    public r_u64(): u64;
    public r_u64(value: u64): u64;
    public r_u8(): u8;
    public r_u8(value: u8): u8;
    public r_vec3(vector: XR_vector): void;
    public w_angle16(value: f32): void;
    public w_angle8(value: f32): void;
    public w_begin(value: u16): void;
    public w_bool(value: boolean): void;
    public w_chunk_close16(value: u32): void;
    public w_chunk_close8(value: u32): void;
    public w_chunk_open16(value: u32): void;
    public w_chunk_open8(value: u32): void;
    public w_clientID(ClientID: XR_ClientID): void;
    public w_dir(vector: XR_vector): void;
    public w_float(value: f32): void;
    public w_float_q16(value1: f32, value2: f32, value3: f32): void;
    public w_float_q8(value1: f32, value2: f32, value3: f32): void;
    public w_matrix(matrix: XR_matrix): void;
    public w_s16(value: i16): void;
    public w_s32(value: i32): void;
    public w_s64(value: i64): void;
    public w_sdir(vector: XR_vector): void;
    public w_stringZ(value: string | null): void;
    public w_tell(): u32;
    public w_u16(value: u16): void;
    public w_u32(value: u32): void;
    public w_u64(value: u64): void;
    public w_u8(value: u8): void;
    public w_vec3(vector: XR_vector): void;
  }

  /**
   * C++ class reader {
   * @customConstructor reader
   */
  export class XR_reader {
    public r_advance(value: u64): void;
    public r_angle16(): f32;
    public r_angle8(): f32;
    public r_bool(): boolean;
    public r_dir(vector: XR_vector): void;
    public r_elapsed(): i64;
    public r_eof(): boolean;
    public r_float(): f32;
    public r_float(value: f32): f32;
    public r_float_q16(value1: f32, value2: f32): f32;
    public r_float_q8(value1: f32, value2: f32): f32;
    public r_s16(): i16;
    public r_s16(value: i16): void;
    public r_s32(): i32;
    public r_s32(value: i32): i32;
    public r_s64(): i64;
    public r_s64(value: number): i64;
    public r_s8(): i8;
    public r_s8(value: i8): i8;
    public r_sdir(vector: XR_vector): void;
    public r_seek(value: u64): void;
    public r_stringZ<T extends string>(): T ;
    public r_tell(): u64;
    public r_u16(): i16;
    public r_u16(value: i16): i16;
    public r_u32(): u32;
    public r_u32(value: u32): u32;
    public r_u64(): u64;
    public r_u64(value: u64): u64;
    public r_u8(): u8;
    public r_u8(value: u8): u8;
    public r_vec3(vector: XR_vector): void;
  }

  export type TXR_net_processor = XR_reader | XR_net_packet;
}
