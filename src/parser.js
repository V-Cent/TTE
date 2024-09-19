
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
}
