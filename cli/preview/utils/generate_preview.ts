import { default as jsdom } from "jsdom";

const { style, STATIC_ASSET, GRADIENT_BG_, GENERIC } = generateDomClasses();

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

  node.className = STATIC_ASSET + " " + GRADIENT_BG_ + Math.floor(Math.random() * 10);
  node.innerHTML = "";
  node.style.border = "none";
  node.style.width = "100%";
  node.style.height = "100%";
}

function prepareWindow(node: HTMLElement): void {
  node.style.position = "absolute";
  node.style.background = "rgba(50, 50, 50, 0.05)";
}

function prepareStaticAsset(node: HTMLElement): void {
  node.className = STATIC_ASSET + " " + GRADIENT_BG_ + Math.floor(Math.random() * 10);
}

function generateDomClasses() {
  const GENERIC: string = "generic";
  const STATIC_ASSET: string = "static-asset";
  const GRADIENT_BG_: string = "gradient-bg-";

  const gradients: string = Array.from(Array(11).keys())
    .map((it) => {
      const first: string = getRandomColor();
      const second: string = getRandomColor();

      return `
      .${GRADIENT_BG_ + it} {
        background-position: 0 0, 10px 10px;
        background-size: 20px 20px;
        background-color: ${second};
        background-image:  repeating-linear-gradient(45deg, ${first} 25%, transparent 25%, transparent 75%, ${first}
        75%, ${first}), repeating-linear-gradient(45deg, ${first} 25%, ${second} 25%, ${second} 75%, ${first} 75%,
         ${first});
    }
    `;
    })
    .join("\n");

  const style: string = `
     * {
       padding: 0;
       margin: 0;
       font-size: 10px;
       box-sizing: border-box;
     }
  
    .${STATIC_ASSET} {
      border: 1px solid black;
      opacity: 0.8;
    }
    
    ${gradients}
    
    .${GENERIC} {
      background-color: rgba(179, 177, 130, 0.8);
    }
  `;

  return {
    style,
    GENERIC,
    GRADIENT_BG_,
    STATIC_ASSET
  };
}

function getRandomColor(): string {
  return "#" + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, "0");
}
