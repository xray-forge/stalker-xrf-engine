import { XR_ClientID } from "xray16";

declare module "xray16" {
  /**
   * C++ class reader {
   * @customConstructor reader
   */
  export class XR_reader {
    public r_advance(value: number): unknown;
    public r_u64(value: number): unknown;
    public r_u64(): unknown;
    public r_bool(reader: XR_reader): unknown;
    public r_dir(vector: XR_vector): unknown;
    public r_u8(value: number): unknown;
    public r_u8(): unknown;
    public r_eof(reader: XR_reader): unknown;
    public r_float_q8(value1: number, value2: number): unknown;
    public r_vec3(reader: XR_reader, vector: XR_vector): unknown;
    public r_stringZ(reader: XR_reader): unknown;
    public r_u16(value: number): unknown;
    public r_u16(): unknown;
    public r_float_q16(value1: number, value2: number): unknown;
    public r_angle16(): unknown;
    public r_s64(value: number): unknown;
    public r_s64(): unknown;
    public r_float(value: number): unknown;
    public r_float(): unknown;
    public r_s32(value: number): unknown;
    public r_s32(): unknown;
    public r_elapsed(): unknown;
    public r_sdir(vector: XR_vector): unknown;
    public r_tell(): unknown;
    public r_s8(value: string): string;
    public r_s8(): string;
    public r_s16(value: number): unknown;
    public r_s16(): unknown;
    public r_seek(value: number): unknown;
    public r_u32(value: number): unknown;
    public r_u32(): unknown;
    public r_angle8(): unknown;
  }

  /**
   * C++ class FS_file_list {
   * @customConstructor FS_file_list
   */
  export class XR_FS_file_list {
    public Free(): void;
    public GetAt(number: number): XR_FS_item;
    public Size(): number;
  }

  /**
   * C++ class FS_file_list_ex {
   * @customConstructor FS_file_list_ex
   */
  export class XR_FS_file_list_ex {
    public Sort(u: number): void;
    public GetAt(index: number): XR_FS_item;
    public Size(): number;
  }

  /**
   * C++ class FS_item {
   * @customConstructor FS_item
   */
  export class XR_FS_item {
    public Modif(): unknown;
    public NameFull(): string;
    public NameShort(): string;
    public ModifDigitOnly(): unknown;
    public Size(): number;
  }

  /**
   * C++ class CSavedGameWrapper {
   * @customConstructor CSavedGameWrapper
   */
  export class XR_CSavedGameWrapper {
    public constructor(name: string);
    public level_name(): string;
    public level_id(): number;
    public game_time(/* const CSavedGameWrapper*/): XR_CTime;
    public actor_health(): number;
  }

  /**
   * C++ class fs_file {
   */
  export interface IXR_fs_file {
    modif: unknown;
    name: unknown;
    ptr: unknown;
    size_compressed: unknown;
    size_real: unknown;
    vfs: unknown;
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

    public get_file_age(a: string): unknown;
    public file_length(a: string): unknown;
    public file_rename(a: string, b: string, c: boolean): unknown;
    public r_open(a: string, b: string): unknown;
    public r_open(a: string): unknown;
    public append_path(a: string, b: string, c: string, d: number): unknown;
    public file_copy(a: string, b: string): unknown;
    public get_file_age_str(fs: XR_FS, a: string): unknown;
    public dir_delete(fs: XR_FS, a: string, c: number): unknown;
    public dir_delete(fs: XR_FS, a: string, b: string, c: number): unknown;
    public update_path(alias: string, addition: string): string;
    public r_close(reader: unknown /** reader* */): unknown;
    public exist(path: string): number | null;
    public exist(folderAlias: string, filename: string): number | null;
    public w_close(writer: unknown /* class IWriter* */): unknown;
    public file_list_open(a: string, b: number): XR_FS_file_list;
    public file_list_open(a: string, b: string, c: number): XR_FS_file_list;
    public path_exist(a: string): unknown;
    public file_list_open_ex(a: string, b: number, c: string): XR_FS_file_list_ex;

