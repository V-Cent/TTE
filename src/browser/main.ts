// ---------
// main.js is the entry point for our code.
//   inits all other modules
//   controls page history
//   controls page flow and state
// To add games, change fileList on shared/globals !

import { Search } from "./search";
import { TOC } from "./toc";
import { Headings } from "./headings";
import { Directives } from "./directives";
import { Helper, h2Data, PageRequest, PageType } from "../shared/helper";
import { fileList, FileEntry } from "../shared/globals";

// --- CONSTANTS AND CONFIGURATION

interface PageSelectors {
  readonly CONTENT: string;
  readonly NAV_BAR: string;
  readonly SEARCH_INPUT: string;
  readonly CONTENT_CURRENT_H2: string;
  readonly CONTENT_SELECTOR: string;
  readonly META_DESCRIPTION: string;
  readonly H1: string;
  readonly TOC_SEARCH: string;
  readonly SELECTOR_ITEM: string;
  readonly CONTENT_COLLAPSE: string;
  readonly CONTENT_REDIRECT: string;
  readonly SHOWCASE_PLAY: string;
  readonly SHOWCASE_VIDEO: string;
}

interface PageConfiguration {
  readonly MIN_HEIGHT_STANDARD: string;
  readonly MIN_HEIGHT_TECH: string;
  readonly REDIRECT_DELAY: number;
  readonly VIDEO_FADE_DELAY: number;
  readonly VIDEO_REMOVE_DELAY: number;
}

const SELECTORS: PageSelectors = {
  CONTENT: "#content",
  NAV_BAR: "#nav-bar",
  SEARCH_INPUT: "#nav-bar__search--input",
  CONTENT_CURRENT_H2: "#content__currenth2",
  CONTENT_SELECTOR: "#content__selector",
  META_DESCRIPTION: 'meta[name="description"]',
  H1: "h1",
  TOC_SEARCH: ".content__toc--search",
  SELECTOR_ITEM: ".content__selectorbox--item",
  CONTENT_COLLAPSE: ".content__collapse",
  CONTENT_REDIRECT: "span.content__redirect",
  SHOWCASE_PLAY: ".content__home__showcase-item--play",
  SHOWCASE_VIDEO: ".content__home__showcase-item--video",
} as const;

const PAGE_CONFIG: PageConfiguration = {
  MIN_HEIGHT_STANDARD: "600px",
  MIN_HEIGHT_TECH: "100vh",
  REDIRECT_DELAY: 250,
  VIDEO_FADE_DELAY: 50,
  VIDEO_REMOVE_DELAY: 500,
} as const;

// --- MODULE INITIALIZATION

const moduleObjects: {
  helper: Helper;
  headings: Headings;
  directives: Directives;
  search: Search;
  toc: TOC;
} = {
  helper: new Helper(addPageChangeEvent, fileList),
  headings: {} as Headings,
  directives: {} as Directives,
  search: {} as Search,
  toc: {} as TOC,
};

moduleObjects.headings = new Headings(moduleObjects.helper);
moduleObjects.directives = new Directives(moduleObjects.helper, handlePageChange, editPage);
moduleObjects.search = new Search(addPageChangeEvent, moduleObjects.helper);
moduleObjects.toc = new TOC(moduleObjects.helper);

const appState: {
  parsedDocuments: Map<string, string>;
  currentDocument: string;
  katexLoaded: boolean;
  pageContent: string;
} = {
  parsedDocuments: new Map<string, string>(),
  currentDocument: "",
  katexLoaded: false,
  pageContent: "",
};

// --- ENTRY POINT

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApplication);
} else {
  initializeApplication();
}

// --- Setup history and simple redirects on page load
function initializeApplication(): void {
  setupGlobalEventListeners();
  setupNavigationElements();
  setupHistoryHandling();
  handleInitialRoute();
}

// --- SETUP

// --- Redirects for page shell elements (not for home!!)
function setupGlobalEventListeners(): void {
  const navigationSelectors: readonly string[] = [
    "div#nav-bar__title",
    "p.footer-container__help--links",
    "img#title-text__img",
  ] as const;

  for (const selector of navigationSelectors) {
    const elements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(selector);
    for (const element of elements) {
      addPageChangeEvent(element);
    }
  }
}

