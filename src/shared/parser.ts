// ---------
// parser.js is an async markdown-to-html parser.
//   has Remarkable as a dependency.
//   runs only during html file generation or on live-edit mode.

import { Remarkable } from "remarkable";
import { EmCloseToken, EmOpenToken, HeadingCloseToken } from "remarkable/lib";

interface FileLoadError {
  status: string | number;
  statusText: string;
}

export class Parser {
  private readonly markdownObj: Remarkable;
  private readonly openEmRenderer: Remarkable.Rule<EmOpenToken, string> | undefined;
  private readonly closeEmRenderer: Remarkable.Rule<EmCloseToken, string> | undefined;
  private readonly closeHeadingRenderer: Remarkable.Rule<HeadingCloseToken, string> | undefined;
  private hasInjectedHeading: boolean;
  private hasInjectedEm: boolean;
  // tagMap is for simple text transforms
  private readonly tagMap: Record<string, string>;
  private readonly isBrowser: boolean;
  private readonly idSanitizationRegex: RegExp = /\s+/g;
  private readonly spaceNewlineRegex: RegExp = /[ \n]+/g;

  constructor(isBrowser: boolean = true) {
    // https://www.npmjs.com/package/remarkable-youtube
    //     When video sources are from Youtube? or remarkable-embed
    this.markdownObj = new Remarkable("full", {
      html: true,
      typographer: false,
    });

    this.isBrowser = isBrowser; // Environment

    // Rules that we want to modify for custom directives
    this.openEmRenderer = this.markdownObj.renderer.rules.em_open;
    this.closeEmRenderer = this.markdownObj.renderer.rules.em_close;
    this.closeHeadingRenderer = this.markdownObj.renderer.rules.heading_close;
    this.hasInjectedHeading = false;
    this.hasInjectedEm = false;

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
  private updateRules(): void {
    // Custom directives are all based around :{
    //   : overwrites previous handler so we know we're in a different scope (*hello* will not get caught and *:hello* will)
    //   { allows us to save any kind of data in that block (*:{...json}*)

    // Define new handlers for text
    this.markdownObj.renderer.rules.heading_open = (
      tokens: Remarkable.TagToken[],
      tokenIndex: number,
    ): string => {
      const nextToken: Remarkable.TagToken = tokens[tokenIndex + 1];

      // If a valid text token and a heading --> e.g., aplies to ####:{ ...
      if (nextToken && this.isTextToken(nextToken) && nextToken.content?.startsWith(":")) {
        this.hasInjectedHeading = true;

        // Inject a span depending on the category
        if (nextToken.content[1] === "{") {
          // parseJsonTag modifies tokens, so baseReturn should be recalculated.
          const spanTagHtml: string = this.parseJsonTag(tokens, tokenIndex);
          const headingLevelToken: Remarkable.HeadingOpenToken = tokens[
            tokenIndex
          ] as Remarkable.HeadingOpenToken;
          const sanitizedId: string = nextToken.content
            .replace(this.idSanitizationRegex, "-")
            .toLowerCase();
          return `${spanTagHtml}<h${headingLevelToken.hLevel} id="${sanitizedId}">`;
        }
      }

      // Instead of the default handler, use this so we can use the id later for search
      //   headings now have an id so that they can be searched for redirections
      if (nextToken && this.isTextToken(nextToken) && nextToken.content) {
        const headingLevelToken: Remarkable.HeadingOpenToken = tokens[
          tokenIndex
        ] as Remarkable.HeadingOpenToken;
        const sanitizedId: string = nextToken.content
          .replace(this.idSanitizationRegex, "-")
          .toLowerCase();
        return `<h${headingLevelToken.hLevel} id="${sanitizedId}">`;
      }

      // Fallback in case nextToken is undefined or not a TextToken
      const headingLevelToken: Remarkable.HeadingOpenToken = tokens[
        tokenIndex
      ] as Remarkable.HeadingOpenToken;
      return `<h${headingLevelToken.hLevel}>`;
    };

    this.markdownObj.renderer.rules.em_open = (
      tokens: Remarkable.TagToken[],
      tokenIndex: number,
      markdownOptions: Remarkable.Options | undefined,
      environmentData: Remarkable.Env | undefined,
    ): string =>
      this.parseTextTags(tokens, tokenIndex, markdownOptions, environmentData, this.openEmRenderer);

    this.markdownObj.renderer.rules.heading_close = (
      tokens: Remarkable.HeadingCloseToken[],
      tokenIndex: number,
      markdownOptions: Remarkable.Options | undefined,
      environmentData: Remarkable.Env | undefined,
    ): string => {
      if (this.hasInjectedHeading) {
        this.hasInjectedHeading = false;
        const headingEnd: string = this.closeHeadingRenderer!(
          tokens,
          tokenIndex,
          markdownOptions,
          environmentData,
        );
        // Change new line position or styling will mess up
        return `${headingEnd.concat("</span>").replace(/\n/g, " ")}\n`;
      }
      return this.closeHeadingRenderer!(tokens, tokenIndex, markdownOptions, environmentData);
    };

    this.markdownObj.renderer.rules.em_close = (
      tokens: Remarkable.EmCloseToken[],
      tokenIndex: number,
      markdownOptions: Remarkable.Options | undefined,
      environmentData: Remarkable.Env | undefined,
    ): string => {
      if (this.hasInjectedEm) {
        this.hasInjectedEm = false;
        return "</span>";
      }
      return this.closeEmRenderer!(tokens, tokenIndex, markdownOptions, environmentData);
    };

    this.setupKatexParsing();
  }

  // --- Load a text file on a relative path
  async loadFile(filePath: string): Promise<string> {
    if (this.isBrowser) {
      return new Promise<string>(
        (resolve: (value: string) => void, reject: (reason: FileLoadError) => void) => {
          const xmlHttpRequest: XMLHttpRequest = new XMLHttpRequest();
          xmlHttpRequest.open("GET", filePath, true);

          xmlHttpRequest.onload = (): void => {
            if (xmlHttpRequest.status >= 200 && xmlHttpRequest.status < 300) {
              resolve(xmlHttpRequest.response);
            } else {
              reject({
                status: xmlHttpRequest.status,
                statusText: xmlHttpRequest.statusText,
              });
            }
          };

          xmlHttpRequest.onerror = (): void => {
            reject({
              status: xmlHttpRequest.status,
              statusText: xmlHttpRequest.statusText,
            });
          };

          xmlHttpRequest.send();
        },
      );
    }
    // Node.js environment: use dynamic imports for fs and path
    try {
      // this dynamically imports the everything from both imports
      //   browser will not access these
      //   typed with typeof since it's a pain to get these with typescript
      const nodeFileSystem: typeof import("node:fs") = await import("node:fs");
      const nodePath: typeof import("node:path") = await import("node:path");

      return new Promise<string>(
        (resolve: (value: string) => void, reject: (reason: FileLoadError) => void) => {
          // relative filePath from project root
          const absoluteFilePath: string = nodePath.resolve(filePath);
          nodeFileSystem.readFile(
            absoluteFilePath,
            "utf8",
            (fileError: NodeJS.ErrnoException | null, fileData: string) => {
              if (fileError) {
                reject({
                  status: fileError.code ?? "NODE_FS_ERROR",
                  statusText: fileError.message,
                });
              } else {
                resolve(fileData);
              }
            },
          );
        },
      );
    } catch (moduleLoadError: unknown) {
      console.error("Failed to load Node.js modules 'fs' or 'path'", moduleLoadError);
      return Promise.reject({
        status: "MODULE_LOAD_ERROR",
        statusText:
          "Failed to load Node.js specific modules. Ensure you are in a Node.js environment.",
      });
    }
  }

  // --- Get data from a loaded file and parse it (markdown, no need for .md)
  async parseGFM(markdownFileName: string): Promise<string> {
    // Read GFM file
    const markdownFileData: string = await this.loadFile(`${markdownFileName}.md`);

    if (!markdownFileData || markdownFileData.length <= 1) {
      return "";
    }

    const convertedText: string = this.resolveDirectives(markdownFileData);

    // Render the Markdown content to HTML
    return this.markdownObj.render(convertedText);
  }

  // --- Directly parse input text
  async parseText(markdownText: string): Promise<string> {
    if (!markdownText || markdownText.length <= 1) {
      return "";
    }

    const convertedText: string = this.resolveDirectives(markdownText);

    // Render the Markdown content to HTML
    return this.markdownObj.render(convertedText);
  }

  public resolveDirectives(inputText: string): string {
    const lines: string[] = inputText.split("\n");

    const sanitizeForId = (text: string): string => {
      if (!text) return "";
      return String(text).replace(/\s+/g, "-").toLowerCase();
    };

    return lines
      .map((originalCurrentLine: string): string => {
        // Remove trailing carriage return if present (from \r\n line endings)
        const currentLine: string = originalCurrentLine.replace(/\r$/, "");

        let processedLine: string = currentLine;
        const placeholders: Map<string, string> = new Map<string, string>();
        let placeholderId: number = 0;

        // Temporarily replace escaped sequences to protect them
        processedLine = processedLine.replace(
          /\\(\[\[|]]|\{\{|\}\}|!!)/g,
          (_match: string, escapedSequence: string): string => {
            const placeholder: string = `__ESCAPED_DIRECTIVE_PLACEHOLDER_${placeholderId++}__`;
            placeholders.set(placeholder, escapedSequence);
            return placeholder;
          },
        );

        // Process Heading Directives (NO emphasis)
        const headingTodoVersionRegex: RegExp = /^(#{1,6})\s*\{\{(!|[^}]+)\}\}(.*)$/;
        const lineAfterHeadingTodo: string = processedLine.replace(
          headingTodoVersionRegex,
          (
            _match: string,
            headingLevel: string,
            directiveContent: string,
            trailingText: string,
          ): string => {
            const directiveTextPart: string =
              directiveContent === "!"
                ? `:{ 'todo' : true }`
                : `:{ 'versions' : '${String(directiveContent)}' }`;

            let finalTrailingText: string = trailingText;
            if (trailingText && !trailingText.startsWith(" ") && !trailingText.startsWith("\t")) {
              finalTrailingText = " " + trailingText;
            } else if (!trailingText) {
              finalTrailingText = "";
            }
            return `${headingLevel} ${directiveTextPart.trimEnd()}${finalTrailingText}`;
          },
        );
        // Only update processedLine if a change actually occurred.
        // This prevents the general rule from running if the heading rule matched and transformed the line.
        if (processedLine !== lineAfterHeadingTodo) {
          processedLine = lineAfterHeadingTodo;
        } else {
          // Media
          const headingMediaRegex: RegExp =
            /^(#{1,6})\s*\[\[(!)?Media:([^|]*?)(?:\|([^\]]*))?\]\](.*)$/;
          const lineAfterHeadingMedia: string = processedLine.replace(
            headingMediaRegex,
            (
              _match: string,
              headingLevel: string,
              hiddenMarker: string | undefined,
              mediaLink: string,
              mediaCaption: string | undefined,
              trailingText: string,
            ): string => {
              const parts: string[] = [];
              parts.push(`'media' : '${mediaLink || ""}'`);
              if (mediaCaption !== undefined) {
                parts.push(`'caption' : '${String(mediaCaption)}'`);
              }
              if (hiddenMarker) {
                parts.push(`'forcedmedia' : false`);
              }
              const directiveTextPart: string = `:{ ${parts.join(", ")} }`;

              let separator: string = "";
              if (
                trailingText &&
                !trailingText.startsWith(" ") &&
                !trailingText.startsWith("\t") &&
                !directiveTextPart.endsWith(" ")
              ) {
                separator = " ";
              }
              return `${headingLevel} ${directiveTextPart}${separator}${trailingText}`;
            },
          );
          if (processedLine !== lineAfterHeadingMedia) {
            processedLine = lineAfterHeadingMedia;
          } else {
            // Spoiler
            processedLine = processedLine.replace(
              /!!(.*?)!!/g,
              (_match: string, content: string): string => `*:!${String(content)}*`,
            );

            // Version/Todo
            const generalTodoVersionRegex: RegExp = /\{\{(!|[^}]+)\}\}/g;
            processedLine = processedLine.replace(
              generalTodoVersionRegex,
              (_match: string, directiveContent: string): string => {
                if (directiveContent === "!") {
                  return `*:{'todo' : true}*`;
                } else {
                  return `*:{'versions' : '${String(directiveContent)}'}*`;
                }
              },
            );

            // Double Brackets
            processedLine = processedLine.replace(
              /\[\[([^\]]+?)\]\]/g,
              (_match: string, contentStrInput: string): string => {
                const contentStr: string = String(contentStrInput);
                if (contentStr.trim() === "") {
                  return _match;
                }

                if (/^\d+$/.test(contentStr)) {
                  return `*{'reference' : true}${contentStr}*`;
                }

                const mediaMatch: RegExpMatchArray | null = contentStr.match(
                  /^(!)?([<>])?Media:([^|]*?)(?:\|(.*))?$/,
                );
                if (mediaMatch) {
                  const isHiddenByExclamation: boolean = !!mediaMatch[1];
                  const floatMarker: string | undefined = mediaMatch[2];
                  const mediaLink: string = mediaMatch[3] || "";
                  const mediaCaption: string | undefined = mediaMatch[4];
                  const parts: string[] = [];
                  parts.push(`'media' : '${mediaLink}'`);

                  if (mediaCaption !== undefined) {
                    parts.push(`'caption' : '${String(mediaCaption)}'`);
                  }

                  // Can either be floating or be hidden. Not both.
                  if (floatMarker) {
                    parts.push(`'float' : '${floatMarker === "<" ? "left" : "right"}'`);
                  } else if (isHiddenByExclamation) {
                    parts.push(`'forcedmedia' : false`);
                  }

                  return `*:{ ${parts.join(", ")} }*`;
                }

                const redirectMatch: RegExpMatchArray | null = contentStr.match(
                  /^(?:\{([^}]+)\})?([^|]+?)(?:\|(.*))?$/,
                );
                if (redirectMatch) {
                  const docName: string | undefined = redirectMatch[1];
                  const linkTarget: string = redirectMatch[2];
                  const displayText: string =
                    redirectMatch[3] !== undefined ? String(redirectMatch[3]) : linkTarget;
                  const sanitizedId: string = sanitizeForId(linkTarget);
                  const parts: string[] = [];
                  parts.push(`'redirect' : '#${sanitizedId}'`);
                  if (docName) {
                    parts.push(`'document' : '${String(docName)}'`);
                  }
                  return `*:{ ${parts.join(", ")} } ${displayText}*`;
                }

                return _match;
              },
            );
          }
        }

        // Restore escaped sequences from placeholders
        placeholders.forEach((originalSequence: string, placeholder: string) => {
          const placeholderRegex: RegExp = new RegExp(
            placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g",
          );
          processedLine = processedLine.replace(placeholderRegex, originalSequence);
        });

        return processedLine;
      })
      .join("\n");
  }