    /**
     * Not registered in LUA, will throw.
     */
    public get_path(alias: string): unknown;
    public file_delete(a: string, b: string): unknown;
    public file_delete(fs: string): unknown;
    public w_open(a: string, b: string): unknown;
    public w_open(a: string): unknown;
  }

  /**
   * C++ class ini_file {
   * @customConstructor ini_file
   */
  export class XR_ini_file {
    public constructor(path: string);

    public line_count(section: string): number;
    public r_bool(section: string, param: string): boolean;
    public section_exist(section: string): boolean;
    public r_float(section:string, param: string): number;
    public r_clsid(section:string, param: string): string;
    public r_s32(section:string, param: string): number;
    public r_line(section: string, line_number: number, c: string, d: string): LuaMultiReturn<Array<string>>;
    public r_token(section: string, param: string, list: unknown /* const token_list */): unknown;
    public r_vector(section:string, param: string): XR_vector2;
    public r_u32(section:string, param: string): number;
    public r_string_wq(section:string, param: string): string;
    public r_string(section: string, param: string): string;
    public line_exist(section:string, param: string): boolean;
  }

  /**
   * C++ class net_packet {
   * @customConstructor net_packet
   */
  export class XR_net_packet {
    public r_advance(value: number): unknown;
    public r_begin(value: number): unknown;
    public w_chunk_open16(value: number): unknown;
    public r_u32(value: number): number;
    public r_u32(): number;
    public w_begin(value: number): unknown;
    public w_u32(value: number): unknown;
    public r_u8(value: number): number;
    public r_u8(): number;
    public r_eof(): unknown;
    public w_chunk_open8(value: number): unknown;
    public r_vec3(vector: XR_vector): unknown;
    public w_u8(value: number): unknown;
    public r_u16(value: number): number;
    public r_u16(): number;
    public r_float_q16(value1: number, value2: number, value3: number): unknown;
    public r_angle16(value: number): unknown;
    public r_s64(value: number): unknown;
    public r_s64(): unknown;
    public w_angle16(value: number): unknown;
    public r_tell(): number;
    public r_s16(value: number): unknown;
    public r_s16(): unknown;
    public w_clientID(ClientID: XR_ClientID): void;
    public r_elapsed(): unknown;
    public r_u64(value: number): unknown;
    public r_u64(): unknown;
    public w_sdir(vector: XR_vector): unknown;
    public r_clientID(): XR_ClientID;
    public r_dir(vector: XR_vector): unknown;
    public r_matrix(matrix: unknown): unknown;
    public r_stringZ(): string;
    public w_s16(value: number): unknown;
    public r_sdir(vector: XR_vector): unknown;
    public w_matrix(matrix: unknown): unknown;
    public w_u16(value: number): number;
    public r_float_q8(value1: number, value2: number, value3: number): unknown;
    public w_s64(value: number): void;
    public r_bool(): boolean;
    public w_bool(value: boolean): void;
    public w_dir(vector: XR_vector): unknown;
    public w_s32(value: number): unknown;
    public w_stringZ(value: string): void;
    public w_float_q16(value1: number, value2: number, value3: number): unknown;
    public r_s8(value: string): unknown;
    public r_s8(): unknown;
    public w_chunk_close8(value: number): unknown;
    public r_float(value: number): unknown;
    public r_float(): unknown;
    public w_angle8(value: number): unknown;
    public r_s32(value: number): unknown;
    public r_s32(): unknown;
    public w_float(value: number): unknown;
    public w_tell(): number;
    public r_seek(value: number): unknown;
    public w_float_q8(value1: number, value2: number, value3: number): unknown;
    public w_vec3(vector: XR_vector): unknown;
    public w_chunk_close16(value: number): unknown;
    public w_u64(value: number): unknown;
    public r_angle8(value: number): unknown;
  }
}