// --- Inits behavior of nav-bar elements
function setupNavigationElements(): void {
  moduleObjects.search.initializeSearchIcons();
  moduleObjects.search.initializeOnboardingIcon();
  moduleObjects.helper.scrollInit();
  moduleObjects.helper.logoInit();
}

// --- Handles history when the page starts
function setupHistoryHandling(): void {
  window.addEventListener("popstate", (event: PopStateEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    const pageRequest: PageRequest = event.state
      ? { ...event.state, isPopstate: true }
      : { document: "HOME", section: "HOME", pageType: "home", isPopstate: true };

    handlePageChange(pageRequest);
  });
}

// --- Handles initial route, depends on url/pathname on page load
function handleInitialRoute(): void {
  const pathname: string = document.location.pathname.substring(1);

  // Handle root path
  if (!pathname) {
    const homeRequest: PageRequest = createPageRequest({ document: "HOME", section: "HOME" });
    homeRequest.isPopstate = true;
    handlePageChange(homeRequest);
    return;
  }

  const pathParts: string[] = pathname.split("/");
  const ref: string = pathParts[0] || "";
  const redirect: string = pathParts[1] || "";

  const matchingEntry: FileEntry | undefined = fileList.find(
    (entry: FileEntry) => entry.ref === ref,
  );

  if (matchingEntry) {
    const requestData: { document: string; section: string; redirect?: string } = {
      document: matchingEntry.document,
      section: matchingEntry.section,
      redirect: redirect ? `#${redirect}` : undefined,
    };

    const pageRequest: PageRequest = createPageRequest(requestData);
    pageRequest.isPopstate = true;
    handlePageChange(pageRequest);
    window.history.replaceState(pageRequest, matchingEntry.section, pathname);
  } else {
    // Invalid path, redirect to home
    const homeRequest: PageRequest = createPageRequest({ document: "HOME", section: "HOME" });
    handlePageChange(homeRequest);
  }
}

// --- PAGE CHANGE EVENT SYSTEM

// --- Base event for page change. This is used by other modules.
function addPageChangeEvent(item: HTMLElement): void {
  clearSearchFocus();
  item.removeEventListener("click", handlePageChangeEvent);
  item.addEventListener("click", handlePageChangeEvent);
}

// --- Clears any other events and creates a request based on the dataset of the target
function handlePageChangeEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  clearSearchFocus();

  const target: EventTarget | null = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;

  const pageRequest: PageRequest = createPageRequest(target.dataset);
  handlePageChange(pageRequest);
}

// --- Clears focus from search input field
function clearSearchFocus(): void {
  const inputField: HTMLInputElement | null = document.querySelector<HTMLInputElement>(
    SELECTORS.SEARCH_INPUT,
  );
  if (inputField) {
    (document.activeElement as HTMLElement)?.blur();
    inputField.blur();
  }
}

// --- PAGE REQUEST CREATION

// --- Creates a PageRequest object based on the provided data
function createPageRequest(
  data: DOMStringMap | { document?: string; section?: string; redirect?: string },
): PageRequest {
  const document: string = data.document || "";
  const section: string = data.section || "";
  const redirect: string | undefined = data.redirect;

  return {
    document,
    section,
    redirect,
    pageType: determinePageType(document),
    isPopstate: false,
  };
}

// --- Determines the page type based on the document name
function determinePageType(document: string): PageType {
  if (document === "HOME") return "home";
  if (document.includes("./")) return "generic";
  return "tech";
}

// --- Unified function for any change request
async function handlePageChange(request: PageRequest): Promise<void> {
  if (request.pageType === "tech") {
    await ensureKatexLoaded();
  }
  await loadPage(request);
  processPage(request);
}

// --- PAGE NAVIGATION

// --- Setup KaTeX for styling of math elements
async function ensureKatexLoaded(): Promise<void> {
  if (appState.katexLoaded) return;
  // Loads css to head.
  return new Promise<void>((resolve: (value: void) => void): void => {
    const link: HTMLLinkElement = document.createElement("link");
    Object.assign(link, {
      rel: "stylesheet",
      crossOrigin: "anonymous",
      href: "styles/katex.min.css",
    });

    link.onload = (): void => {
      appState.katexLoaded = true;
      resolve();
    };

    document.head.appendChild(link);
  });
}

