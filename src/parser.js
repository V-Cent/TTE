
// ---------
// parser.js is an async markdown-to-html parser.
//   this is used before anything is ready (before the DOM) so search and pages can appear faster

import { Remarkable } from 'remarkable'; // This is where the bulk of the filesize comes from

export class Parser {
  constructor() {
    // https://www.npmjs.com/package/remarkable-youtube
    //     When video sources are from Youtube? or remarkable-embed
    this.md = new Remarkable('full', {
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
      "r": "red",
      "b": "blue",
      "g": "green",
      "y": "yellow",
      "p": "pink",
      "t": "teal",
      "!": "spoiler"
    };
    this.updateRules();
  }

  // For custom directives --> capture when the markdown has a special call either :{ in a heading or *:{ in text
  updateRules() {
    // Define new handlers for text
    this.md.renderer.rules.heading_open = function(tokens, idx, options, env) {
      if (tokens[idx+1].content[0] == ':') {
        this.injectedHeading = true;
        // Inject a span depending on the category
        if (tokens[idx+1].content[1] == '{') {
          // parseJsonTag modifies tokens, so baseReturn should be recalculated.
          let spanReturn = this.parseJsonTag(tokens, idx);
          let baseReturn = '<h' + tokens[idx].hLevel + ' id="' + tokens[idx+1].content.replace(/\s+/g, '-').toLowerCase() + '">';
          return spanReturn + baseReturn;
        }
      } else {
        // Instead of the default handler, use this so we can use the id later for search
        let baseReturn = '<h' + tokens[idx].hLevel + ' id="' + tokens[idx+1].content.replace(/\s+/g, '-').toLowerCase() + '">';
        return baseReturn;
      }
    }.bind(this);

    this.md.renderer.rules.em_open = function(tokens, idx, options, env) {
      return this.parseTags(tokens, idx, options, env, this.openEmRenderer);
    }.bind(this);

    this.md.renderer.rules.heading_close = function(tokens, idx, options, env) {
      if (this.injectedHeading) {
        this.injectedHeading = false;
        let headingEnd = this.closeHeadingRenderer(tokens, idx, options, env);
        // Change new line position or styling will mess up
        return headingEnd.concat("</span>").replace(/\n/g, ' ') + "\n";
      } else {
        return this.closeHeadingRenderer(tokens, idx, options, env);
      }
    }.bind(this);

    this.md.renderer.rules.em_close = function(tokens, idx, options, env) {
      if (this.injectedEm) {
        this.injectedEm = false;
        return '</span>';
      } else {
        return this.closeEmRenderer(tokens, idx, options, env);
      }
    }.bind(this);

    this.parseKatex();
  }

  // Load a text file on a relative path
  async loadFile(filePath) {
    return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", filePath, true);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText,
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      };
      xhr.send();
    });
  }

  async asyncRead(file) {
    let fileData = await this.loadFile(file);
    if (fileData.length <= 1 || fileData == null) {
      return "";
    }
    return fileData;
  }

  // Parse a MD file with our custom rules
  async parseGFM(file) {
    //Read GFM file
    let fileData = await this.loadFile(file + ".md");
    if (fileData.length <= 1 || fileData == null) {
      return "";
    }
    let content = "";
    //Return the HTML data
    content = this.md.render(fileData);
    return content;
  }

  // Custom directive handler for text. For this we can use the default one if we're not in a custom directive
  parseTags(tokens, idx, options, env, fallback) {
    // Check if first token is a :
    //   if yes, apply changes
    //   if not, use default handler
    if (tokens[idx+1].type == "text") {
      if (tokens[idx+1].content[0] == ':') {
        this.injectedEm = true;
        // Inject a span depending on the category
        if (tokens[idx+1].content[1] == '{') {
          return this.parseJsonTag(tokens, idx);
        } else {
          let tagToken = tokens[idx+1].content[1];
          tokens[idx+1].content = tokens[idx+1].content.slice(2);
          return '<span class="' + this.tagMap[tagToken] + '">';
        }
      } else {
        return fallback(tokens, idx, options, env);
      }
    } else {
      return fallback(tokens, idx, options, env);
    }
  }

  // Custom directives use JSON-style data for options
  parseJsonTag(tokens, idx) {
    // Find index of closing bracket
    let endingIndex = tokens[idx+1].content.indexOf('}');
    let jsonTag = tokens[idx+1].content.substring(1, endingIndex + 1);
    tokens[idx+1].content = tokens[idx+1].content.slice(endingIndex + 2);
    // Inline segments don't change if you only change their content
    if (tokens[idx+1].type == "inline") {
      tokens[idx+1].children[0].content = tokens[idx+1].content;
    }
    let classOp = "tagging";
    if (tokens[idx].type == "em_open") {
      classOp = "tagging-text";
    }
    return '<span class="'+ classOp +'" data-tags="' + jsonTag + '">';
  }

  // Based on the "remarkable-katex" package: https://github.com/bradhowes/remarkable-katex
  //   This modification doesn't load the katex module, since it is only needed when a new page is being shown
  //   Instead, Katex is treated as any other tags. This saves about 300kb on page load.
  parseKatex() {
    const backslash = '\\'
    const delimiter = '$';
    /**
     * Parse '$$' as a block. Based off of similar method in remarkable.
     */
    const parseBlockKatex = (state, startLine, endLine) => {
      let haveEndMarker = false;
      let pos = state.bMarks[startLine] + state.tShift[startLine];
      let max = state.eMarks[startLine];

      if (pos + 1 > max) { return false; }

      const marker = state.src.charAt(pos);
      if (marker !== delimiter) { return false; }

      // scan marker length
      let mem = pos;
      pos = state.skipChars(pos, marker);
      let len = pos - mem;

      if (len !== 2) { return false; }

      // search end of block
      let nextLine = startLine;

      for (;;) {
        ++nextLine;
        if (nextLine >= endLine) { break; }

        pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (pos < max && state.tShift[nextLine] < state.blkIndent) { break; }
        if (state.src.charAt(pos) !== delimiter) { continue; }
        if (state.tShift[nextLine] - state.blkIndent >= 4) { continue; }

        pos = state.skipChars(pos, marker);
        if (pos - mem < len) { continue; }

        pos = state.skipSpaces(pos);
        if (pos < max) { continue; }

        haveEndMarker = true;
        break;
      }

      // If a fence has heading spaces, they should be removed from its inner block
      len = state.tShift[startLine];
      state.line = nextLine + (haveEndMarker ? 1 : 0);
      const content = state.getLines(startLine + 1, nextLine, len, true)
              .replace(/[ \n]+/g, ' ')
              .trim();

      state.tokens.push({type: 'katex', params: null, content: content, lines: [startLine, state.line],
                         level: state.level, block: true});
      return true;
    };

    /**
     * Look for '$' or '$$' spans in Markdown text. Based off of the 'fenced' parser in remarkable.
     */
    const parseInlineKatex = (state, silent) => {
      const start = state.pos;
      const max = state.posMax;
      let pos = start;

      // Unexpected starting character
      if (state.src.charAt(pos) !== delimiter) { return false; }

      ++pos;
      while (pos < max && state.src.charAt(pos) === delimiter) { ++pos; }

      // Capture the length of the starting delimiter -- closing one must match in size
      const marker = state.src.slice(start, pos);
      if (marker.length > 2) { return false; }

      const spanStart = pos;
      let escapedDepth = 0;
      while (pos < max) {
        const char = state.src.charAt(pos);
        if (char === '{' && (pos == 0 || state.src.charAt(pos - 1) != backslash)) {
          escapedDepth += 1;
        } else if (char === '}' && (pos == 0 || state.src.charAt(pos - 1) != backslash)) {
          escapedDepth -= 1;
          if (escapedDepth < 0) { return false; }
        } else if (char === delimiter && escapedDepth === 0) {
          const matchStart = pos;
          let matchEnd = pos + 1;
          while (matchEnd < max && state.src.charAt(matchEnd) === delimiter) { ++matchEnd; }

          if (matchEnd - matchStart === marker.length) {
            if (!silent) {
              const content = state.src.slice(spanStart, matchStart)
                  .replace(/[ \n]+/g, ' ')
                  .trim();
              state.push({type: 'katex', content: content, block: marker.length > 1, level: state.level});
            }
            state.pos = matchEnd;
            return true;
          }
        }
        pos += 1;
      }

      if (!silent) { state.pending += marker; }
      state.pos += marker.length;

      return true;
    };

    this.md.inline.ruler.push('katex', parseInlineKatex.bind(this), {});
    this.md.block.ruler.push('katex', parseBlockKatex.bind(this), {});
    this.md.renderer.rules.katex = (tokens, idx) => {
      return '<span class="tagging-katex">' + tokens[idx].content + '</span>';
    };
    this.md.renderer.rules.katex.delimiter = delimiter;
  };
}
