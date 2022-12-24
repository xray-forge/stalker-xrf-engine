import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/unknown");

/**
 * -- ����������� ������ � ������������ �� ���������
 * function get_param_string(src_string , obj)
 *  --printf("src_string is [%s] obj name is [%s]", tostring(src_string), obj:name())
 *  local script_ids = db.script_ids[obj:id()]
 *  local out_string, num = string.gsub(src_string, "%$script_id%$", tostring(script_ids))
 *  if num > 0 then
 *    return out_string , true
 *  else
 *    return src_string , false
 *  end
 * end
 */
export function getParamString(srcString: string, obj: XR_game_object): LuaMultiReturn<[string, boolean]> {
  const scriptIds = db.script_ids[obj.id()];
  const [outString, num] = string.gsub(srcString, "%$script_id%$", tostring(scriptIds));

  if (num > 0) {
    return $multi(outString, true);
  } else {
    return $multi(srcString, false);
  }
}