// --- Clears search (if needed) and updates page state
async function loadPage(request: PageRequest): Promise<void> {
  // Clear active search results and add logo animation
  moduleObjects.search.clearSearchResults();
  moduleObjects.helper.addLogoVelocity();

  // Load page content
  appState.pageContent = await getPageContent(request);
}

// --- Fetches the content of the requested page and updates state so it is not downloaded again
async function getPageContent(request: PageRequest): Promise<string> {
  const documentKey: string = request.document;

  if (appState.parsedDocuments.has(documentKey)) {
    return appState.parsedDocuments.get(documentKey) ?? "";
  }

  const filePath: string = getFilePath(request);
  const content: string = await moduleObjects.helper.asyncRead(filePath);
  appState.parsedDocuments.set(documentKey, content);
  return content;
}

// --- File path handling for the three different kinds of pages
function getFilePath(request: PageRequest): string {
  switch (request.pageType) {
    case "home":
      return `./${request.document.toLowerCase()}.html`;
    case "generic":
      return `./${request.document}.html`;
    case "tech":
      return `./tech/${request.document.toLowerCase()}.html`;
  }
}

// --- PAGE PROCESSING

// --- Processes the page request, updates DOM, SEO, history, and sets up functionality
function processPage(request: PageRequest): void {
  // Check if same document BEFORE updating currentDocument
  const isSameDocument: boolean = appState.currentDocument === request.document;
  // Handle tech page redirects for same document
  if (
    isSameDocument &&
    request.pageType === "tech" &&
    request.redirect &&
    request.redirect !== "NONE"
  ) {
    handleTechPageRedirect(request);
    updateHistory(request);
    return;
  }

  // Clear edit block if it is open
  clearEditBlock();

  // Update currentDocument after the check
  appState.currentDocument = request.document;

  updatePageDOM(request);
  updateSEO(request);
  updateHistory(request);
  setupPageFunctionality(request);
  handlePageNavigation(request);
}

// --- Updates the DOM based on the request
function updatePageDOM(request: PageRequest): void {
  const contentElement: HTMLElement | null = document.getElementById("content");
  if (!contentElement) return;

  // Set content visibility and height
  contentElement.style.minHeight =
    request.pageType === "tech" ? PAGE_CONFIG.MIN_HEIGHT_TECH : PAGE_CONFIG.MIN_HEIGHT_STANDARD;

  if (request.pageType === "tech") {
    contentElement.style.visibility = "hidden";
  }

  // Clear previous state
  moduleObjects.toc.clearHeadings();
  moduleObjects.toc.clearSectionTOC();

  // Update helper status
  moduleObjects.helper.updateStatus(request.document, request.section, request.pageType === "tech");

  // Set content
  contentElement.innerHTML = appState.pageContent;

  // Setup H2 collection for tech pages
  if (request.pageType === "tech") {
    setupH2Collection();
  }
}

// --- Updates the page metadata based on the request
function updateSEO(request: PageRequest): void {
  const title: string =
    request.pageType === "tech" ? `TTE - ${request.section}` : "Tales Tech Encyclopaedia";

  const description: string =
    request.pageType === "tech"
      ? `Tales Tech Encyclopaedia (TTE) article on ${request.section}.`
      : "Tales Tech Encyclopaedia (TTE), is a project that aims to document techniques and mechanics on the games of the 'Tales of Series'.";

  document.title = title;
  const metaDescription: HTMLMetaElement | null = document.querySelector<HTMLMetaElement>(
    SELECTORS.META_DESCRIPTION,
  );
  metaDescription?.setAttribute("content", description);
}

// --- Updates the browser history with the new request
function updateHistory(request: PageRequest): void {
  if (request.isPopstate) return;
  if (moduleObjects.helper.inEdit) return;
  const url: string = buildURL(request);
  window.history.pushState(request, document.title, url);
}

