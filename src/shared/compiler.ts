// ---------
// compiler.js is used for live editing of Markdown files and compiling the resulting HTML
//   the idea behind this is to make every static DOM operation be available as a script, and in the browser
//   this also includes compiling search results that will be inserted into the nav-bar later
//   the live document flow will be thus compiled --> setup event handlers

import { Parser } from "./parser";
import { colorCollection, colorList, colors, FileEntry, h2Data, Helper, TagData } from "./helper";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { basicSetup, EditorView } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import {
  autocompletion,
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";

interface SearchResultItem {
  html: string;
  type: "game" | "tech";
  primarySortKey: string;
  secondarySortKey?: string;
}

export class Compiler {
  private readonly parserObj: Parser;
  private readonly helperObj: Helper;
  private headingColorsIndex: number = 0;
  private readonly availableColors: colors[] = colorList;
  private katexRenderer: { renderToString: (input: string) => string } | null;
  private versionColorMap: Map<string, string>;
  private readonly isRunningInBrowser: boolean;
  private readonly searchResultsCollection: SearchResultItem[];

  private readonly imageFileRegex: RegExp = /\.(webp|png|jpg|jpeg|gif)$|&ii$/;
  private readonly gameDocumentRegex: RegExp = /-[CB]$/;

  private readonly taggedElementsSelector: string = ".tagging, .tagging-text";
  private readonly katexElementsSelector: string = ".tagging-katex";

  private editor: EditorView | null = null;

  private directiveCompletions: readonly Completion[] = [
    // Media completions (highest boost - top priority)
    {
      label: "[[Media:]]",
      displayLabel: "Media: Basic",
      type: "function",
      apply: "[[Media:<link>]]",
      info: "Embed image or video",
      boost: 11,
    },
    {
      label: "[[!Media:]]",
      displayLabel: "Media: Hidden",
      type: "function",
      apply: "[[!Media:<link>]]",
      info: "Media to the left of text",
      boost: 13,
    },
    {
      label: "[[<Media:]]",
      displayLabel: "Media: Float Left",
      type: "function",
      apply: "[[<Media:<link>]]",
      info: "Media behind clickable icon",
      boost: 12,
    },
    {
      label: "[[>Media:]]",
      displayLabel: "Media: Float Right",
      type: "function",
      apply: "[[>Media:<link>]]",
      info: "Media to the right of text",
      boost: 11,
    },
    {
      label: "[[Media:|]]",
      displayLabel: "Media: With Caption",
      type: "function",
      apply: "[[Media:<link>|Caption here.]]",
      info: "Media with descriptive text",
      boost: 10,
    },
    {
      label: "[[!Media:|]]",
      displayLabel: "Media: Hidden + Caption",
      type: "function",
      apply: "[[!Media:<link>|Caption here.]]",
      info: "Hidden media with caption",
      boost: 9,
    },
    {
      label: "[[<Media:|]]",
      displayLabel: "Media: Float Left + Caption",
      type: "function",
      apply: "[[<Media:<link>|Caption here.]]",
      info: "Float left with caption",
      boost: 8,
    },
    {
      label: "[[>Media:|]]",
      displayLabel: "Media: Float Right + Caption",
      type: "function",
      apply: "[[>Media:<link>|Caption here.]]",
      info: "Float right with caption",
      boost: 7,
    },

    // Redirect completions (medium boost)
    {
      label: "[[x]]",
      displayLabel: "Redirect: Reference",
      type: "function",
      apply: "[[x]]",
      info: "Link to References section",
      boost: 6,
    },
    {
      label: "[[Heading]]",
      displayLabel: "Redirect: Same Page",
      type: "function",
      apply: "[[Heading Name]]",
      info: "Link to heading in current page",
      boost: 5,
    },
    {
      label: "[[|]]",
      displayLabel: "Redirect: Custom Text",
      type: "function",
      apply: "[[Heading Name|Custom link text]]",
      info: "Custom text for redirect link",
      boost: 4,
    },
    {
      label: "[[{}]]",
      displayLabel: "Redirect: Cross-Page",
      type: "function",
      apply: "[[{DOCUMENT}Heading Name]]",
      info: "Link to other document heading",
      boost: 3,
    },
    {
      label: "[[{}|]]",
      displayLabel: "Redirect: Cross-Page + Text",
      type: "function",
      apply: "[[{DOCUMENT}Heading Name|Custom link text]]",
      info: "Cross-page link with custom text",
      boost: 2,
    },

    // Asides, Version, todo completion (lower boost), spoilers

    {
      label: ":: Content ::",
      displayLabel: "Aside: Info block",
      type: "function",
      apply: ":: Content here. ::",
      info: "Complementary information block",
      boost: 1,
    },
    {
      label: ":- Content -:",
      displayLabel: "Aside: Warning block",
      type: "function",
      apply: ":- Content here. -:",
      info: "Necessary warning block",
      boost: 0,
    },
    {
      label: ":! Content !:",
      displayLabel: "Aside: Danger block",
      type: "function",
      apply: ":! Content here. !:",
      info: "Dangerous action block",
      boost: -1,
    },

    {
      label: "{{}}",
      displayLabel: "Version: Content Tag",
      type: "function",
      apply: "{{Version Name}}",
      info: "Version-specific content marker",
      boost: -2,
    },
    {
      label: "{{!}}",
      displayLabel: "TODO: Work in Progress",
      type: "function",
      apply: "{{!}}",
      info: "Mark section as work in progress",
      boost: -3,
    },

    {
      label: "!! Content !!",
      displayLabel: "Spoiler Text",
      type: "function",
      apply: "!! Content here. !!",
      info: "Inline spoiler text segment",
      boost: -4,
    },
  ];

  constructor(isRunningInBrowser: boolean = true, parserObj: Parser, helperObj: Helper) {
    this.parserObj = parserObj;
    this.helperObj = helperObj;
    this.katexRenderer = null;
    this.versionColorMap = new Map();
    this.isRunningInBrowser = isRunningInBrowser;
    this.searchResultsCollection = [];

    if (!isRunningInBrowser) {
      this.setupJSDOM();
    }
  }

  // --- Set up JSDOM environment for Node.js
  //      with this, window and document are accessible on node
  private setupJSDOM(): void {
    type JSDOMType = typeof import("jsdom").JSDOM;
    const { JSDOM }: { JSDOM: JSDOMType } = require("jsdom");
    const domInstance: import("jsdom").JSDOM = new JSDOM(
      "<!DOCTYPE html><html lang=''><body></body></html>",
    );

    if (typeof globalThis !== "undefined") {
      (globalThis as Record<string, unknown>)["window"] = domInstance.window;
      (globalThis as Record<string, unknown>)["document"] = domInstance.window.document;
    }
  }

  // --- Set KaTeX renderer for math rendering
  setKatex(katexRenderer: { renderToString: (input: string) => string }): void {
    this.katexRenderer = katexRenderer;
  }

  // --- Parse markdown content and process directives (used by edit)
  async parseText(
    markdowntext: string,
    currentDocumentName?: string,
    currentSectionName?: string,
    isTechDocument: boolean = true,
  ): Promise<string> {
    const parsedHtmlContent: string = await this.parserObj.parseText(markdowntext);
    return this.processHtmlContent(
      parsedHtmlContent,
      currentDocumentName,
      currentSectionName,
      isTechDocument,
    );
  }

  // --- Parse markdown content and process directives
  async parse(
    markdownFilePath: string,
    currentDocumentName?: string,
    currentSectionName?: string,
    isTechDocument: boolean = true,
  ): Promise<string> {
    const parsedHtmlContent: string = await this.parserObj.parseGFM(markdownFilePath);
    return this.processHtmlContent(
      parsedHtmlContent,
      currentDocumentName,
      currentSectionName,
      isTechDocument,
    );
  }

  // --- Common processing logic for HTML content
  private async processHtmlContent(
    parsedHtmlContent: string,
    currentDocumentName?: string,
    currentSectionName?: string,
    isTechDocument: boolean = true,
  ): Promise<string> {
    this.versionColorMap.clear();

    let documentContext: Document;

    // Create a pseudo page to apply DOM operations on
    if (this.isRunningInBrowser) {
      const domParser: DOMParser = new DOMParser();
      documentContext = domParser.parseFromString(
        "<!DOCTYPE html><html lang=''><head></head><body></body></html>",
        "text/html",
      );
    } else {
      documentContext = document;
    }

    const contentContainer: HTMLDivElement = documentContext.createElement("div");
    contentContainer.innerHTML = parsedHtmlContent;
    contentContainer.id = "content";

    const processingElement: HTMLElement = contentContainer;

    // Custom directives are only basic elements that have a class on them.
    //  This functions transforms them into new HTML blocks.
    //  Functionality is only set on the BROWSER. The compiler only controls HTML transformations.

    await this.processCustomDirectives(
      processingElement,
      documentContext,
      currentDocumentName,
      currentSectionName,
    );

    // Tech pages separate each 2nd heading into a new page/article
    if (isTechDocument) {
      await this.generateHeadingStructure(
        processingElement,
        documentContext,
        currentDocumentName,
        currentSectionName,
      );
    }

    return processingElement.innerHTML;
  }

  // --- Process custom markdown directives
  private async processCustomDirectives(
    processingElement: HTMLElement,
    documentContext: Document,
    currentDocumentName?: string,
    currentSectionName?: string,
  ): Promise<void> {
    const taggedElements: NodeListOf<HTMLElement> = processingElement.querySelectorAll<HTMLElement>(
      this.taggedElementsSelector,
    );

    for (const taggedElement of taggedElements) {
      if (taggedElement.classList.contains("tagging-computed")) {
        continue;
      }
      taggedElement.classList.add("tagging-computed");

      const tagDataString: string = taggedElement.dataset.tags ?? "{}";
      const parsedTagData: TagData = JSON.parse(tagDataString.replace(/'/g, '"'));

      // See TagData for current custom directions operation.
      //  Adding a new one requires:
      //  - updating TagData
      //  - transforming HTML here, if necessary
      //  - defining the behavior for the new tag in browser/directives.ts

      if (parsedTagData.sections) {
        this.createSectionsNavigation(
          taggedElement,
          documentContext,
          parsedTagData,
          currentDocumentName,
          currentSectionName,
        );
      }

      if (parsedTagData.versions) {
        this.createVersionIcon(taggedElement, documentContext, parsedTagData.versions);
      }

      if (parsedTagData.todo) {
        this.createTodoIcon(taggedElement, documentContext);
      }

      if (parsedTagData.media) {
        this.createMediaElement(taggedElement, documentContext, parsedTagData);
      }

      if (parsedTagData.redirect) {
        this.createRedirectElement(
          taggedElement,
          documentContext,
          parsedTagData,
          currentDocumentName,
          currentSectionName,
        );
      }

      if (parsedTagData.reference) {
        this.createReferenceRedirect(taggedElement, currentDocumentName, currentSectionName);
      }

      if (parsedTagData.aside) {
        this.createAsideElement(taggedElement, documentContext, parsedTagData);
      }
    }

    const katexElements: NodeListOf<HTMLElement> = processingElement.querySelectorAll<HTMLElement>(
      this.katexElementsSelector,
    );

    for (const katexElement of katexElements) {
      if (katexElement.classList.contains("tagging-computed")) continue;
      katexElement.classList.add("tagging-computed");

      if (this.katexRenderer) {
        katexElement.innerHTML = this.katexRenderer.renderToString(katexElement.innerHTML);
      }
    }
  }

  // --- Create sections navigation interface
  private createSectionsNavigation(
    targetElement: HTMLElement,
    documentContext: Document,
    tagData: TagData,
    currentDocumentName?: string,
    currentSectionName?: string,
  ): void {
    // Get the content div (grandparent)
    const contentDivElement: HTMLElement | null | undefined =
      targetElement.parentElement?.parentElement;
    if (!contentDivElement || contentDivElement.id !== "content") return;

    // Find the h1 element (first child)
    const h1Element: ChildNode | null = contentDivElement.firstChild;
    if (!h1Element) return;

    const articleOptionsConfig: {
      key: string;
      label: string;
      icon: string;
      suffix: string;
    }[] = [
      { key: "systems", label: "Systems", icon: "settings", suffix: "" },
      { key: "characters", label: "Characters", icon: "group", suffix: "-C" },
      { key: "bosses", label: "Bosses", icon: "swords", suffix: "-B" },
    ] as const;

    // Determine active option based on tagData.article or default to first
    let activeOptionIndex: number = 0;
    if (tagData.article === "c") activeOptionIndex = 1;
    else if (tagData.article === "b") activeOptionIndex = 2;

    const activeArticleOption: {
      key: string;
      label: string;
      icon: string;
      suffix: string;
    } = articleOptionsConfig[activeOptionIndex];
    const baseDocumentName: string = (currentDocumentName ?? "").replace(
      this.gameDocumentRegex,
      "",
    );

    // Create the dropdown container
    const dropdownContainerElement: HTMLDivElement = documentContext.createElement("div");
    dropdownContainerElement.className = "content__article-selector";
    dropdownContainerElement.dataset.active = activeArticleOption.key;

    const dropdownButtonElement: HTMLButtonElement = documentContext.createElement("button");
    dropdownButtonElement.className = "content__article-selector--button";
    dropdownButtonElement.type = "button";

    const buttonIconElement: HTMLSpanElement = documentContext.createElement("span");
    buttonIconElement.className = "material-symbols-rounded";
    buttonIconElement.textContent = activeArticleOption.icon;

    const buttonLabelElement: HTMLSpanElement = documentContext.createElement("span");
    buttonLabelElement.className = "content__article-selector--label";
    buttonLabelElement.textContent = activeArticleOption.label;

    const buttonChevronElement: HTMLSpanElement = documentContext.createElement("span");
    buttonChevronElement.className = "material-symbols-rounded content__article-selector--chevron";
    buttonChevronElement.textContent = "arrow_drop_down";

    dropdownButtonElement.appendChild(buttonIconElement);
    dropdownButtonElement.appendChild(buttonLabelElement);
    dropdownButtonElement.appendChild(buttonChevronElement);

    const dropdownMenuElement: HTMLDivElement = documentContext.createElement("div");
    dropdownMenuElement.className = "content__article-selector--menu";

    // Create menu items for each article option
    for (const [optionIndex, articleOption] of articleOptionsConfig.entries()) {
      const menuItemElement: HTMLDivElement = documentContext.createElement("div");
      menuItemElement.className = "content__article-selector--item";

      if (optionIndex === activeOptionIndex) {
        menuItemElement.classList.add("active");
      }

      // Set data attributes for functionality
      Object.assign(menuItemElement.dataset, {
        option: articleOption.key,
        document: baseDocumentName + articleOption.suffix,
        section: currentSectionName ?? "",
      });

      const itemIconElement: HTMLSpanElement = documentContext.createElement("span");
      itemIconElement.className = "material-symbols-rounded";
      itemIconElement.textContent = articleOption.icon;

      const itemLabelElement: HTMLSpanElement = documentContext.createElement("span");
      itemLabelElement.textContent = articleOption.label;

      menuItemElement.appendChild(itemIconElement);
      menuItemElement.appendChild(itemLabelElement);
      dropdownMenuElement.appendChild(menuItemElement);
    }

    // Add separator
    const separatorElement: HTMLDivElement = documentContext.createElement("div");
    separatorElement.className = "content__article-selector--separator";
    dropdownMenuElement.appendChild(separatorElement);

    // Add Edit option
    const editItemElement: HTMLDivElement = documentContext.createElement("div");
    editItemElement.className = "content__article-selector--item content__article-selector--edit";

    Object.assign(editItemElement.dataset, {
      option: "edit",
      document: baseDocumentName,
      section: currentSectionName ?? "",
    });

    const editIconElement: HTMLSpanElement = documentContext.createElement("span");
    editIconElement.className = "material-symbols-rounded";
    editIconElement.textContent = "edit_document";

    const editLabelElement: HTMLSpanElement = documentContext.createElement("span");
    editLabelElement.textContent = "Edit";

    editItemElement.appendChild(editIconElement);
    editItemElement.appendChild(editLabelElement);
    dropdownMenuElement.appendChild(editItemElement);

    dropdownContainerElement.appendChild(dropdownButtonElement);
    dropdownContainerElement.appendChild(dropdownMenuElement);

    // Insert after the h1 element
    h1Element.parentNode?.insertBefore(dropdownContainerElement, h1Element.nextSibling);
  }

  // --- Create version indicator icon
  private createVersionIcon(
    targetElement: HTMLElement,
    documentContext: Document,
    versionString: string,
  ): void {
    if (!this.versionColorMap.has(versionString)) {
      this.versionColorMap.set(
        versionString,
        this.availableColors[this.versionColorMap.size % this.availableColors.length],
      );
    }

    const versionIconElement: HTMLSpanElement = documentContext.createElement("span");
    versionIconElement.className = "material-symbols-rounded";
    versionIconElement.textContent = "devices";

    Object.assign(versionIconElement.style, {
      marginRight: "15px",
      cursor: "help",
      filter: "brightness(1.5)",
    });

    const assignedColorName: string | undefined = this.versionColorMap.get(versionString);
    if (assignedColorName) {
      const hexColorValue: string = colorCollection[assignedColorName as colors];
      versionIconElement.style.color = hexColorValue ?? `var(--${assignedColorName})`;
    }

    Object.assign(versionIconElement.dataset, {
      tteVersionTrigger: "",
      tteTooltipText: `Version: ${versionString}.`,
    });

    targetElement.appendChild(versionIconElement);
  }

  // --- Create TODO indicator icon
  private createTodoIcon(targetElement: HTMLElement, documentContext: Document): void {
    const todoIconElement: HTMLSpanElement = documentContext.createElement("span");
    todoIconElement.className = "material-symbols-rounded";
    todoIconElement.textContent = "error";

    Object.assign(todoIconElement.style, {
      color: "goldenrod",
      marginRight: "15px",
      cursor: "help",
    });

    Object.assign(todoIconElement.dataset, {
      tteTodoTrigger: "",
      tteTooltipText: "This section needs work, is not confirmed or needs testing.",
    });

    targetElement.appendChild(todoIconElement);
  }

  // --- Create media element (image or video)
  private createMediaElement(
    targetElement: HTMLElement,
    documentContext: Document,
    tagData: TagData,
  ): void {
    if (!tagData.media) return;

    const isImageFile: boolean = this.imageFileRegex.test(tagData.media);
    const mediaElementType: "img" | "video" = isImageFile ? "img" : "video";

    if (tagData.float || tagData.forcedmedia !== false) {
      // Block media
      const mediaContainer: HTMLElement = this.helperObj.createMediaElement(
        documentContext,
        mediaElementType,
        tagData.media,
        640,
        480,
        tagData.caption,
        tagData.float,
      );
      targetElement.parentNode?.insertBefore(mediaContainer, targetElement.nextSibling);
    } else {
      // Hidden media
      const mediaIconElement: HTMLSpanElement = documentContext.createElement("span");
      mediaIconElement.className = "material-symbols-rounded";
      mediaIconElement.textContent = mediaElementType === "img" ? "imagesmode" : "play_circle";

      Object.assign(mediaIconElement.dataset, {
        tteMediaIcon: "",
        mediaSrc: tagData.media,
        mediaType: mediaElementType,
        ...(tagData.caption && { mediaCaption: tagData.caption }),
      });

      Object.assign(mediaIconElement.style, {
        marginRight: "15px",
        cursor: "pointer",
      });

      targetElement.appendChild(mediaIconElement);
    }
  }

  // --- Create redirect element with link icon
  private createRedirectElement(
    targetElement: HTMLElement,
    documentContext: Document,
    tagData: TagData,
    currentDocumentName?: string,
    currentSectionName?: string,
  ): void {
    const redirectIconElement: HTMLSpanElement = documentContext.createElement("span");
    redirectIconElement.className = "material-symbols-rounded";
    redirectIconElement.style.marginRight = "5px";
    redirectIconElement.textContent = "link";

    targetElement.classList.remove("tagging", "tagging-text");
    targetElement.classList.add("content__redirect");
    targetElement.dataset.redirect = tagData.redirect!;

    if (tagData.document) {
      targetElement.dataset.document = tagData.document;
      const matchingFileEntry: FileEntry | undefined = this.helperObj.fileList?.find(
        (fileEntry: { document: string; section: string }) =>
          fileEntry.document === tagData.document,
      );
      targetElement.dataset.section = matchingFileEntry?.section ?? "";
    } else {
      if (currentDocumentName) {
        targetElement.dataset.document = currentDocumentName;
      }
      if (currentSectionName) {
        targetElement.dataset.section = currentSectionName;
      }
    }

    targetElement.insertBefore(redirectIconElement, targetElement.firstChild);
  }

  // --- Create reference redirect
  private createReferenceRedirect(
    targetElement: HTMLElement,
    currentDocumentName?: string,
    currentSectionName?: string,
  ): void {
    targetElement.classList.remove("tagging", "tagging-text");
    targetElement.classList.add("content__redirect");
    targetElement.dataset.redirect = "#references";

    if (currentDocumentName) {
      targetElement.dataset.document = currentDocumentName;
    }
    if (currentSectionName) {
      targetElement.dataset.section = currentSectionName;
    }
  }

  // --- Create aside element
  private createAsideElement(
    taggedElement: HTMLElement,
    documentContext: Document,
    parsedTagData: TagData,
  ): void {
    const asideType: "note" | "caution" | "error" | undefined = parsedTagData.aside;
    if (!asideType) return;

    const blockContainer: HTMLElement | null = taggedElement.parentElement;
    if (!blockContainer) return;

    const content: string = taggedElement.innerHTML.trim();

    const asideContainer: HTMLDivElement = documentContext.createElement("div");
    asideContainer.classList.add("content__aside", `content__aside--${asideType}`);

    const asideHeading: HTMLDivElement = documentContext.createElement("div");
    asideHeading.classList.add("content__aside-heading");

    const icon: HTMLSpanElement = documentContext.createElement("span");
    icon.classList.add("material-symbols-rounded");

    const title: HTMLSpanElement = documentContext.createElement("span");
    title.classList.add("content__aside-title");

    switch (asideType) {
      case "note":
        icon.textContent = "error";
        title.textContent = "Note";
        break;
      case "caution":
        icon.textContent = "emergency_home";
        title.textContent = "Important";
        break;
      case "error":
        icon.textContent = "report";
        title.textContent = "Danger";
        break;
    }

    asideHeading.appendChild(icon);
    asideHeading.appendChild(title);

    const asideContent: HTMLDivElement = documentContext.createElement("div");
    asideContent.classList.add("content__aside-content");
    asideContent.innerHTML = content;

    asideContainer.appendChild(asideHeading);
    asideContainer.appendChild(asideContent);

    blockContainer.parentNode?.replaceChild(asideContainer, blockContainer);
  }

  // --- Generate structured heading layout and search results
  //      this also generates search results if on node
  private async generateHeadingStructure(
    processingElement: HTMLElement,
    documentContext: Document,
    currentDocumentName?: string,
    currentSectionName?: string,
  ): Promise<void> {
    const headingDataCollection: h2Data[] = [];
    this.headingColorsIndex = 0;

    // Other game articles (bosses, characters) will not be indexed on search and have to be accessed throught the sections menu
    const isBaseGameDocument: boolean = currentDocumentName
      ? !this.gameDocumentRegex.test(currentDocumentName)
      : false;

    if (currentDocumentName && currentSectionName && isBaseGameDocument) {
      const gameSearchResult: SearchResultItem = {
        html: `
                  <a href="/${currentDocumentName}" 
                     title="${currentSectionName}" 
                     data-document="${currentDocumentName}" 
                     class="nav-bar__search--results button__redirect" 
                     tabindex="0" 
                     data-section="${currentSectionName}" 
                     data-tag="game">
                    <span class="nav-bar__search--results--games material-symbols-rounded">sports_esports</span>
                    <b>${currentSectionName}</b>
                  </a>
                `,
        type: "game",
        primarySortKey: currentSectionName,
      };

      // Parse runs multiple times, so this is an ordered list of game elements
      const gameResults: string[] = this.searchResultsCollection
        .filter((item: SearchResultItem) => item.type === "game")
        .map(
          (item: SearchResultItem) =>
            `${item.primarySortKey}|${item.html.match(/data-document="([^"]*)"/)?.at(1) ?? ""}`,
        );

      const existingGameResultsSet: Set<string> = new Set(gameResults);
      const gameResultKey: string = `${currentSectionName}|${currentDocumentName}`;

      if (!existingGameResultsSet.has(gameResultKey)) {
        this.searchResultsCollection.push(gameSearchResult);
      }
    }

    // Get h2 elements, which will be grouped individually.
    //  each one has a id, name, color, and content
    //  content has all the HTML for the page. The initical HTML will not have any content loaded and will need to get it from this data
    const h2Elements: NodeListOf<HTMLHeadingElement> = processingElement.querySelectorAll("h2");
    const headingsArray: h2Data[] = Array.from(h2Elements, (h2Element: HTMLHeadingElement) => {
      const colorName: colors =
        this.availableColors[this.headingColorsIndex % this.availableColors.length];
      this.headingColorsIndex++;
      return {
        id: h2Element.id,
        name: h2Element.textContent ?? "",
        color: colorName,
        content: "",
      };
    });

    headingDataCollection.push(...headingsArray);

    // An offscreen DOM tree. Has better performance than using normal DOM operations
    const leadingContentFragment: DocumentFragment = documentContext.createDocumentFragment();
    const structuredContentFragment: DocumentFragment = documentContext.createDocumentFragment();

    let currentH2Container: HTMLDivElement | null = null;
    let currentH2ContentContainer: HTMLDivElement | null = null;
    let currentH3ContentContainer: HTMLDivElement | null = null;
    let currentH4ContentContainer: HTMLDivElement | null = null;

    let hasEncounteredFirstH2: boolean = false;
    const allChildNodes: Node[] = Array.from(processingElement.childNodes);
    let currentH2IdForSearch: string | null = null;

    // Types of nodes are set as numbers. ELEMENT_NODE are nodes like <p> or <div> and have a type of 1
    //  this is just being safe if it changes in the (very far) future
    let ELEMENT_NODE: number;
    if (this.isRunningInBrowser) {
      // Get from window instead of defaultView
      ELEMENT_NODE = window.Node.ELEMENT_NODE;
    } else {
      ELEMENT_NODE = documentContext.defaultView!.Node.ELEMENT_NODE;
    }

    for (const childNode of allChildNodes) {
      if (childNode.nodeType === ELEMENT_NODE) {
        const elementNode: HTMLElement = childNode as HTMLElement;
        const nodeToClone: HTMLElement = elementNode;

        let effectiveHeadingType: "H1" | "H2" | "H3" | "H4" | null = null;
        let headingElementForAttributes: HTMLHeadingElement | HTMLElement | null = null;

        switch (elementNode.tagName) {
          case "H1":
            effectiveHeadingType = "H1";
            headingElementForAttributes = elementNode;
            break;
          case "H2":
            effectiveHeadingType = "H2";
            headingElementForAttributes = elementNode;
            break;
          case "H3":
            effectiveHeadingType = "H3";
            headingElementForAttributes = elementNode;
            break;
          case "H4":
            effectiveHeadingType = "H4";
            headingElementForAttributes = elementNode;
            break;
          default:
            // Check the child.
            if (elementNode.firstElementChild?.nodeType === ELEMENT_NODE) {
              const firstChildElement: HTMLElement = elementNode.firstElementChild as HTMLElement;
              switch (firstChildElement.tagName) {
                case "H3":
                  effectiveHeadingType = "H3";
                  headingElementForAttributes = firstChildElement;
                  break;
                case "H4":
                  effectiveHeadingType = "H4";
                  headingElementForAttributes = firstChildElement;
                  break;
              }
            }
        }

        if (effectiveHeadingType === "H1" && headingElementForAttributes) {
          currentH2IdForSearch = null;
        } else if (effectiveHeadingType === "H2" && headingElementForAttributes) {
          currentH2IdForSearch = headingElementForAttributes.id;
        } else if (
          headingElementForAttributes &&
          (effectiveHeadingType === "H3" || effectiveHeadingType === "H4")
        ) {
          // Add search entry if in gliches or techniques (ignore if "general-techniques")
          // TODO this can be a list of ignored ids in the future
          if (
            currentDocumentName &&
            currentSectionName &&
            (currentH2IdForSearch === "glitches" || currentH2IdForSearch === "techniques") &&
            headingElementForAttributes.id !== "general-techniques"
          ) {
            const gameLabel: string = currentSectionName.replace("Tales of", "").trim();
            const techSearchResult: SearchResultItem = {
              html: `
                              <a href="/${currentDocumentName}" 
                                 title="${currentSectionName}" 
                                 data-document="${currentDocumentName}" 
                                 class="nav-bar__search--results button__redirect" 
                                 tabindex="0" 
                                 data-section="${currentSectionName}" 
                                 data-tag="tech" 
                                 data-redirect="#${headingElementForAttributes.id}">
                                <span class="nav-bar__search--results--games material-symbols-rounded">book_2</span>
                                <b>${gameLabel}</b>
                                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${headingElementForAttributes.textContent ?? ""}
                              </a>
                            `,
              type: "tech",
              primarySortKey: gameLabel,
              secondarySortKey: headingElementForAttributes.textContent ?? "",
            };

            const isDuplicateTechResult: boolean =
              this.searchResultsCollection.find(
                (existingItem: SearchResultItem) => existingItem.html === techSearchResult.html,
              ) !== undefined;

            if (!isDuplicateTechResult) {
              this.searchResultsCollection.push(techSearchResult);
            }
          }
        }

        // Create individual divs for entries inside h2s, h3s, and h4s.
        if (effectiveHeadingType === "H2" && headingElementForAttributes) {
          hasEncounteredFirstH2 = true;
          if (currentH2Container) {
            this.removeLastH3Divider(currentH2Container);
            structuredContentFragment.appendChild(currentH2Container);
          }

          currentH2Container = documentContext.createElement("div");
          currentH2Container.className = "content__h2";
          currentH2Container.id = headingElementForAttributes.id;

          const h2TitleElement: HTMLHeadingElement = documentContext.createElement("h2");
          Array.from(headingElementForAttributes.attributes).forEach((attribute: Attr) => {
            h2TitleElement.setAttribute(attribute.name, attribute.value);
          });
          h2TitleElement.innerHTML = headingElementForAttributes.innerHTML;
          currentH2Container.appendChild(h2TitleElement);

          currentH2ContentContainer = documentContext.createElement("div");
          currentH2ContentContainer.className = `content-for-${headingElementForAttributes.id}`;
          currentH2Container.appendChild(currentH2ContentContainer);

          currentH3ContentContainer = null;
          currentH4ContentContainer = null;
        } else if (effectiveHeadingType === "H3" && headingElementForAttributes) {
          if (!currentH2ContentContainer) {
            if (!hasEncounteredFirstH2)
              leadingContentFragment.appendChild(nodeToClone.cloneNode(true));
            continue;
          }
          hasEncounteredFirstH2 = true;

          const h3WrapperElement: HTMLDivElement = documentContext.createElement("div");
          h3WrapperElement.className = "content__h3";

          const collapseButton: HTMLButtonElement = documentContext.createElement("button");
          collapseButton.className = "content__collapse";
          collapseButton.dataset.open = `${headingElementForAttributes.id} ${currentH2Container?.id ?? ""}`;
          collapseButton.innerHTML =
            '<span class="material-symbols-rounded">expand_circle_up</span>';
          h3WrapperElement.appendChild(collapseButton);

          h3WrapperElement.appendChild(nodeToClone.cloneNode(true));

          const h3ContentElement: HTMLDivElement = documentContext.createElement("div");
          h3ContentElement.className = headingElementForAttributes.id;
          h3WrapperElement.appendChild(h3ContentElement);

          const h3DividerElement: HTMLHRElement = documentContext.createElement("hr");
          h3DividerElement.className = "content__h3--divider";
          h3DividerElement.setAttribute("draggable", "false");
          h3WrapperElement.appendChild(h3DividerElement);

          currentH2ContentContainer.appendChild(h3WrapperElement);
          currentH3ContentContainer = h3ContentElement;
          currentH4ContentContainer = null;
        } else if (effectiveHeadingType === "H4" && headingElementForAttributes) {
          if (!currentH3ContentContainer && !currentH2ContentContainer) {
            if (!hasEncounteredFirstH2)
              leadingContentFragment.appendChild(nodeToClone.cloneNode(true));
            continue;
          }
          hasEncounteredFirstH2 = true;

          const h4WrapperElement: HTMLDivElement = documentContext.createElement("div");
          h4WrapperElement.className = "content__h4";

          const clonedElement: HTMLElement = nodeToClone.cloneNode(true) as HTMLElement;

          let h4ElementInCloned: HTMLHeadingElement | null = null;
          if (clonedElement.tagName === "H4") {
            h4ElementInCloned = clonedElement as HTMLHeadingElement;
          } else if (clonedElement.firstElementChild?.tagName === "H4") {
            h4ElementInCloned = clonedElement.firstElementChild as HTMLHeadingElement;
          }

          if (h4ElementInCloned) {
            h4ElementInCloned.dataset.open =
              `${headingElementForAttributes.id} ${currentH3ContentContainer?.className ?? ""} ${currentH2Container?.id ?? ""}`.trim();
          }
          h4WrapperElement.appendChild(clonedElement);

          const h4ContentElement: HTMLDivElement = documentContext.createElement("div");
          h4ContentElement.className = headingElementForAttributes.id;
          h4WrapperElement.appendChild(h4ContentElement);

          const h4ParentContainer: HTMLDivElement | null =
            currentH3ContentContainer ?? currentH2ContentContainer;
          h4ParentContainer?.appendChild(h4WrapperElement);
          currentH4ContentContainer = h4ContentElement;
        } else {
          if (!hasEncounteredFirstH2) {
            leadingContentFragment.appendChild(nodeToClone.cloneNode(true));
          } else {
            const targetContentContainer: HTMLDivElement | null =
              currentH4ContentContainer ?? currentH3ContentContainer ?? currentH2ContentContainer;
            targetContentContainer?.appendChild(nodeToClone.cloneNode(true));
          }
        }
      } else {
        if (!hasEncounteredFirstH2) {
          leadingContentFragment.appendChild(childNode.cloneNode(true));
        } else {
          const targetContentContainer: HTMLDivElement | null =
            currentH4ContentContainer ?? currentH3ContentContainer ?? currentH2ContentContainer;
          targetContentContainer?.appendChild(childNode.cloneNode(true));
        }
      }
    }

    // When ending an H2, remove the last H3 divider if it exists
    if (currentH2Container) {
      this.removeLastH3Divider(currentH2Container);
      structuredContentFragment.appendChild(currentH2Container);
    }

    // Update content of headingDataCollection
    for (const h2Entry of headingDataCollection) {
      const h2SectionWrapper: HTMLDivElement | null = structuredContentFragment.querySelector(
        `.content__h2#${h2Entry.id}`,
      );
      if (h2SectionWrapper) {
        const contentElement: HTMLDivElement | null = h2SectionWrapper.querySelector(
          `.content-for-${h2Entry.id}`,
        );
        if (contentElement) {
          h2Entry.content = contentElement.innerHTML;
        }
      }
    }

    processingElement.innerHTML = "";
    processingElement.appendChild(leadingContentFragment);

    // Add the data of all h2s to the first h1 in the page.
    //  this will be loaded by main before displaying the page and then removed
    const mainHeading: HTMLHeadingElement | null = processingElement.querySelector("h1");
    if (mainHeading && headingDataCollection.length > 0) {
      mainHeading.dataset.h2Collection = JSON.stringify(headingDataCollection);
    }

    // Create the h2 selector element and add chevrons when it has too much content
    if (headingDataCollection.length > 0) {
      const selectorContainer: HTMLDivElement = documentContext.createElement("div");
      selectorContainer.id = "content__selector";

      const selectorBox: HTMLDivElement = documentContext.createElement("div");
      selectorBox.id = "content__selectorbox";

      for (const h2Data of headingDataCollection) {
        const colorHexValue: string = colorCollection[h2Data.color as colors];
        const selectorItem: HTMLDivElement = documentContext.createElement("div");
        selectorItem.className = "content__selectorbox--item";
        selectorItem.dataset.open = h2Data.id;
        selectorItem.dataset.highlight = colorHexValue;
        selectorItem.style.setProperty("--highlight-color", colorHexValue);
        selectorItem.textContent = h2Data.name;
        selectorBox.appendChild(selectorItem);
      }
      selectorContainer.appendChild(selectorBox);

      const selectorDivider: HTMLHRElement = documentContext.createElement("hr");
      selectorDivider.id = "content__selectorhr";
      selectorContainer.appendChild(selectorDivider);

      const mobileChevronsContainer: HTMLDivElement = documentContext.createElement("div");
      mobileChevronsContainer.id = "content__mobilechevrons";
      mobileChevronsContainer.innerHTML = `
                <span class="content__mobilechevrons--left material-symbols-rounded">chevron_backward</span>
                <span class="content__mobilechevrons--right material-symbols-rounded">chevron_forward</span>`;
      selectorContainer.appendChild(mobileChevronsContainer);

      processingElement.appendChild(selectorContainer);

      const currentH2Display: HTMLDivElement = documentContext.createElement("div");
      currentH2Display.id = "content__currenth2";
      processingElement.appendChild(currentH2Display);
    }
  }

  // --- Remove the last H3 divider from container
  private removeLastH3Divider(h2Container: HTMLDivElement): void {
    const allH3Dividers: NodeListOf<HTMLHRElement> =
      h2Container.querySelectorAll(".content__h3--divider");
    const lastDivider: HTMLHRElement | undefined = Array.from(allH3Dividers).findLast(() => true);
    lastDivider?.remove();
  }

  // --- Export search results to file for caching
  //      only use by node cache script
  async exportSearchResultsToFile(): Promise<string> {
    if (this.isRunningInBrowser) {
      console.warn("Exporting search results to file is not supported in the browser environment.");
      return "";
    }

    const sortedHtmlContent: string = this.getSortedSearchResultsHTML();
    const escapePatterns: readonly [RegExp, string][] = [
      [/\\/g, "\\\\"],
      [/`/g, "\\`"],
      [/\$\{/g, "\\${"],
    ] as const;

    const escapedHtmlContent: string = escapePatterns.reduce(
      (content: string, [pattern, replacement]: [RegExp, string]) =>
        content.replace(pattern, replacement),
      sortedHtmlContent,
    );

    const compressedStream: string = await this.helperObj.compress(escapedHtmlContent);

    return (
      `// This file is auto-generated by the Compiler. Do not edit directly.\n` +
      `export const cachedSearchResultsHTML: string = \`${compressedStream}\`;\n`
    );
  }

  // --- Get sorted search results as HTML string
  getSortedSearchResultsHTML(): string {
    const uniqueSearchResults: SearchResultItem[] = [];
    const seenHtmlSet: Set<string> = new Set();

    for (const searchItem of this.searchResultsCollection) {
      if (!seenHtmlSet.has(searchItem.html)) {
        uniqueSearchResults.push(searchItem);
        seenHtmlSet.add(searchItem.html);
      }
    }

    // Show all (ordered) games first, then all (ordered) tech entries
    const [gameTypeResults, techTypeResults]: [SearchResultItem[], SearchResultItem[]] =
      uniqueSearchResults.reduce<[SearchResultItem[], SearchResultItem[]]>(
        ([games, techs]: [SearchResultItem[], SearchResultItem[]], item: SearchResultItem) => {
          if (item.type === "game") {
            games.push(item);
          } else {
            techs.push(item);
          }
          return [games, techs];
        },
        [[], []],
      );

    const sortedGameResults: SearchResultItem[] = gameTypeResults.toSorted(
      (itemA: SearchResultItem, itemB: SearchResultItem) =>
        itemA.primarySortKey.localeCompare(itemB.primarySortKey),
    );

    const sortedTechResults: SearchResultItem[] = techTypeResults.toSorted(
      (itemA: SearchResultItem, itemB: SearchResultItem) => {
        const primaryKeyComparison: number = itemA.primarySortKey.localeCompare(
          itemB.primarySortKey,
        );
        return primaryKeyComparison !== 0
          ? primaryKeyComparison
          : (itemA.secondarySortKey ?? "").localeCompare(itemB.secondarySortKey ?? "");
      },
    );

    // A full search has a divisor line, game elements, then tech results
    //  These are disabled depending on what is filtered to appear.
    const dividerElement: string = `<hr id="nav-bar__search--hr" tabindex="0" style="display: none;">`;
    const gameResultsHtml: string = sortedGameResults
      .map((item: SearchResultItem) => item.html)
      .join("");
    const techResultsHtml: string = sortedTechResults
      .map((item: SearchResultItem) => item.html)
      .join("");

    return dividerElement + gameResultsHtml + techResultsHtml;
  }

  // --- Clear search results collection
  clearSearchResults(): void {
    this.searchResultsCollection.length = 0;
  }

  private createCustomTheme() {
    // Seems to be any? I guess since it's pretty much CSS code within JS
    const customTheme: ReturnType<typeof EditorView.theme> = EditorView.theme(
      {
        "&": {
          fontSize: "0.75rem",
          lineHeight: "1.4",
          fontFamily: '"Mulish", sans-serif',
          color: "var(--white-text)",
          backgroundColor: "var(--gray-bg)",
          height: "100%",
          width: "100%",
        },
        ".cm-content": {
          padding: "16px",
          minHeight: "100%",
          caretColor: "var(--white-f1)",
          fontFamily: '"Mulish", sans-serif',
        },
        ".cm-focused": {
          outline: "none",
        },
        ".cm-editor": {
          border: "2px solid var(--gray-bg)",
          borderRadius: "6px",
          backgroundColor: "var(--gray-bg)",
          height: "600px",
        },
        ".cm-scroller": {
          overflow: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--gray-f2) var(--gray-bg)",
        },
        ".cm-activeLine": {
          backgroundColor: "var(--gray-a5)",
        },
        ".cm-selectionLayer": {
          backgroundColor: "#074",
        },
        ".cm-focused .cm-cursor": {
          borderLeftColor: "var(--white-f1)",
          borderLeftWidth: "2px",
        },
        ".cm-focused .cm-selectionBackground": {
          backgroundColor: "var(--pink)",
        },
        ".cm-selectionBackground": {
          backgroundColor: "var(--pink)",
        },
        "::selection": {
          backgroundColor: "var(--pink)",
        },
        "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
          {
            backgroundColor: "var(--white-f3)",
          },
        ".cm-gutters": {
          backgroundColor: "var(--gray-f1)",
          color: "var(--white-f2)",
          border: "none",
          borderRight: "1px solid var(--gray-ac)",
        },
        ".cm-gutterElement": {
          padding: "0 6px",
          fontSize: "0.7rem",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "var(--gray-f2)",
          color: "var(--white-f1)",
        },
        ".cm-line": {
          padding: "0 2px",
        },
        ".cm-matchingBracket": {
          backgroundColor: "var(--gray-f2)",
          outline: "1px solid var(--white-f3)",
        },
        ".cm-nonmatchingBracket": {
          backgroundColor: "var(--red)",
          color: "var(--white-text)",
        },
        ".cm-searchMatch": {
          backgroundColor: "var(--yellow)",
          color: "var(--gray-f1)",
        },
        ".cm-searchMatch.cm-searchMatch-selected": {
          backgroundColor: "var(--pink)",
          color: "var(--white-text)",
        },
        ".cm-tooltip-autocomplete": {
          backgroundColor: "var(--gray-f1)",
          border: "1px solid var(--gray-ac)",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontFamily: '"Mulish", sans-serif',
          scrollbarWidth: "thin",
          scrollbarColor: "var(--gray-f2) var(--gray-f3)",
        },
        ".cm-tooltip-autocomplete > ul": {
          backgroundColor: "var(--gray-f1)",
          color: "var(--white-text)",
          maxHeight: "200px",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--gray-f2) var(--gray-f3)",
        },
        ".cm-tooltip-autocomplete > ul > li": {
          padding: "4px 8px",
          borderBottom: "1px solid var(--gray-ac)",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
          backgroundColor: "var(--gray-f2)",
          color: "var(--white-f1)",
        },
        ".cm-completionLabel": {
          color: "var(--white-text)",
        },
        ".cm-completionDetail": {
          color: "var(--white-f2)",
          fontSize: "0.7rem",
        },
        ".cm-completionInfo": {
          backgroundColor: "var(--gray-f2)",
          border: "1px solid var(--gray-ac)",
          borderRadius: "4px",
          color: "var(--white-f2)",
          fontSize: "0.7rem",
          padding: "4px 8px",
        },
      },
      { dark: true },
    );

    return [customTheme];
  }

  // --- Markdown editor for element
  async initializeEditor(content: string, parent: HTMLElement): Promise<void> {
    // Can have code highlighting within markdown by setting the languages inside markdown()

    this.editor = new EditorView({
      doc: content,
      parent: parent,
      spellcheck: true,

      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        EditorView.contentAttributes.of({ spellcheck: "true" }),
        markdownLanguage.data.of({
          closeBrackets: {
            brackets: ["(", "'", '"'],
          },
        }),
        markdown(),
        autocompletion({ override: [this.markdownDirectiveCompletions] }),
        EditorView.lineWrapping,
        ...this.createCustomTheme(),
      ],
    });
  }

  async getEditorContent(): Promise<string> {
    return this.editor ? this.editor.state.doc.toString() : "";
  }

  async updateEditorContent(content: string): Promise<void> {
    if (this.editor) {
      const transaction: IDBTransaction = this.editor.state.update({
        changes: { from: 0, to: this.editor.state.doc.length, insert: content },
      });
      this.editor.dispatch(transaction);
    }
  }

  // --- Main completion function for markdown directives
  private markdownDirectiveCompletions = (context: CompletionContext): CompletionResult | null => {
    // Check for explicit activation
    if (context.explicit) {
      return {
        from: context.pos,
        options: Array.from(this.directiveCompletions),
        validFor: () => false, // Don't persist explicit completions
      };
    }

    // Check for trigger characters
    const beforeTrigger: { from: number; to: number; text: string } | null =
      context.matchBefore(/[{[:!]/);

    if (!beforeTrigger) return null;

    const triggerChar: string = beforeTrigger.text;
    let filteredCompletions: Completion[] = [];

    if (triggerChar === "{") {
      // Filter for curly brace completions
      filteredCompletions = Array.from(
        this.directiveCompletions.filter((completion: Completion) =>
          completion.label.startsWith("{{"),
        ),
      );
    } else if (triggerChar === "[") {
      // Filter for square bracket completions
      filteredCompletions = Array.from(
        this.directiveCompletions.filter((completion: Completion) =>
          completion.label.startsWith("[["),
        ),
      );
    } else if (triggerChar === "!") {
      // Filter for exclamation mark completions
      filteredCompletions = Array.from(
        this.directiveCompletions.filter((completion: Completion) =>
          completion.label.startsWith("!"),
        ),
      );
    } else if (triggerChar === ":") {
      // Filter for colon completions
      filteredCompletions = Array.from(
        this.directiveCompletions.filter((completion: Completion) =>
          completion.label.startsWith(":"),
        ),
      );
    }

    if (filteredCompletions.length === 0) return null;

    return {
      from: beforeTrigger.from,
      options: filteredCompletions,
      validFor: /^[{[]$/,
    };
  };
}
