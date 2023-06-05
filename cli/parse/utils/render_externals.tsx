import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { IExternFunction } from "#/parse/utils/types";

/**
 * Render object to valid HTML.
 */
export function renderExternals(data: Record<string, Array<IExternFunction>>): JSXNode {
  return (
    <html>
      <head>{renderStyles()}</head>
      <body>
        {renderContent(data)}
        {renderScripts()}
      </body>
    </html>
  );
}

/**
 * Render CSS styles for display.
 */
function renderStyles(): JSXNode {
  const styles: string = `
  html, body {
    padding: 0;
    margin: 0;
    background: #202124;
  }
  
  .extern-module {
    color: #fff;
    font-size: 20px;
    padding: 8px;
  }
  
  .extern-function {
    margin: 8px 0;
    padding: 8px;
    background: #303030;
    border-radius: 4px;
  }

  .extern-module-name {
    font-weight: 700;
    color: #6e80f5;
    padding: 8px;
    font-size: 20px;
    width: 100%;
  }

  .extern-name {
    text-decoration: none;
    font-weight: 700;
    color: #526af7;
  }

  .extern-param-name {
    color: #6e80f5;
  }

  .extern-param-type {
    color: #db8d39;
  }

  .extern-doc {
    margin-top: 8px;
  }
  `;

  return <style>{styles}</style>;
}

/**
 * Render HTML body content.
 */
function renderContent(data: Record<string, Array<IExternFunction>>): JSXNode {
  return Object.entries(data).map(([key, value]) => (
    <div class="extern-module">
      <button class="extern-module-name collapsible active">{key}</button>

      <div>
        {value.map((it) => {
          const name: JSXNode = (
            <a class="extern-name" href={`#${it.name}`}>
              {it.name.indexOf(".") === -1 ? it.name : it.name.split(".")[1]}
            </a>
          );
          const parametersList: JSXNode = it.parameters.map((param, index, base) => (
            <Fragment>
              <span>
                <span class="extern-param-name">{param.parameterName}</span>
                <span>:</span>
                <span class="extern-param-type">{param.parameterTypeName}</span>
              </span>
              {index === base.length - 1 ? null : <span>,</span>}
            </Fragment>
          ));

          return (
            <section id={it.name} class="extern-function">
              <div>
                {name}({parametersList})
              </div>
              <div class="extern-doc">
                {it.doc.split("\n").map((it) => (
                  <div>{it}</div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  ));
}

/**
 * Render DOM js scripts.
 */
function renderScripts(): JSXNode {
  const script: string = `
   const collapsible = document.getElementsByClassName("collapsible");
  
    for (let i = 0; i < collapsible.length; i++) {
      collapsible[i].addEventListener("click", function() {
        this.classList.toggle("active");
  
        const content = this.nextElementSibling;
  
        if (content.style.display === "none") {
          content.style.display = "block";
        } else {
          content.style.display = "none";
        }
      });
    }
  `;

  return <script>{{ "#raw": script }}</script>;
}