  // --- Custom directive handler for text. For this we can use the default one if we're not in a custom directive
  //      the two next functions parse any custom directive and defines them as a JSON object
  //      e.g., this matches *:{ ... during text.
  private parseTextTags(
    tokens: Remarkable.TagToken[],
    tokenIndex: number,
    markdownOptions: Remarkable.Options | undefined,
    environmentData: Remarkable.Env | undefined,
    fallbackRenderer: Remarkable.Rule<Remarkable.EmOpenToken, string> | undefined,
  ): string {
    // Check if the next token exists and is a text token
    const nextToken: Remarkable.TagToken = tokens[tokenIndex + 1];

    if (!this.isTextToken(nextToken) || !nextToken.content) {
      return (
        fallbackRenderer?.(
          tokens as Remarkable.EmOpenToken[],
          tokenIndex,
          markdownOptions,
          environmentData,
        ) ?? ""
      );
    }

    // Check if the first character of the content is ":"
    if (nextToken.content.startsWith(":")) {
      this.hasInjectedEm = true;

      // Inject a span depending on the category
      if (nextToken.content[1] === "{") {
        return this.parseJsonTag(tokens, tokenIndex);
      }
      const shorthandTagCharacter: string = nextToken.content[1];
      nextToken.content = nextToken.content.slice(2);
      return `<span class="${this.tagMap[shorthandTagCharacter]}">`;
    }

    // Use the fallback renderer if the content does not start with ":"
    return (
      fallbackRenderer?.(
        tokens as Remarkable.EmOpenToken[],
        tokenIndex,
        markdownOptions,
        environmentData,
      ) ?? ""
    );
  }