// --- Builds the URL based on the request
function buildURL(request: PageRequest): string {
  switch (request.pageType) {
    case "home":
      return "/";
    case "generic":
      return `/${request.document.toLowerCase()}`;
    case "tech": {
      const baseUrl: string = `/${request.document.toLowerCase()}`;
      return request.redirect && request.redirect !== "NONE"
        ? `${baseUrl}/${request.redirect.substring(1)}`
        : baseUrl;
    }
  }
}

// --- Sets up common functionality for the page based on the request
function setupPageFunctionality(request: PageRequest): void {
  // Common functionality for all pages
  if (request.pageType === "home" || request.pageType === "generic") {
    moduleObjects.directives.compileDirectives();
  }

  moduleObjects.toc.createTOC(appState.currentDocument);
  setupTOCRedirects();
  moduleObjects.headings.shareHeadings();

  // Page-specific functionality
  if (request.pageType === "home") {
    setupHomeRedirectElements();
    setupHomeShowcaseElements();
    moduleObjects.search.initializeOnboardingIcon();
  } else if (request.pageType === "tech") {
    moduleObjects.headings.collapseHeadings();
    setupH2SelectorFunctionality();
    openFirstH2Section();
  }
}

// --- Handles content scroll and navigation based on if the request has a redirect or not
function handlePageNavigation(request: PageRequest): void {
  if (request.pageType === "tech" && request.redirect && request.redirect !== "NONE") {
    setTimeout((): void => {
      moduleObjects.search.revealElementById(request.redirect!.substring(1));
      const targetElement: Element | null =
        document.querySelector(request.redirect!) ??
        document.querySelector(SELECTORS.CONTENT_SELECTOR);
      targetElement?.scrollIntoView({ behavior: "smooth" });
    }, PAGE_CONFIG.REDIRECT_DELAY);
  } else {
    scrollToNavigation();
  }
}

// --- HELPER FUNCTIONS

// --- Gets the H2 collection from the data attribute on the H1 element and clears it
function setupH2Collection(): void {
  const h1Element: HTMLElement | null = document.querySelector<HTMLElement>(SELECTORS.H1);
  if (!h1Element) return;

  const h2CollectionData: string | undefined = h1Element.dataset.h2Collection;
  if (h2CollectionData) {
    h1Element.removeAttribute("data-h2-collection");
    moduleObjects.helper.h2Collection = JSON.parse(h2CollectionData);
  }
}

// --- Simple scroll to nav-bar or reveal the target and scroll to it
function handleTechPageRedirect(request: PageRequest): void {
  if (request.redirect) {
    moduleObjects.search.revealElementById(request.redirect.substring(1));
    const targetElement: Element | null =
      document.querySelector(request.redirect) ??
      document.querySelector(SELECTORS.CONTENT_SELECTOR);
    targetElement?.scrollIntoView({ behavior: "smooth" });
  } else {
    scrollToNavigation();
  }
}

// --- Scrolls to the navigation bar
function scrollToNavigation(): void {
  document.querySelector(SELECTORS.NAV_BAR)?.scrollIntoView({ behavior: "smooth" });
}

// --- HOME PAGE FUNCTIONALITY

// --- After loading the home page, add change events just like it is done for the shell
function setupHomeRedirectElements(): void {
  const redirectElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.CONTENT_REDIRECT,
  );
  for (const element of redirectElements) {
    addPageChangeEvent(element);
  }
}

// --- Adds click events to the showcase play buttons
function setupHomeShowcaseElements(): void {
  const showcaseElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.SHOWCASE_PLAY,
  );
  for (const element of showcaseElements) {
    element.addEventListener("click", handleShowcaseClick);
  }
}

// --- Make video appear or not based on showcase click
function handleShowcaseClick(event: Event): void {
  const target: EventTarget | null = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;

  if (target.innerHTML === "play_circle") {
    createShowcaseVideo(target);
  } else {
    removeShowcaseVideo(target);
  }
}

