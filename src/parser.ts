// ---------
// parser.js is an async markdown-to-html parser.
//   this is used before anything is ready (before the DOM) so search and pages can appear faster

import { Remarkable } from "remarkable"; // This is where the bulk of the filesize comes from
import { EmCloseToken, EmOpenToken, HeadingCloseToken } from "remarkable/lib";

export class Parser {
  private md: Remarkable;
  private openEmRenderer: Remarkable.Rule<EmOpenToken, string> | undefined;
  private closeEmRenderer: Remarkable.Rule<EmCloseToken, string> | undefined;
  private closeHeadingRenderer: Remarkable.Rule<HeadingCloseToken, string> | undefined;
  private injectedHeading: boolean;
  private injectedEm: boolean;
  private tagMap: Record<string, string>;

  constructor() {
    // https://www.npmjs.com/package/remarkable-youtube
    //     When video sources are from Youtube? or remarkable-embed
    this.md = new Remarkable("full", {
      html: true,
      typographer: false,
    });

    // Rules that we want to modify for custom directives
    this.openEmRenderer = this.md.renderer.rules.em_open;
    this.closeEmRenderer = this.md.renderer.rules.em_close;
    this.closeHeadingRenderer = this.md.renderer.rules.heading_close;
    this.injectedHeading = false;
    this.injectedEm = false;

    this.tagMap = {
      r: "red",
      b: "blue",
      g: "green",
      y: "yellow",
      p: "pink",
      t: "teal",
      "!": "spoiler",
    };

    this.updateRules();
  }

  private isTextToken(token: Remarkable.TagToken): token is Remarkable.BlockContentToken {
    return "content" in token;
  }

  // --- For custom directives --> capture when the markdown has a special call either :{ in a heading or *:{ in text
  updateRules(): void {
    // Define new handlers for text
    this.md.renderer.rules.heading_open = (tokens: Remarkable.TagToken[], idx: number): string => {
      const nextToken: Remarkable.TagToken = tokens[idx + 1];

      // Ensure the next token exists, is a TextToken, and has a defined content property
      if (
        nextToken &&
        this.isTextToken(nextToken) &&
        nextToken.content &&
        nextToken.content[0] === ":"
      ) {
        this.injectedHeading = true;

        // Inject a span depending on the category
        if (nextToken.content[1] === "{") {
          // parseJsonTag modifies tokens, so baseReturn should be recalculated.
          const spanReturn: string = this.parseJsonTag(tokens, idx);
          const baseReturn: string = `<h${(tokens[idx] as Remarkable.HeadingOpenToken).hLevel} id="${nextToken.content.replace(/\s+/g, "-").toLowerCase()}">`;
          return spanReturn + baseReturn;
        }
      }

      // Instead of the default handler, use this so we can use the id later for search
      if (nextToken && this.isTextToken(nextToken) && nextToken.content) {
        const baseReturn: string = `<h${(tokens[idx] as Remarkable.HeadingOpenToken).hLevel} id="${nextToken.content.replace(/\s+/g, "-").toLowerCase()}">`;
        return baseReturn;
      }

      // Fallback in case nextToken is undefined or not a TextToken
      return `<h${(tokens[idx] as Remarkable.HeadingOpenToken).hLevel}>`;
    };

    this.md.renderer.rules.em_open = (
      tokens: Remarkable.TagToken[],
      idx: number,
      options: Remarkable.Options | undefined,
      env: Remarkable.Env | undefined,
    ): string => this.parseTags(tokens, idx, options, env, this.openEmRenderer);

    this.md.renderer.rules.heading_close = (
      tokens: Remarkable.HeadingCloseToken[],
      idx: number,
      options: Remarkable.Options | undefined,
      env: Remarkable.Env | undefined,
    ): string => {
      if (this.injectedHeading) {
        this.injectedHeading = false;
        const headingEnd: string = this.closeHeadingRenderer!(tokens, idx, options, env);
        // Change new line position or styling will mess up
        return `${headingEnd.concat("</span>").replace(/\n/g, " ")}\n`;
      } else {
        return this.closeHeadingRenderer!(tokens, idx, options, env);
      }
    };

    this.md.renderer.rules.em_close = (
      tokens: Remarkable.EmCloseToken[],
      idx: number,
      options: Remarkable.Options | undefined,
      env: Remarkable.Env | undefined,
    ): string => {
      if (this.injectedEm) {
        this.injectedEm = false;
        return "</span>";
      } else {
        return this.closeEmRenderer!(tokens, idx, options, env);
      }
    };

    this.parseKatex();
  }

