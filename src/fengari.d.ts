// fengari (Lua in JavaScript) ships no types; tests use only this corner of it.
declare module 'fengari' {
  type LuaState = object;
  export const lua: {
    LUA_OK: number;
    lua_pcall(L: LuaState, nargs: number, nresults: number, msgh: number): number;
    lua_tojsstring(L: LuaState, index: number): string;
  };
  export const lauxlib: {
    luaL_newstate(): LuaState;
    luaL_loadstring(L: LuaState, source: Uint8Array): number;
  };
  export const lualib: { luaL_openlibs(L: LuaState): void };
  export function to_luastring(source: string): Uint8Array;
}
