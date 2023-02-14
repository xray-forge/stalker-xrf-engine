/**
 * todo
 * todo
 * todo
 * todo
 */
export function cond_name(cond: string, etalon: string): boolean {
  return string.find(cond, "^" + etalon + "%d*$") !== null;
}