// --- Creates a video element on top of the showcase image
function createShowcaseVideo(target: HTMLElement): void {
  target.innerHTML = "stop_circle";

  const video: HTMLVideoElement = document.createElement("video");
  Object.assign(video, {
    src: target.dataset.video || "",
    className: SELECTORS.SHOWCASE_VIDEO.substring(1),
    autoplay: true,
    controls: false,
    muted: true,
    loop: true,
  });

  target.parentElement?.appendChild(video);

  setTimeout((): void => {
    video.style.opacity = "1";
  }, PAGE_CONFIG.VIDEO_FADE_DELAY);
}

// --- Removes the video element from the showcase and resets the button
function removeShowcaseVideo(target: HTMLElement): void {
  const video: HTMLVideoElement | null | undefined =
    target.parentElement?.querySelector<HTMLVideoElement>(SELECTORS.SHOWCASE_VIDEO);

  if (video) {
    video.style.opacity = "0";
    setTimeout((): void => {
      video.remove();
      target.innerHTML = "play_circle";
    }, PAGE_CONFIG.VIDEO_REMOVE_DELAY);
  } else {
    target.innerHTML = "play_circle";
  }
}

// --- TECH PAGE FUNCTIONALITY

// --- Sets up redirects for the Table of Contents (TOC) elements
function setupTOCRedirects(): void {
  const tocElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.TOC_SEARCH,
  );
  for (const element of tocElements) {
    addPageChangeEvent(element);
  }
}

// --- Sets up the functionality for the H2 selector boxes
function setupH2SelectorFunctionality(): void {
  const selectorBoxes: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.SELECTOR_ITEM,
  );

  for (const element of selectorBoxes) {
    element.addEventListener("click", handleH2SelectorClick);
  }
}

// --- Handles the click event for H2 selector boxes: load content, regenerate TOC, setup new content behavior
function handleH2SelectorClick(event: Event): void {
  const target: EventTarget | null = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;

  clearH2Selections();
  target.className = "content__selectorbox--item selected";

  updateH2Content(target);
  setupCollapseButtons();

  // Re-setup functionality for new content
  moduleObjects.directives.compileDirectives();
  moduleObjects.toc.createTOC(appState.currentDocument);
  setupTOCRedirects();
  moduleObjects.headings.shareHeadings();
  moduleObjects.toc.highlightTOC();
}

// --- Clears all H2 selector selections (the active one is set by the previous function)
function clearH2Selections(): void {
  const allSelectors: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.SELECTOR_ITEM,
  );
  for (const element of allSelectors) {
    element.className = "content__selectorbox--item";
  }
}

// --- Updates the content of the current H2 section based on the selected H2 box (data gotten from h1)
function updateH2Content(target: HTMLElement): void {
  const currentCollection: h2Data[] = moduleObjects.helper.h2Collection.filter(
    (h2: h2Data): boolean => h2.id === target.dataset.open,
  );

  const contentCurrentH2: HTMLElement | null = document.getElementById("content__currenth2");
  if (contentCurrentH2 && currentCollection.length > 0) {
    contentCurrentH2.innerHTML = currentCollection[0].content;
  }
}

// --- Sets up the collapse buttons for H3 content blocks
function setupCollapseButtons(): void {
  const collapseButtons: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.CONTENT_COLLAPSE,
  );
  for (const element of collapseButtons) {
    element.addEventListener("click", moduleObjects.headings.collapseHeadingStyle);
  }
}

// --- Opens the first H2 section by simulating a click on the first selector box
function openFirstH2Section(): void {
  const firstSelectorBox: HTMLElement | null = document.querySelector<HTMLElement>(
    SELECTORS.SELECTOR_ITEM,
  );
  firstSelectorBox?.click();
}

// --- EDIT PAGE FUNCTIONALITY

// Cached compiler instance to avoid re-importing
// --> markdown.mjs is a pre-build package created with a different build process that merges all edit functionality into one
//     due to this, I've decided to just ignore these imports for now to not have complicated path configurations
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let cachedCompilerInstance: import("./markdown.mjs").Compiler | null = null;

