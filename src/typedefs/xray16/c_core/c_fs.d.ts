declare module "xray16" {
  /**
   C++ class reader {
    function r_advance(number);

    function r_u64(unsigned __int64&);
    function r_u64();

    function r_bool(reader*);

    function r_dir(vector&);

    function r_u8(number&);
    function r_u8();

    function r_eof(reader*);

    function r_float_q8(number, number);

    function r_vec3(reader*, vector*);

    function r_stringZ(reader*);

    function r_u16(number&);
    function r_u16();

    function r_float_q16(number, number);

    function r_angle16();

    function r_s64(__int64&);
    function r_s64();

    function r_float(number&);
    function r_float();

    function r_s32(number&);
    function r_s32();

    function r_elapsed() const;

    function r_sdir(vector&);

    function r_tell() const;

    function r_s8(signed char&);
    function r_s8();

    function r_s16(number&);
    function r_s16();

    function r_seek(number);

    function r_u32(number&);
    function r_u32();

    function r_angle8();

  };
   */
  // todo;

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
    public r_close(reader: unknown /** reader*& */): unknown;
    public exist(path: string): number | null;
    public exist(folderAlias: string, filename: string): number | null;
    public w_close(writer: unknown /* class IWriter*& */): unknown;
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
    public r_line(a: string, b: number, c: string, d: string): LuaMultiReturn<Array<string>>;
    public r_token(section: string, param: string, list: unknown /* const token_list& */): unknown;
    public r_vector(section:string, param: string): XR_vector2;
    public r_u32(section:string, param: string): number;
    public r_string_wq(section:string, param: string): string;
    public r_string(section: string, param: string): string;
    public line_exist(section:string, param: string): boolean;
  }
}
