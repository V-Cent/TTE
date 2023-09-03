// parser.js is a async markdown-to-html parser.

import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import slug from "remark-slug";
import toc from "remark-toc";
import math from "remark-math";
import katex from "rehype-katex";
import emoji from "remark-emoji";
import remarkImages from "remark-images";
import directive from "remark-directive";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { h } from "hastscript";

// TODO - A simple, lightweight parser that is custom to TTE would probably bring the
// TODO -   total JS size to >100kb. That would probably make styling easier too.

// --- Functions related to file parsing
function loadFile(filePath) {
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

export async function parseGFM(file) {
  //Read GFM file
  let fileData = await loadFile(file + ".md");
  if (fileData.length <= 1 || fileData == null) {
    return "";
  }
  let content = "";
  //Using the unified environment, transform the text GFM format to HTML to be injected into the page
  //Also supports LaTeX-like math, Table of Contents, custom directives, emojis...
  unified()
    .use(toc, { parents: ["root", "containerDirective"] })
    .use(markdown)
    .use(directive)
    .use(htmlDirectives)
    .use(gfm)
    .use(slug)
    .use(math)
    .use(remarkImages)
    .use(remark2rehype)
    .use(katex)
    .use(emoji)
    .use(stringify)
    .process(fileData, function (err, file) {
      if (err) {
        console.log(err);
      } else {
        content = file;
      }
    });
  //Return the HTML data
  return content;
}

// --- Functions related to custom directives
function htmlDirectives() {
  return transform;

  function transform(tree) {
    //For different directives on the tree, run onDirective()
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      onDirective
    );
  }

  function onDirective(node) {
    //Gets data from the node
    let data = node.data || (node.data = {});
    let hast = h(node.name, node.attributes);

    //From that data, a new div will be created (or paragraph if no properties were given)
    if (hast.properties.length > 0) {
      data.hName = "div";
    } else {
      data.hName = "span";
    }
    //Assign tags and properties from node to the div, which will be used by other functions
    hast.properties = Object.assign({ class: hast.tagName }, hast.properties);
    data.hProperties = hast.properties;
  }
}
