export {};

declare global {
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
   C++ class FS_file_list {
    function Free();

    function GetAt(number);

    function Size();

  };
   */
  // todo;
  /**
   *  C++ class FS_file_list_ex {
   *     function Sort(number);
   *
   *     function GetAt(number);
   *
   *     function Size();
   *
   *   };
   *
   *  @customConstructor FS_file_list_ex
   */
  class XR_FS_file_list_ex {
    public Sort(u: number): void;

    public GetAt(index: number): XR_FS_item;

    public Size(): number;
  }

  /**
   *  C++ class FS_item {
   *     function Modif();
   *
   *     function NameFull();
   *
   *     function NameShort();
   *
   *     function ModifDigitOnly();
   *
   *     function Size();
   *
   *   };
   *
   *  @customConstructor FS_item
   */
  class XR_FS_item {
    public Modif(): unknown;

    public NameFull(): string;

    public NameShort(): string;

    public ModifDigitOnly(): unknown;

    public Size(): number;
  }

  /**
   * C++ class CSavedGameWrapper {
   *     CSavedGameWrapper (string);
   *
   *     function level_name() const;
   *
   *     function level_id() const;
   *
   *     function game_time(const CSavedGameWrapper*);
   *
   *     function actor_health() const;
   *
   *   };
   *
   *  @customConstructor CSavedGameWrapper
   */
  class XR_CSavedGameWrapper {
    public constructor(name: string);

    public level_name(): string;

    public level_id(): number;

    public game_time(/* const CSavedGameWrapper*/): XR_CTime;

    public actor_health(): number;
  }

  /**

   C++ class fs_file {
    property modif;
    property name;
    property ptr;
    property size_compressed;
    property size_real;
    property vfs;

  };
   *
   */
  // todo;
  /**
   * C++ class FS {
   *     const FS_ClampExt = 4;
   *     const FS_ListFiles = 1;
   *     const FS_ListFolders = 2;
   *     const FS_RootOnly = 8;
   *     const FS_sort_by_modif_down = 5;
   *     const FS_sort_by_modif_up = 4;
   *     const FS_sort_by_name_down = 1;
   *     const FS_sort_by_name_up = 0;
   *     const FS_sort_by_size_down = 3;
   *     const FS_sort_by_size_up = 2;
   *
   *     function get_file_age(string);
   *
   *     function file_length(string);
   *
   *     function file_rename(string, string, boolean);
   *
   *     function r_open(string, string);
   *     function r_open(string);
   *
   *     function append_path(string, string, string, number);
   *
   *     function file_copy(string, string);
   *
   *     function get_file_age_str(FS*, string);
   *
   *     function dir_delete(FS*, string, number);
   *     function dir_delete(FS*, string, string, number);
   *
   *     function update_path(FS*, string, string);
   *
   *     function r_close(reader*&);
   *
   *     function exist(string);
   *     function exist(string, string);
   *
   *     function w_close(class IWriter*&);
   *
   *     function file_list_open(FS*, string, number);
   *     function file_list_open(FS*, string, string, number);
   *
   *     function path_exist(string);
   *
   *     function file_list_open_ex(FS*, string, number, string);
   *
   *     function get_path(string);
   *
   *     function file_delete(string, string);
   *     function file_delete(string);
   *
   *     function w_open(string, string);
   *     function w_open(string);
   *
   *   };
   *
   * @customConstructor FS
   */
  class XR_FS {
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

    public update_path(fs: XR_FS, a: string, b: string): unknown;

    public r_close(reader: unknown /** reader*& */): unknown;

    public exist(a: string): unknown;
    public exist(a: string, b: string): unknown;

    public w_close(writer: unknown /* class IWriter*& */): unknown;

    public file_list_open(fs: XR_FS, a: string, b: number): unknown;
    public file_list_open(fs: XR_FS, a: string, b: string, c: number): unknown;

    public path_exist(a: string): unknown;

    public file_list_open_ex(a: string, b: number, c: string): XR_FS_file_list_ex;

    public get_path(a: string): unknown;

    public file_delete(a: string, b: string): unknown;
    public file_delete(a: string): unknown;

    public w_open(a: string, b: string): unknown;
    public w_open(a: string): unknown;

  }

  /**
   C++ class ini_file {
    ini_file (string);

    function line_count(string);

    function r_bool(string, string);

    function section_exist(string);

    function r_float(string, string);

    function r_clsid(string, string);

    function r_s32(string, string);

    function r_line(ini_file*, string, number, string&, string&);

    function r_token(string, string, const token_list&);

    function r_vector(string, string);

    function r_u32(string, string);

    function r_string_wq(string, string);

    function r_string(string, string);

    function line_exist(string, string);

  };
   */
  // todo;
}