async function editPage(pageRequest: PageRequest): Promise<void> {
  try {
    // Dynamically import compiler if not already cached
    if (!cachedCompilerInstance) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const markdownModule: typeof import("./markdown.mjs") = await import("./markdown.mjs");
      cachedCompilerInstance = await markdownModule.initializeCompiler(moduleObjects.helper);
    }

    moduleObjects.helper.inEdit = true;

    // Get and clear content div
    const contentElement: HTMLElement | null = document.querySelector<HTMLElement>(
      SELECTORS.CONTENT,
    );
    if (contentElement) {
      contentElement.innerHTML = "";
    }

    // Get the edit content container
    const editContentElement: HTMLElement | null = document.getElementById("edit-content");
    if (!editContentElement) {
      console.error("Edit content container not found");
      return;
    }

    // Show edit content and clear previous content
    editContentElement.style.display = "block";
    editContentElement.innerHTML = "";
    const markdownFilePath: string = getMarkdownFilePath(pageRequest);
    const markdownContent: string = await moduleObjects.helper.asyncRead(markdownFilePath);

    // Create edit interface
    const editFormElement: HTMLFormElement = document.createElement("form");
    editFormElement.className = "edit-content__form";
    editFormElement.innerHTML = `
      <div class="edit-content__header">
        <div class="edit-content__title">
          <span class="material-symbols-rounded">edit_document</span>
          EDIT: ${pageRequest.section.toUpperCase()}
        </div>
        <p class="edit-content__subtitle">DOCUMENT: ${pageRequest.document.toUpperCase()} (${pageRequest.pageType.toUpperCase()})</p>
      </div>

      <div class="edit-content__main">
        <div class="edit-content__form-section">
          <div class="edit-content__credentials">
            <div class="edit-content__field-group">
              <label for="edit-content__username" class="edit-content__label">USERNAME</label>
              <input type="text" id="edit-content__username" class="edit-content__input" placeholder="Enter your username" required autocomplete="username">
            </div>
            <div class="edit-content__field-group">
              <label for="edit-content__password" class="edit-content__label">PASSWORD</label>
              <input type="password" id="edit-content__password" class="edit-content__input" placeholder="Enter your password" required autocomplete="current-password">
            </div>
          </div>

          <div class="edit-content__acknowledgment">
            <div class="edit-content__checkbox-container">
              <input type="checkbox" id="edit-content__ownership" class="edit-content__checkbox" required>
              <label for="edit-content__ownership" class="edit-content__checkbox-label">
                I have properly cited external sources used in my changes.
              </label>
            </div>
          </div>

          <div class="edit-content__actions">
            <button type="button" class="edit-content__button edit-content__button--cancel">
              <span class="material-symbols-rounded">cancel</span>
              CANCEL
            </button>
            <button type="button" class="edit-content__button edit-content__button--refresh">
              <span class="material-symbols-rounded">refresh</span>
              RENDER PAGE
            </button>
            <button type="submit" class="edit-content__button edit-content__button--submit" disabled>
              <span class="material-symbols-rounded">webhook</span>
              REQUEST CHANGES
            </button>
          </div>
        </div>

        <div class="edit-content__editor-container">
          <div class="edit-content__editor-header">
            <label for="edit-content__textarea" class="edit-content__content-label">
              MARKDOWN CONTENT
              <span class="edit-content__content-info">Edit content below. Changes will be reviewed before publishing.</span>
            </label>
            <div class="edit-content__file-actions">
              <button type="button" class="edit-content__file-button" data-action="download">
                <span class="material-symbols-rounded">file_save</span>
              </button>
              <button type="button" class="edit-content__file-button" data-action="upload">
                <span class="material-symbols-rounded">upload_file</span>
              </button>
            </div>
          </div>
          <div id="edit-content__textarea" class="editor edit-content__textarea"></div>
        </div>
      </div>
    `;

    // Add event listeners
    setupEditEventListeners(editFormElement, pageRequest);
    editContentElement.appendChild(editFormElement);
    const textareaElement: HTMLTextAreaElement | null =
      document.querySelector<HTMLTextAreaElement>("#edit-content__textarea");
    if (textareaElement) {
      cachedCompilerInstance.initializeEditor(markdownContent, textareaElement);
    }
    editRefreshAction();
  } catch (error: unknown) {
    console.error("Failed to load edit page:", error);
    const editContentElement: HTMLElement | null = document.getElementById("edit-content");
    if (editContentElement) {
      editContentElement.style.display = "block";
      editContentElement.innerHTML = `
        <div class="edit-content__error">
          <span class="material-symbols-rounded">error</span>
          <p>Failed to load edit interface. Please try again.</p>
        </div>
      `;
    }
  }
}

