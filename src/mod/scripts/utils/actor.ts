import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/actor");

/**
 * function give_info (info)
 *  db.actor:give_info_portion(info)
 * end
 */
export function giveInfo(info: unknown): void {
  db.actor.give_info_portion(info);
}

/**
 * function disable_info (info)
 *  if has_alife_info(info) then
 *    printf("*INFO*: disabled npc='single_player' id='%s'", info)
 *    db.actor:disable_info_portion(info)
 *  end
 * end
 */
export function disableInfo(info: unknown): void {
  if (hasAlifeInfo(info)) {
    db.actor.disable_info_portion(info);
  }
}

/**
 * --' �������� �� ���������v, ���� ���� ������ �� ��  �������
 * function has_alife_info(info_id)
 *  if aa == nil then
 *    return false
 *  end
 *
 *  return aa:has_info(0, info_id)
 * end
 */
export function hasAlifeInfo(infoId: unknown): boolean {
  const aa = get_global("aa");

  if (aa === null) {
    return false;
  }

  return aa.has_info(0, infoId);
}
