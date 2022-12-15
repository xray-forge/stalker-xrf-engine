import { render, JSXNode } from "jsx-xml";

function formatXml(xml: string, tab: string = "\t"): string {
  let formatted: string = "";
  let indent: string = "";

  xml.split(/>\s*</).forEach(function(node) {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length); // decrease indent by one 'tab'

    formatted += indent + "<" + node + ">\r\n";
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab; // increase indent
  });

  return formatted.substring(1, formatted.length - 3);
}

/**
 * Render received node to text for saving.
 */
export function renderJsxToXmlText(node: JSXNode): string {
  const xmlMeta: string = "<?xml version=\"1.0\"?>";

  return formatXml(render(node).slice(xmlMeta.length), "  ");
}
