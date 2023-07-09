/**
 * LuaFileSystem LUA library.
 * https://lunarmodules.github.io/luafilesystem/index.html
 */
declare namespace lfs {
  function lock(filehandle: unknown): void;
  function touch(path: string): void;
  function currentdir(): string;
  function lock_dir(path: string): void;
  function mkdir(path: string): void;
  function symlinkattributes(): void;
  function chdir(path: string): void;
  function unlock(path: string): void;
  function dir(path: string): LuaMultiReturn<[LuaIterable<string, unknown>, { next: () => string | null }]>;
  function rmdir(path: string): void;
  function link(old: string, next: string): void;
  function attributes(filepath: string): LuaTable | null;
  function setmode(): void;
}
