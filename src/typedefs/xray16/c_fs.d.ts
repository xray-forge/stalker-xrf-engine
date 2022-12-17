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
   C++ class FS_file_list_ex {
    function Sort(number);

    function GetAt(number);

    function Size();

  };
   */

  // todo;

  /**

   C++ class FS_item {
    function Modif();

    function NameFull();

    function NameShort();

    function ModifDigitOnly();

    function Size();

  };
   *
   */

  // todo;

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
   C++ class FS {
    const FS_ClampExt = 4;
    const FS_ListFiles = 1;
    const FS_ListFolders = 2;
    const FS_RootOnly = 8;
    const FS_sort_by_modif_down = 5;
    const FS_sort_by_modif_up = 4;
    const FS_sort_by_name_down = 1;
    const FS_sort_by_name_up = 0;
    const FS_sort_by_size_down = 3;
    const FS_sort_by_size_up = 2;

    function get_file_age(string);

    function file_length(string);

    function file_rename(string, string, boolean);

    function r_open(string, string);
    function r_open(string);

    function append_path(string, string, string, number);

    function file_copy(string, string);

    function get_file_age_str(FS*, string);

    function dir_delete(FS*, string, number);
    function dir_delete(FS*, string, string, number);

    function update_path(FS*, string, string);

    function r_close(reader*&);

    function exist(string);
    function exist(string, string);

    function w_close(class IWriter*&);

    function file_list_open(FS*, string, number);
    function file_list_open(FS*, string, string, number);

    function path_exist(string);

    function file_list_open_ex(FS*, string, number, string);

    function get_path(string);

    function file_delete(string, string);
    function file_delete(string);

    function w_open(string, string);
    function w_open(string);

  };
   */

  // todo;

}