// --- Setup all edit form event listeners
function setupEditEventListeners(formElement: HTMLFormElement, pageRequest: PageRequest): void {
  const submitButtonElement: HTMLButtonElement | null =
    formElement.querySelector<HTMLButtonElement>(".edit-content__button--submit");
  const checkboxElement: HTMLInputElement | null = formElement.querySelector<HTMLInputElement>(
    "#edit-content__ownership",
  );

  // Form submission
  formElement.addEventListener("submit", (submitEvent: Event): void => {
    submitEvent.preventDefault();
    if (checkboxElement?.checked) {
      handleEditSubmission(pageRequest);
    }
  });

  // Checkbox change - enable/disable submit button
  checkboxElement?.addEventListener("change", (): void => {
    if (submitButtonElement) {
      submitButtonElement.disabled = !checkboxElement.checked;
    }
  });

  // Cancel button
  const cancelButtonElement: HTMLButtonElement | null =
    formElement.querySelector<HTMLButtonElement>(".edit-content__button--cancel");
  cancelButtonElement?.addEventListener("click", (): void => {
    clearEditBlock();
    // Dummy page request
    const pageRequest: PageRequest = {
      document: appState.currentDocument,
      section: appState.currentDocument,
      redirect: "NONE",
      pageType: determinePageType(appState.currentDocument),
      isPopstate: false,
    };
    // use change page function from main
    handlePageChange(pageRequest);
  });

  // Refresh button
  const refreshButtonElement: HTMLButtonElement | null =
    formElement.querySelector<HTMLButtonElement>(".edit-content__button--refresh");
  refreshButtonElement?.addEventListener("click", (): void => {
    editRefreshAction();
    // Scroll to #content (first h1 has better vertical alignment)
    const contentElement: HTMLElement | null = document.querySelector<HTMLElement>("h1");
    if (contentElement) {
      contentElement.scrollIntoView({ behavior: "smooth" });
    }
  });

  // File action buttons
  const fileButtonElements: NodeListOf<HTMLButtonElement> =
    formElement.querySelectorAll<HTMLButtonElement>(".edit-content__file-button");
  for (const fileButtonElement of fileButtonElements) {
    // Setup click handlers
    fileButtonElement.addEventListener("click", (): void => {
      const actionType: string | undefined = fileButtonElement.dataset.action;
      if (actionType === "download") {
        handleFileDownload();
      } else if (actionType === "upload") {
        handleFileUpload();
      }
    });

    // Setup custom tooltip functionality
    const tooltipText: string =
      fileButtonElement.dataset.action === "download"
        ? "Download markdown file"
        : "Upload markdown file";

    moduleObjects.helper.setTooltip(fileButtonElement, tooltipText);
  }
}

// --- Get markdown file path based on page request
function getMarkdownFilePath(pageRequest: PageRequest): string {
  switch (pageRequest.pageType) {
    case "home":
      return `${pageRequest.document.toLowerCase()}.md`;
    case "generic":
      return `${pageRequest.document}.md`;
    case "tech":
      return `tech/${pageRequest.document.toLowerCase()}.md`;
    default:
      return `tech/${pageRequest.document.toLowerCase()}.md`;
  }
}