  // --- Custom directives use JSON-style data for options
  private parseJsonTag(tokens: Remarkable.TagToken[], tokenIndex: number): string {
    // Ensure the next token exists and is a TextToken
    const nextToken: Remarkable.TagToken | undefined = tokens[tokenIndex + 1];

    if (!this.isTextToken(nextToken) || !nextToken.content) {
      return ""; // Return an empty string if the token structure is invalid
    }

    // Find the index of the closing bracket
    const closingBracketIndex: number = nextToken.content.indexOf("}");
    if (closingBracketIndex === -1) {
      return ""; // Return an empty string if no closing bracket is found
    }

    const jsonTagContent: string = nextToken.content.substring(1, closingBracketIndex + 1);
    nextToken.content = nextToken.content.slice(closingBracketIndex + 2);

    // Inline segments don't change if you only change their content
    if (nextToken.type === "inline" && nextToken.children?.[0]) {
      const childContentToken: Remarkable.BlockContentToken = nextToken.children[0];
      childContentToken.content = nextToken.content;
    }

    const cssClassName: string = tokens[tokenIndex].type === "em_open" ? "tagging-text" : "tagging";
    return `<span class="${cssClassName}" data-tags="${jsonTagContent}">`;
  }

  // --- Based on the "remarkable-katex" package: https://github.com/bradhowes/remarkable-katex
  //      This modification doesn't load the katex module, since it is only needed when a new page is being shown
  //      Instead, Katex is treated as any other tags. This saves about 300kb on page load.
  private setupKatexParsing(): void {
    const backslashCharacter: string = "\\";
    const dollarDelimiter: string = "$";

    /**
     * Parse '$$' as a block. Based off of a similar method in remarkable.
     */
    const parseBlockKatex = (
      markdownState: Remarkable.StateBlock,
      startLineNumber: number,
      endLineNumber: number,
    ): boolean => {
      let hasFoundEndMarker: boolean = false;
      let currentPosition: number =
        markdownState.bMarks[startLineNumber] + markdownState.tShift[startLineNumber];
      const maxPosition: number = markdownState.eMarks[startLineNumber];

      if (currentPosition + 1 > maxPosition) {
        return false;
      }

      const markerCharacter: string = markdownState.src.charAt(currentPosition);
      if (markerCharacter !== dollarDelimiter) {
        return false;
      }

      // Scan marker length
      const markerStartPosition: number = currentPosition;
      // converts marker to Number
      currentPosition = markdownState.skipChars(currentPosition, +markerCharacter);
      const markerLength: number = currentPosition - markerStartPosition;

      if (markerLength !== 2) {
        return false;
      }

      // Search end of block
      let currentLineNumber: number = startLineNumber;

      while (currentLineNumber < endLineNumber) {
        ++currentLineNumber;

        currentPosition =
          markdownState.bMarks[currentLineNumber] + markdownState.tShift[currentLineNumber];
        const currentMaxPosition: number = markdownState.eMarks[currentLineNumber];

        if (
          currentPosition < currentMaxPosition &&
          markdownState.tShift[currentLineNumber] < markdownState.blkIndent
        ) {
          break;
        }
        if (markdownState.src.charAt(currentPosition) !== dollarDelimiter) {
          continue;
        }
        if (markdownState.tShift[currentLineNumber] - markdownState.blkIndent >= 4) {
          continue;
        }

        currentPosition = markdownState.skipChars(currentPosition, +markerCharacter);
        if (currentPosition - markerStartPosition < markerLength) {
          continue;
        }

        currentPosition = markdownState.skipSpaces(currentPosition);
        if (currentPosition < currentMaxPosition) {
          continue;
        }

        hasFoundEndMarker = true;
        break;
      }

      // If a fence has heading spaces, they should be removed from its inner block
      const katexContent: string = markdownState
        .getLines(
          startLineNumber + 1,
          currentLineNumber,
          markdownState.tShift[startLineNumber],
          true,
        )
        .replace(this.spaceNewlineRegex, " ")
        .trim();

      markdownState.tokens.push({
        type: "katex",
        content: katexContent,
        lines: [startLineNumber, currentLineNumber + (hasFoundEndMarker ? 1 : 0)],
        level: markdownState.level,
      });
      markdownState.line = currentLineNumber + (hasFoundEndMarker ? 1 : 0);
      return true;
    };

    /**
     * Look for '$' or '$$' spans in Markdown text. Based off of the 'fenced' parser in remarkable.
     */
    const parseInlineKatex = (
      inlineState: Remarkable.StateInline,
      isSilentMode: boolean,
    ): boolean => {
      const startPosition: number = inlineState.pos;
      const maxPosition: number = inlineState.posMax;
      let currentPosition: number = startPosition;

      // Unexpected starting character
      if (inlineState.src.charAt(currentPosition) !== dollarDelimiter) {
        return false;
      }

      ++currentPosition;
      while (
        currentPosition < maxPosition &&
        inlineState.src.charAt(currentPosition) === dollarDelimiter
      ) {
        ++currentPosition;
      }

      // Capture the length of the starting delimiter -- closing one must match in size
      const markerString: string = inlineState.src.slice(startPosition, currentPosition);
      if (markerString.length > 2) {
        return false;
      }

      const spanStartPosition: number = currentPosition;
      let bracketDepth: number = 0;

      while (currentPosition < maxPosition) {
        const currentCharacter: string = inlineState.src.charAt(currentPosition);
        const previousCharacter: string =
          currentPosition > 0 ? inlineState.src.charAt(currentPosition - 1) : "";

        if (currentCharacter === "{" && previousCharacter !== backslashCharacter) {
          bracketDepth++;
        } else if (currentCharacter === "}" && previousCharacter !== backslashCharacter) {
          bracketDepth--;
          if (bracketDepth < 0) {
            return false;
          }
        } else if (currentCharacter === dollarDelimiter && bracketDepth === 0) {
          const matchStartPosition: number = currentPosition;
          let matchEndPosition: number = currentPosition + 1;

          while (
            matchEndPosition < maxPosition &&
            inlineState.src.charAt(matchEndPosition) === dollarDelimiter
          ) {
            ++matchEndPosition;
          }

          if (matchEndPosition - matchStartPosition === markerString.length) {
            if (!isSilentMode) {
              const katexContent: string = inlineState.src
                .slice(spanStartPosition, matchStartPosition)
                .replace(this.spaceNewlineRegex, " ")
                .trim();
              inlineState.push({
                type: "katex",
                content: katexContent,
                block: markerString.length > 1,
                level: inlineState.level,
              });
            }
            inlineState.pos = matchEndPosition;
            return true;
          }
        }
        currentPosition++;
      }

      if (!isSilentMode) {
        inlineState.pending += markerString;
      }
      inlineState.pos += markerString.length;
      return true;
    };

    this.markdownObj.inline.ruler.push("katex", parseInlineKatex.bind(this), {});
    this.markdownObj.block.ruler.push("katex", parseBlockKatex.bind(this), {});
    this.markdownObj.renderer.rules.katex = (
      tokens: Remarkable.BlockContentToken[],
      tokenIndex: number,
    ): string => `<span class="tagging-katex">${tokens[tokenIndex].content}</span>`;
  }
}
