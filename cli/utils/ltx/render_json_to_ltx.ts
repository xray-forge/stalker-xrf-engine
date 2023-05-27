import { ILtxConfigDescriptor, ILtxFieldDescriptor, LTX_EXTENDS, LTX_ROOT, Optional, renderField } from "#/utils";

type TPossibleFieldDescriptorBase = Record<string, ILtxFieldDescriptor<unknown>> | Array<ILtxFieldDescriptor<unknown>>;
type TPossibleFieldDescriptorFull = TPossibleFieldDescriptorBase | (() => TPossibleFieldDescriptorBase);

/**
 * todo;
 */
function renderSectionName(name: string | typeof LTX_ROOT, descriptorRaw: TPossibleFieldDescriptorFull): string {
  if (name === LTX_ROOT) {
    return "\n";
  } else {
    const extendsMeta: Optional<string | Array<string>> = descriptorRaw[LTX_EXTENDS];

    if (extendsMeta) {
      return `\n[${name}]` + ":" + (Array.isArray(extendsMeta) ? extendsMeta.join(",") : extendsMeta) + "\n";
    } else {
      return `\n[${name}]\n`;
    }
  }
}

/**
 * todo;
 */
function renderLtxSection(name: string | typeof LTX_ROOT, descriptorRaw: TPossibleFieldDescriptorFull): string {
  const sectionName: string = renderSectionName(name, descriptorRaw);
  const descriptor: TPossibleFieldDescriptorBase =
    typeof descriptorRaw === "function" ? descriptorRaw() : descriptorRaw;

  if (Array.isArray(descriptor)) {
    return sectionName + descriptor.map((it) => renderField(null, it)).join("\n") + "\n";
  }

  return Object.entries(descriptor).reduce(
    (result, [key, value]) => result + renderField(key, value) + "\n",
    sectionName
  );
}

/**
 * todo;
 */
export function renderJsonToLtx(filename: string, object: ILtxConfigDescriptor): string {
  let header: string = `; ${filename} @ generated ${new Date().toString()}\n`;

  if (object[LTX_ROOT]) {
    header += renderLtxSection(LTX_ROOT, object[LTX_ROOT]);
  }

  return (
    header +
    Object.entries(object).reduce((result, [key, object]) => {
      return result + renderLtxSection(key, object);
    }, "")
  );
}