  // --- Load a text file on a relative path
  async loadFile(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.open("GET", filePath, true);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        }
      };

      xhr.onerror = () => {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      };

      xhr.send();
    });
  }

  // --- Get data from a loaded file (with extension)
  async asyncRead(file: string): Promise<string> {
    const fileData: string = await this.loadFile(file);

    // Check if file data is empty or null
    if (!fileData || fileData.length <= 1) {
      return "";
    }

    return fileData;
  }

  // --- Get data from a loaded file and parse it (markdown, no need for .md)
  async parseGFM(file: string): Promise<string> {
    // Read GFM file
    const fileData: string = await this.loadFile(`${file}.md`);

    // Check if file data is empty or null
    if (!fileData || fileData.length <= 1) {
      return "";
    }

    // Render the Markdown content to HTML
    const content: string = this.md.render(fileData);
    return content;
  }

  // --- Custom directive handler for text. For this we can use the default one if we're not in a custom directive
  //      the two next functions parse any custom directive and defines them as a JSON object
  parseTags(
    tokens: Remarkable.TagToken[],
    idx: number,
    options: Remarkable.Options | undefined,
    env: Remarkable.Env | undefined,
    fallback: Remarkable.Rule<Remarkable.EmOpenToken, string> | undefined,
  ): string {
    // Check if the next token exists and is a text token
    const nextToken: Remarkable.TagToken = tokens[idx + 1];
    if (nextToken && this.isTextToken(nextToken)) {
      // Check if the first character of the content is ":"
      if (nextToken.content && nextToken.content[0] === ":") {
        this.injectedEm = true;

        // Inject a span depending on the category
        if (nextToken.content[1] === "{") {
          return this.parseJsonTag(tokens, idx);
        }
        const tagToken: string = nextToken.content[1];
        nextToken.content = nextToken.content.slice(2);
        return `<span class="${this.tagMap[tagToken]}">`;
      } else {
        // Use the fallback renderer if the content does not start with ":"
        return fallback ? fallback(tokens as Remarkable.EmOpenToken[], idx, options, env) : "";
      }
    }

    // Use the fallback renderer if the next token is not a text token
    return fallback ? fallback(tokens as Remarkable.EmOpenToken[], idx, options, env) : "";
  }

  // --- Custom directives use JSON-style data for options
  parseJsonTag(tokens: Remarkable.TagToken[], idx: number): string {
    // Ensure the next token exists and is a TextToken
    const nextToken: Remarkable.TagToken | undefined = tokens[idx + 1];
    if (!nextToken) {
      return ""; // Return an empty string if the token structure is invalid
    }

    if (!this.isTextToken(nextToken) || !nextToken.content) {
      return ""; // Return an empty string if the token structure is invalid
    }

    // Find the index of the closing bracket
    const endingIndex: number = nextToken.content.indexOf("}");
    if (endingIndex === -1) {
      return ""; // Return an empty string if no closing bracket is found
    }

    const jsonTag: string = nextToken.content.substring(1, endingIndex + 1);
    nextToken.content = nextToken.content.slice(endingIndex + 2);

    // Inline segments don't change if you only change their content
    if (nextToken.type === "inline" && nextToken.children && nextToken.children[0]) {
      const childToken: Remarkable.BlockContentToken = nextToken.children[0];
      childToken.content = nextToken.content;
    }

    const classOp: string = tokens[idx].type === "em_open" ? "tagging-text" : "tagging";

    return `<span class="${classOp}" data-tags="${jsonTag}">`;
  }

  // --- Based on the "remarkable-katex" package: https://github.com/bradhowes/remarkable-katex
  //      This modification doesn't load the katex module, since it is only needed when a new page is being shown
  //      Instead, Katex is treated as any other tags. This saves about 300kb on page load.
  parseKatex(): void {
    const backslash: string = "\\";
    const delimiter: string = "$";

    /**
     * Parse '$$' as a block. Based off of a similar method in remarkable.
     */
    const parseBlockKatex = (
      state: Remarkable.StateBlock,
      startLine: number,
      endLine: number,
    ): boolean => {
      let haveEndMarker: boolean = false;
      let pos: number = state.bMarks[startLine] + state.tShift[startLine];
      let max: number = state.eMarks[startLine];

      if (pos + 1 > max) {
        return false;
      }

      const marker: string = state.src.charAt(pos);
      if (marker !== delimiter) {
        return false;
      }

      // Scan marker length
      const mem: number = pos;
      // converts marker to Number
      pos = state.skipChars(pos, +marker);
      const len: number = pos - mem;

      if (len !== 2) {
        return false;
      }

      // Search end of block
      let nextLine: number = startLine;

      while (true) {
        ++nextLine;
        if (nextLine >= endLine) {
          break;
        }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (pos < max && state.tShift[nextLine] < state.blkIndent) {
          break;
        }
        if (state.src.charAt(pos) !== delimiter) {
          continue;
        }
        if (state.tShift[nextLine] - state.blkIndent >= 4) {
          continue;
        }

        pos = state.skipChars(pos, +marker);
        if (pos - mem < len) {
          continue;
        }

        pos = state.skipSpaces(pos);
        if (pos < max) {
          continue;
        }

        haveEndMarker = true;
        break;
      }

      // If a fence has heading spaces, they should be removed from its inner block
      const content: string = state
        .getLines(startLine + 1, nextLine, state.tShift[startLine], true)
        .replace(/[ \n]+/g, " ")
        .trim();

      state.tokens.push({
        type: "katex",
        content,
        lines: [startLine, nextLine + (haveEndMarker ? 1 : 0)],
        level: state.level,
      });
      state.line = nextLine + (haveEndMarker ? 1 : 0);
      return true;
    };

    /**
     * Look for '$' or '$$' spans in Markdown text. Based off of the 'fenced' parser in remarkable.
     */
    const parseInlineKatex = (state: Remarkable.StateInline, silent: boolean): boolean => {
      const start: number = state.pos;
      const max: number = state.posMax;
      let pos: number = start;

      // Unexpected starting character
      if (state.src.charAt(pos) !== delimiter) {
        return false;
      }

      ++pos;
      while (pos < max && state.src.charAt(pos) === delimiter) {
        ++pos;
      }

      // Capture the length of the starting delimiter -- closing one must match in size
      const marker: string = state.src.slice(start, pos);
      if (marker.length > 2) {
        return false;
      }

      const spanStart: number = pos;
      let escapedDepth: number = 0;
      while (pos < max) {
        const char: string = state.src.charAt(pos);
        if (char === "{" && (pos === 0 || state.src.charAt(pos - 1) !== backslash)) {
          escapedDepth++;
        } else if (char === "}" && (pos === 0 || state.src.charAt(pos - 1) !== backslash)) {
          escapedDepth--;
          if (escapedDepth < 0) {
            return false;
          }
        } else if (char === delimiter && escapedDepth === 0) {
          const matchStart: number = pos;
          let matchEnd: number = pos + 1;
          while (matchEnd < max && state.src.charAt(matchEnd) === delimiter) {
            ++matchEnd;
          }

          if (matchEnd - matchStart === marker.length) {
            if (!silent) {
              const content: string = state.src
                .slice(spanStart, matchStart)
                .replace(/[ \n]+/g, " ")
                .trim();
              state.push({
                type: "katex",
                content,
                block: marker.length > 1,
                level: state.level,
              });
            }
            state.pos = matchEnd;
            return true;
          }
        }
        pos++;
      }

      if (!silent) {
        state.pending += marker;
      }
      state.pos += marker.length;

      return true;
    };

    this.md.inline.ruler.push("katex", parseInlineKatex.bind(this), {});
    this.md.block.ruler.push("katex", parseBlockKatex.bind(this), {});
    this.md.renderer.rules.katex = (
      tokens: Remarkable.BlockContentToken[],
      idx: number,
    ): string => {
      return `<span class="tagging-katex">${tokens[idx].content}</span>`;
    };
  }
}
