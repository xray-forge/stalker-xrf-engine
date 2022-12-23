export function collectLuaGarbage(): void {
  collectgarbage("collect");
}

export function getLuaMemoryUsed(): number {
  return collectgarbage("count");
}
