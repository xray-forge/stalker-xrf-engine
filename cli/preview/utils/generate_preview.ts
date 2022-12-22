import { default as jsdom } from "jsdom";

const { style, STATIC_ASSET, GENERIC } = generateDomClasses();

export function generatePreview(content: string): string {
  const dom = new jsdom.JSDOM(content);

  const styleNode = dom.window.document.createElement("style", {});

  styleNode.innerHTML = style;
  dom.window.document.head.appendChild(styleNode);

  const transform = (node: HTMLElement, depth: number = 1) => {
    const tag = node.tagName;

    const x: string = node.getAttribute("x") || "";
    const y: string = node.getAttribute("y") || "";
    const width: string = node.getAttribute("width") || "";
    const height: string = node.getAttribute("height") || "";

    node.setAttribute("tag", tag);

    node.className = GENERIC;
    node.style.position = "absolute";
    node.style.left = x ? x + "px" : "0";
    node.style.top = y ? y + "px" : "0";
    node.style.width = width ? width + "px" : "0";
    node.style.height = height ? height + "px" : "0";
    node.style.zIndex = String(depth);

    switch (tag.toLowerCase()) {
      case "texture":
        prepareTexture(node);
        break;
      case "auto_static":
        prepareStaticAsset(node);
        break;
      case "text":
        prepareText(node);
        break;
      case "w":
        prepareWindow(node);
        break;
      default:
        prepareOther(node);
        break;
    }

    for (const it of node.children) {
      transform(it as HTMLElement, depth + 1);
    }
  };

  for (const it of dom.window.document.body.children) {
    transform(it as HTMLElement);
  }

  return dom.serialize();
}

function prepareOther(node: HTMLElement): void {
  node.style.border = "solid black 1px";
}

function prepareText(node: HTMLElement): void {
  node.style.overflow = "hidden";
  node.style.width = "100%";
  node.style.height = "100%";
  node.style.border = "solid black 1px";
  node.style.position = "relative";

  if (node.textContent === "") {
    node.textContent = "txt";
  }
}

function prepareTexture(node: HTMLElement): void {
  node.setAttribute("texture_resource", node.textContent);
  node.innerHTML = "";
  node.style.position = "relative";
  node.style.border = "none";
}

function prepareWindow(node: HTMLElement): void {
  node.style.position = "relative";
}

function prepareStaticAsset(node: HTMLElement): void {
  node.className = STATIC_ASSET;
}

function generateDomClasses() {
  const GENERIC: string = "generic";
  const STATIC_ASSET: string = "static-asset";

  const style: string = `
     * {
       padding: 0;
       margin: 0;
       font-size: 10px;
     }
  
    .${STATIC_ASSET} {
      border: 1px solid black;
      background-color: #e5e5f7;
      opacity: 0.8;
      background-image:  repeating-linear-gradient(45deg, #444cf7 25%, transparent 25%, transparent 75%, #444cf7 75%,
       #444cf7), repeating-linear-gradient(45deg, #444cf7 25%, #e5e5f7 25%, #e5e5f7 75%, #444cf7 75%, #444cf7);
      background-position: 0 0, 10px 10px;
      background-size: 20px 20px;
    }
    
    .${GENERIC} {
      background-color: rgba(179, 177, 130, 0.8);
    }
  `;

  return {
    style,
    GENERIC,
    STATIC_ASSET
  };
}
