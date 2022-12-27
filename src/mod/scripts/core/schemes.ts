export const schemes: LuaTable<string, string> = new LuaTable();
export const stypes: LuaTable<string, string> = new LuaTable();

export function loadScheme(filename: string, scheme: string, stype: string): void {
  schemes.set(scheme, filename);
  stypes.set(scheme, stype);
}