// --- Handle edit form submission (placeholder for now)
async function handleEditSubmission(pageRequest: PageRequest): Promise<void> {
  // console log the editable field
  const textareaElement: HTMLTextAreaElement | null =
    document.querySelector<HTMLTextAreaElement>("#edit-content__textarea");
  if (textareaElement) {
    const textContent: string = (await cachedCompilerInstance.getEditorContent()) || "";
    console.log("Editable Content:", textContent);
    const usernameElement: HTMLInputElement | null =
      document.querySelector<HTMLInputElement>("#edit-content__username");
    const passwordElement: HTMLInputElement | null =
      document.querySelector<HTMLInputElement>("#edit-content__password");
    const username: string = usernameElement?.value.trim() || "";
    const password: string = passwordElement?.value.trim() || "";
    const pageName: string = pageRequest.document.toLowerCase();
    // hash password with web-crypto api
    const hashedPasswordHex: string = await sha256(password);
    try {
      const response: Response = await fetch("https://tteworker.vcentok.workers.dev//pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: hashedPasswordHex,
          document: pageName,
          content: textContent,
        }),
      });
      const result = await response.json();
      console.log("API Response:", result);
    } catch (error) {
      console.error("Error sending POST request:", error);
    }
  }
  // TODO
}

async function sha256(message: string): Promise<string> {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert ArrayBuffer to Array of bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

async function editRefreshAction(): Promise<void> {
  const textContent: string = (await cachedCompilerInstance?.getEditorContent()) || "";
  const compiledContent: string =
    (await cachedCompilerInstance?.parseText(
      textContent,
      moduleObjects.helper.currentDocument,
      moduleObjects.helper.currentSection,
      true,
    )) || "";
  // Create dummy PageRequest based on current document
  const pageRequest: PageRequest = {
    document: moduleObjects.helper.currentDocument ?? appState.currentDocument,
    section: moduleObjects.helper.currentSection ?? "",
    redirect: "NONE",
    pageType: determinePageType(appState.currentDocument),
    isPopstate: false,
  };
  // Update content block
  const contentElement: HTMLElement | null = document.querySelector<HTMLElement>(SELECTORS.CONTENT);
  if (!contentElement) return;
  contentElement.style.minHeight =
    pageRequest.pageType === "tech" ? PAGE_CONFIG.MIN_HEIGHT_TECH : PAGE_CONFIG.MIN_HEIGHT_STANDARD;

  if (pageRequest.pageType === "tech") {
    contentElement.style.visibility = "hidden";
  }
  contentElement.innerHTML = compiledContent;

  // Clear previous state
  moduleObjects.toc.clearHeadings();
  moduleObjects.toc.clearSectionTOC();

  // Setup H2 collection for tech pages
  if (pageRequest.pageType === "tech") {
    setupH2Collection();
  }

  setupPageFunctionality(pageRequest);
}

// --- Handle file download
async function handleFileDownload(): Promise<void> {
  const textContent: string = (await cachedCompilerInstance?.getEditorContent()) || "";

  const filename: string = `${moduleObjects.helper.currentDocument || "document"}.md`;

  // Create blob with markdown content
  const blob: Blob = new Blob([textContent], { type: "text/markdown;charset=utf-8" });

  // Create download link
  const downloadLink: HTMLAnchorElement = document.createElement("a");
  downloadLink.style.display = "none";
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;

  // Trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  // Clean up object URL
  URL.revokeObjectURL(downloadLink.href);
}

// --- Handle file upload
function handleFileUpload(): void {
  // Create file input element
  const fileInput: HTMLInputElement = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".md,.txt,.markdown";
  fileInput.style.display = "none";

  // Handle file selection
  fileInput.addEventListener("change", (event: Event): void => {
    const target: EventTarget | null = event.target;
    if (!(target instanceof HTMLInputElement) || !target.files || target.files.length === 0) {
      return;
    }

    const file: File = target.files[0];

    // Read file content
    const reader: FileReader = new FileReader();

    reader.onload = (loadEvent: ProgressEvent<FileReader>): void => {
      const result: string | ArrayBuffer | null = loadEvent.target?.result || null;
      cachedCompilerInstance?.updateEditorContent(result as string);
    };

    reader.onerror = (): void => {
      console.error("Error reading file");
    };

    reader.readAsText(file, "utf-8");

    // Clean up
    document.body.removeChild(fileInput);
  });

  // Trigger file dialog
  document.body.appendChild(fileInput);
  fileInput.click();
}

function clearEditBlock(): void {
  const editContentElement: HTMLElement | null = document.getElementById("edit-content");
  moduleObjects.helper.inEdit = false;
  if (editContentElement) {
    editContentElement.style.display = "none";
    editContentElement.innerHTML = "";
  }
}
