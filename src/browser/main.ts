// ---------
// main.js is the entry point for our code.
//   inits all other modules
//   controls page history
//   controls page flow and state
// To add games, change fileList on shared/globals !

// VCent's notes:
//   This is a mostly-pure typescript project.
//   While I wouldn't do this nowadays (probably would do something with Astro and webcomponents), I both didn't have enough experience with frontend stuff AND tools didn't have support and/or a good workflow for those tools back then.
//   What we have now is a fairly performant app which was unfortunately harmed a bit by feature-creep.
//   However, the code under "shared" is the one responsible for treating MD pages. Any future implementation of a front-end code can use those without issues.
//   It is called "shared" since it is used both in the browser and in our integration scripts. On the scripts, we compile MD to HTML. In the browser, it is used when a user edits a page in the browser and wants to render it to show changes.

import { Search } from "./search";
import { TOC } from "./toc";
import { Headings } from "./headings";
import { Directives } from "./directives";
import { h2Data, Helper, PageRequest, PageType } from "../shared/helper";
import { FileEntry, fileList } from "../shared/globals";

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
  readonly HOME_UPDATED: string;
  readonly HOME_GAMES: string;
}

interface PageConfiguration {
  readonly MIN_HEIGHT_STANDARD: string;
  readonly MIN_HEIGHT_TECH: string;
  readonly REDIRECT_DELAY: number;
  readonly VIDEO_FADE_DELAY: number;
  readonly VIDEO_REMOVE_DELAY: number;
}

interface GameCarouselState {
  gameItems: HTMLElement[];
  menuItems: {
    desktop: HTMLElement[];
    mobile: HTMLElement[];
  };
  visibleItems: HTMLElement[];
  activeIndex: number;
  isTransitioning: boolean;
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
  SHOWCASE_PLAY: ".content__games-play--videospan",
  SHOWCASE_VIDEO: ".content__games__hero__video",
  HOME_UPDATED: ".content__latest-changes__commit-changes-link",
  HOME_GAMES: ".content__games__hero__article-item",
} as const;

const PAGE_CONFIG: PageConfiguration = {
  MIN_HEIGHT_STANDARD: "600px",
  MIN_HEIGHT_TECH: "100vh",
  REDIRECT_DELAY: 100,
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

let editSubmissionLock: boolean = false;
let gamesCarouselState: GameCarouselState | null = null;
let homeGamesDesktopFilled: boolean = false;

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

    handlePageChange(pageRequest).then();
  });
}

// --- Handles initial route, depends on url/pathname on page load
function handleInitialRoute(): void {
  const pathname: string = document.location.pathname.substring(1);

  // Handle root path
  if (!pathname) {
    const homeRequest: PageRequest = createPageRequest({ document: "HOME", section: "HOME" });
    homeRequest.isPopstate = true;
    handlePageChange(homeRequest).then();
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
    handlePageChange(pageRequest).then();
    window.history.replaceState(pageRequest, matchingEntry.section, pathname);
  } else {
    // Invalid path, redirect to home
    const homeRequest: PageRequest = createPageRequest({ document: "HOME", section: "HOME" });
    handlePageChange(homeRequest).then();
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
  handlePageChange(pageRequest).then();
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
  if (
    request.pageType === "tech" ||
    (request.pageType === "generic" && request.document === "./STYLING")
  ) {
    await ensureKatexLoaded();
  }
  await loadPage(request);
  await processPage(request);
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
async function processPage(request: PageRequest): Promise<void> {
  // Check if same document BEFORE updating currentDocument
  const isSameDocument: boolean = appState.currentDocument === request.document;
  // Handle tech page redirects for same document
  if (
    isSameDocument &&
    request.pageType === "tech" &&
    request.redirect &&
    request.redirect !== "NONE"
  ) {
    await handlePageNavigation(request);
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
  await handlePageNavigation(request);
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
async function handlePageNavigation(request: PageRequest): Promise<void> {
  if (request.pageType === "tech" && request.redirect && request.redirect !== "NONE") {
    await moduleObjects.search.revealElementById(request.redirect!.substring(1));
    setTimeout(async (): Promise<void> => {
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

// --- Scrolls to the navigation bar
function scrollToNavigation(): void {
  document.querySelector(SELECTORS.NAV_BAR)?.scrollIntoView({ behavior: "smooth" });
}

// --- HOME PAGE FUNCTIONALITY

// --- After loading the home page, add change events just like it is done for the shell
function setupHomeRedirectElements(): void {
  const redirectElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    `${SELECTORS.CONTENT_REDIRECT}, ${SELECTORS.HOME_UPDATED}, ${SELECTORS.HOME_GAMES}`,
  );
  for (const element of redirectElements) {
    addPageChangeEvent(element);
  }
}

// --- Adds click events to the showcase play buttons
function handleShowcaseClick(event: Event): void {
  const target: EventTarget | null = event.currentTarget;
  if (!(target instanceof HTMLElement)) return;

  if (target.textContent?.trim() === "play_arrow") {
    createShowcaseVideo(target);
  } else {
    removeShowcaseVideo(target);
  }
}

// --- Creates a video element on top of the hero image
function createShowcaseVideo(target: HTMLElement): void {
  target.textContent = "stop";

  const video: HTMLVideoElement = document.createElement("video");
  Object.assign(video, {
    src: target.dataset.video || "",
    className: "content__games__hero__video",
    autoplay: true,
    controls: false,
    muted: true,
    loop: true,
  });

  target.parentElement?.parentElement?.appendChild(video);

  setTimeout((): void => {
    video.style.opacity = "1";
  }, PAGE_CONFIG.VIDEO_FADE_DELAY);
}

// --- Removes the video element from the hero element and resets the button
function removeShowcaseVideo(target: HTMLElement): void {
  const video: HTMLVideoElement | null | undefined =
    target.parentElement?.parentElement?.querySelector<HTMLVideoElement>(
      ".content__games__hero__video",
    );

  if (video) {
    video.style.opacity = "0";
    setTimeout((): void => {
      video.remove();
      target.textContent = "play_arrow";
    }, PAGE_CONFIG.VIDEO_REMOVE_DELAY);
  } else {
    target.textContent = "play_arrow";
  }
}

// --- Ensure the desktop games menu (HTML fragments) and cards are loaded once, then do events
async function ensureHomeGamesDesktopLoaded(): Promise<void> {
  if (homeGamesDesktopFilled) return;

  // Dynamic import - only loads when needed
  const {
    cachedHomeGamesMenuHTML,
    cachedHomeGamesStackHTML,
  }: { cachedHomeGamesMenuHTML: string; cachedHomeGamesStackHTML: string } = await import(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-start
    "../../cache/homeGamesHTML.js"
  );

  // Decompress both strings
  const [menuHTML, stackHTML]: [string, string] = await Promise.all([
    moduleObjects.helper.decompress(cachedHomeGamesMenuHTML),
    moduleObjects.helper.decompress(cachedHomeGamesStackHTML),
  ]);

  // Populate desktop popup
  const desktopAsideElement: HTMLElement | null = document.querySelector(
    ".content__games-menu-popup-desktop",
  );
  if (desktopAsideElement && desktopAsideElement.innerHTML.trim().length === 0) {
    desktopAsideElement.innerHTML = menuHTML;
  }

  // Append remaining game cards (first already inline)
  const stackElement: HTMLElement | null = document.querySelector(".content__games-stack");
  if (stackElement && stackHTML.trim().length > 0) {
    stackElement.insertAdjacentHTML("beforeend", stackHTML);
  }

  homeGamesDesktopFilled = true;

  const desktopMenuPopupElement: HTMLElement | null = document.querySelector<HTMLElement>(
    ".content__games-menu-popup:not(.content__games-mobile .content__games-menu-popup)",
  );

  // Menu item click handlers (desktop + mobile)
  const menuItemElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    ".content__games-menu__item",
  );

  for (const menuItemElement of menuItemElements) {
    menuItemElement.addEventListener("click", (event: MouseEvent): void => {
      event.stopPropagation();

      const state: GameCarouselState | null = getGamesCarouselState();
      if (!state) return;

      const targetSection: string | undefined = menuItemElement.dataset.section;
      const targetIndex: number = state.gameItems.findIndex(
        (gameItem: HTMLElement): boolean => gameItem.dataset.section === targetSection,
      );
      if (targetIndex === -1) return;

      navigateCarousel(state, "direct", targetIndex);

      // If originated from desktop popup (moved to body), hide it
      if (
        desktopMenuPopupElement &&
        menuItemElement.closest(".content__games-menu-popup")?.parentElement === document.body
      ) {
        hideMenuPopup(desktopMenuPopupElement);
      }
    });
  }

  if (desktopMenuPopupElement) {
    // Close button inside popup
    const closeButtonElement: HTMLElement | null =
      desktopMenuPopupElement.querySelector<HTMLElement>(".content__games-menu__icon--close");
    closeButtonElement?.addEventListener("click", (event: MouseEvent): void => {
      event.stopPropagation();
      hideMenuPopup(desktopMenuPopupElement);
    });
  }

  // Prev / Next navigation buttons
  const prevButtonElements: NodeListOf<HTMLElement> =
    document.querySelectorAll<HTMLElement>(".content__games-prev");
  const nextButtonElements: NodeListOf<HTMLElement> =
    document.querySelectorAll<HTMLElement>(".content__games-next");

  for (const buttonElement of prevButtonElements) {
    buttonElement.addEventListener("click", (): void => {
      navigateCarousel(gamesCarouselState, "prev").then();
    });
  }
  for (const buttonElement of nextButtonElements) {
    buttonElement.addEventListener("click", (): void => {
      navigateCarousel(gamesCarouselState, "next").then();
    });
  }

  // Showcase play buttons
  const showcasePlayElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.SHOWCASE_PLAY,
  );
  for (const showcaseElement of showcasePlayElements) {
    showcaseElement.addEventListener("click", handleShowcaseClick);
  }

  // Page change event for redirects
  const redirectMenuItems: NodeListOf<Element> = document.querySelectorAll(
    `.content__games-menu__item-redirect, ${SELECTORS.HOME_GAMES}`,
  );
  for (const redirectMenuItem of redirectMenuItems) {
    if (redirectMenuItem instanceof HTMLElement) {
      addPageChangeEvent(redirectMenuItem);
    }
  }
}

// --- Initialize and setup the games carousel functionality
function setupGamesCarousel(): void {
  // Reset carousel state
  gamesCarouselState = null;
  homeGamesDesktopFilled = false;

  // Navigation buttons
  const previousButtonElements: NodeListOf<HTMLElement> =
    document.querySelectorAll<HTMLElement>(".content__games-prev");
  const nextButtonElements: NodeListOf<HTMLElement> =
    document.querySelectorAll<HTMLElement>(".content__games-next");

  // Attach navigation handlers (this only applies to first hero in this scope)
  for (const previousButtonElement of previousButtonElements) {
    previousButtonElement.addEventListener("click", (): void => {
      navigateCarousel(gamesCarouselState, "prev").then();
    });
  }
  for (const nextButtonElement of nextButtonElements) {
    nextButtonElement.addEventListener("click", (): void => {
      navigateCarousel(gamesCarouselState, "next").then();
    });
  }

  // Page change event for redirects
  const redirectMenuItems: NodeListOf<Element> = document.querySelectorAll(
    ".content__games-menu__item-redirect, .content__games-mobile .content__games-menu__item",
  );
  for (const redirectMenuItem of redirectMenuItems) {
    if (redirectMenuItem instanceof HTMLElement) {
      addPageChangeEvent(redirectMenuItem);
    }
  }

  // Dropdown menu
  setupGamesMenuDropdown();
}

// --- Setup the desktop games menu popup
function setupGamesMenuDropdown(): void {
  const controlButtonElements: NodeListOf<HTMLElement> =
    document.querySelectorAll<HTMLElement>(".content__games-showall");

  const desktopMenuPopupElement: HTMLElement | null = document.querySelector<HTMLElement>(
    ".content__games-menu-popup:not(.content__games-mobile .content__games-menu-popup)",
  );

  if (!desktopMenuPopupElement || controlButtonElements.length === 0) return;

  // Move popup into #content
  if (desktopMenuPopupElement.parentElement) {
    desktopMenuPopupElement.parentElement.removeChild(desktopMenuPopupElement);
    const contentElement: HTMLElement | null = document.getElementById("content");
    contentElement?.appendChild(desktopMenuPopupElement);
  }

  // Toggle handlers for each control button
  for (const controlButtonElement of controlButtonElements) {
    controlButtonElement.addEventListener("click", async (event: MouseEvent): Promise<void> => {
      event.stopPropagation();
      await ensureHomeGamesDesktopLoaded();
      if (desktopMenuPopupElement.style.display === "block") {
        hideMenuPopup(desktopMenuPopupElement);
      } else {
        positionMenuPopup(desktopMenuPopupElement);
      }
    });
  }

  // Outside click handler
  if (!desktopMenuPopupElement.dataset.outsideListenerAttached) {
    const controlButtonsArray: HTMLElement[] = [...controlButtonElements];
    document.addEventListener("click", (event: MouseEvent): void => {
      if (desktopMenuPopupElement.style.display !== "block") return;
      const targetNode: EventTarget | null = event.target;
      if (
        targetNode instanceof Node &&
        !desktopMenuPopupElement.contains(targetNode) &&
        !controlButtonsArray.some((btn: HTMLElement): boolean => btn.contains(targetNode))
      ) {
        hideMenuPopup(desktopMenuPopupElement);
      }
    });
    desktopMenuPopupElement.dataset.outsideListenerAttached = "true";
  }
}

// --- Position the popup based on the button's position
function positionMenuPopup(popup: HTMLElement): void {
  const controlsElement: HTMLElement | null = document.querySelector<HTMLElement>(
    ".content__games-controls",
  );
  const contentElement: HTMLElement | null = document.getElementById("content");

  if (!controlsElement || !contentElement) return;

  const controlsRect: DOMRect = controlsElement.getBoundingClientRect();
  const contentRect: DOMRect = contentElement.getBoundingClientRect();

  Object.assign(popup.style, {
    top: `${controlsRect.top - contentRect.top - 6}px`,
    right: `${contentRect.right - controlsRect.right - 6}px`,
    left: "auto",
    display: "block",
    zIndex: "20",
  });

  requestAnimationFrame((): void => {
    popup.classList.remove("fade-out");
    popup.classList.add("fade-in");
  });
}

// --- Hide popup menu
function hideMenuPopup(menuPopup: HTMLElement): void {
  menuPopup.classList.remove("fade-in");
  menuPopup.classList.add("fade-out");

  setTimeout((): void => {
    menuPopup.style.display = "none";
    menuPopup.classList.remove("fade-out");
  }, 250);
}

// --- Function to get or create the carousel state
function getGamesCarouselState(): GameCarouselState | null {
  if (gamesCarouselState) return gamesCarouselState;

  const heroItems: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>(".content__games__hero-item"),
  );
  if (heroItems.length === 0) return null;

  const desktopMenuItems: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".content__games-menu-popup-desktop .content__games-menu__item",
    ),
  );
  const mobileMenuItems: HTMLElement[] = Array.from(
    document.querySelectorAll<HTMLElement>(".content__games-mobile .content__games-menu__item"),
  );

  const visibleItems: HTMLElement[] = [...desktopMenuItems];

  const activeItemInMenu: HTMLElement | undefined = visibleItems.find(
    (item: HTMLElement): boolean => item.classList.contains("active"),
  );
  const activeIndex: number = activeItemInMenu ? visibleItems.indexOf(activeItemInMenu) : 0;

  gamesCarouselState = {
    gameItems: heroItems,
    menuItems: {
      desktop: desktopMenuItems,
      mobile: mobileMenuItems,
    },
    visibleItems,
    activeIndex: activeIndex > -1 ? activeIndex : 0,
    isTransitioning: false,
  };

  return gamesCarouselState;
}

// --- Navigate Carousel depending on direction or target
async function navigateCarousel(
  stateInput: GameCarouselState | null,
  direction: "next" | "prev" | "direct",
  targetIndex?: number,
): Promise<void> {
  await ensureHomeGamesDesktopLoaded();

  const state: GameCarouselState | null = stateInput ?? getGamesCarouselState();
  if (!state) return;

  // Ensure global state is updated
  if (!gamesCarouselState) gamesCarouselState = state;

  if (state.isTransitioning || state.visibleItems.length <= 1) return;
  state.isTransitioning = true;

  const totalVisibleItems: number = state.visibleItems.length;
  const currentIndexInVisible: number = state.activeIndex;
  let newIndexInVisible: number;

  if (direction === "direct" && targetIndex !== undefined) {
    const targetGame: HTMLElement = state.gameItems[targetIndex];
    if (!targetGame) {
      state.isTransitioning = false;
      return;
    }
    const targetMenuItem: HTMLElement | undefined = state.visibleItems.find(
      (item: HTMLElement): boolean => item.dataset.section === targetGame.dataset.section,
    );
    if (!targetMenuItem) {
      state.isTransitioning = false;
      return;
    }
    newIndexInVisible = state.visibleItems.indexOf(targetMenuItem);
  } else if (direction === "next") {
    newIndexInVisible = (currentIndexInVisible + 1) % totalVisibleItems;
  } else {
    newIndexInVisible = (currentIndexInVisible - 1 + totalVisibleItems) % totalVisibleItems;
  }

  if (newIndexInVisible < 0) newIndexInVisible = 0;

  const currentVisibleMenuItem: HTMLElement = state.visibleItems[currentIndexInVisible];
  const nextVisibleMenuItem: HTMLElement = state.visibleItems[newIndexInVisible];

  const currentHeroItem: HTMLElement | undefined = state.gameItems.find(
    (item: HTMLElement): boolean => item.dataset.section === currentVisibleMenuItem.dataset.section,
  );
  const nextHeroItem: HTMLElement | undefined = state.gameItems.find(
    (item: HTMLElement): boolean => item.dataset.section === nextVisibleMenuItem.dataset.section,
  );

  if (!currentHeroItem || !nextHeroItem) {
    state.isTransitioning = false;
    return;
  }

  currentHeroItem.classList.add("fade-out");

  const nextImage: HTMLImageElement | null = nextHeroItem.querySelector<HTMLImageElement>(
    ".content__games__hero__art",
  );
  if (nextImage && !nextImage.src && nextImage.dataset.src) {
    nextImage.src = nextImage.dataset.src;
  }

  // Timeout timer has to match CSS
  setTimeout((): void => {
    const performTransition = (): void => {
      currentHeroItem.classList.remove("active", "fade-out");
      nextHeroItem.classList.add("active", "fade-in");

      [...state.menuItems.desktop, ...state.menuItems.mobile].forEach((item: HTMLElement): void => {
        item.classList.toggle("active", item.dataset.section === nextHeroItem.dataset.section);
      });

      setTimeout((): void => {
        nextHeroItem.classList.remove("fade-in");
        state.activeIndex = newIndexInVisible;
        state.isTransitioning = false;
      }, 250);
    };

    if (nextImage && !nextImage.complete) {
      nextImage.onload = performTransition;
      nextImage.onerror = performTransition;
    } else {
      performTransition();
    }
  }, 250);
}

// --- Setup home page functionality
function setupHomeShowcaseElements(): void {
  const showcaseElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
    SELECTORS.SHOWCASE_PLAY,
  );
  for (const element of showcaseElements) {
    element.addEventListener("click", handleShowcaseClick);
  }

  const seeMoreButton: HTMLElement | null = document.getElementById(
    "content__latest-changes__show-more",
  );
  if (seeMoreButton) {
    seeMoreButton.addEventListener("click", (): void => {
      const hiddenItems: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
        ".content__latest-changes__commit-item.hidden",
      );
      const itemsToShow: HTMLElement[] = Array.from(hiddenItems).slice(0, 10);

      itemsToShow.forEach((item: HTMLElement): void => {
        item.classList.remove("hidden");
        const parentGroup: Element | null = item.closest(
          ".content__latest-changes__timeline-group",
        );
        if (parentGroup && parentGroup.classList.contains("hidden")) {
          parentGroup.classList.remove("hidden");
        }
      });

      if (document.querySelectorAll(".content__latest-changes__commit-item.hidden").length === 0) {
        seeMoreButton.style.display = "none";
      }
    });
  }

  setupGamesCarousel();
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

          <div class="edit-content__advanced-options-wrapper">
            <button type="button" class="edit-content__advanced-toggle">
              ADVANCED OPTIONS
              <span class="material-symbols-rounded chevron">expand_circle_down</span>
            </button>
          </div>
          <div class="edit-content__advanced-content">
            <div class="edit-content__field-group">
              <label for="edit-content__pr-message" class="edit-content__label">PULL REQUEST MESSAGE (OPTIONAL)</label>
              <textarea id="edit-content__pr-message" class="edit-content__input edit-content__pr-message-input" placeholder="Add a message for your pull request..."></textarea>
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
            <div class="edit-content__content-label">
              MARKDOWN CONTENT
              <span class="edit-content__content-info">Edit content below. Changes will be reviewed before publishing.</span>
            </div>
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
      await cachedCompilerInstance.initializeEditor(markdownContent, textareaElement);
    }
    editRefreshAction().then();
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
      handleEditSubmission(pageRequest).then();
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
    handlePageChange(pageRequest).then();
  });

  // Refresh button
  const refreshButtonElement: HTMLButtonElement | null =
    formElement.querySelector<HTMLButtonElement>(".edit-content__button--refresh");
  refreshButtonElement?.addEventListener("click", (): void => {
    editRefreshAction().then();
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
        handleFileDownload().then();
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

  // Advanced options toggle
  const advancedToggleElement: HTMLButtonElement | null =
    formElement.querySelector<HTMLButtonElement>(".edit-content__advanced-toggle");
  const advancedContentElement: HTMLElement | null = formElement.querySelector<HTMLElement>(
    ".edit-content__advanced-content",
  );

  advancedToggleElement?.addEventListener("click", (): void => {
    advancedToggleElement.classList.toggle("open");
    advancedContentElement?.classList.toggle("open");
  });
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

// --- Handle edit form submission
async function handleEditSubmission(pageRequest: PageRequest): Promise<void> {
  // Early return if submission is already locked
  if (editSubmissionLock) {
    return;
  }

  // Lock the submission to prevent multiple concurrent requests
  editSubmissionLock = true;

  const submitButtonElement: HTMLButtonElement | null = document.querySelector<HTMLButtonElement>(
    ".edit-content__button--submit",
  );
  const textareaElement: HTMLTextAreaElement | null =
    document.querySelector<HTMLTextAreaElement>("#edit-content__textarea");
  const usernameElement: HTMLInputElement | null =
    document.querySelector<HTMLInputElement>("#edit-content__username");
  const passwordElement: HTMLInputElement | null =
    document.querySelector<HTMLInputElement>("#edit-content__password");
  const prMessageElement: HTMLTextAreaElement | null = document.querySelector<HTMLTextAreaElement>(
    "#edit-content__pr-message",
  );

  // Update button state to show loading
  if (submitButtonElement) {
    Object.assign(submitButtonElement, {
      disabled: true,
      innerHTML: `
        <span class="material-symbols-rounded">hourglass_empty</span>
        SUBMITTING...
      `,
    });
  }
  clearResponseMessage();

  if (!textareaElement) {
    // Unlock if textarea not found
    editSubmissionLock = false;
    if (submitButtonElement) {
      Object.assign(submitButtonElement, {
        disabled: false,
        innerHTML: `
          <span class="material-symbols-rounded">webhook</span>
          REQUEST CHANGES
        `,
      });
    }
    return;
  }

  try {
    const rawUsername: string = usernameElement?.value.trim() ?? "";
    const password: string = passwordElement?.value.trim() ?? "";

    if (rawUsername.startsWith("+")) {
      const cleanUsername: string = rawUsername.substring(1);
      const hashedPasswordHex: string = await sha256(password);
      await handleUserCreation(cleanUsername, hashedPasswordHex);
      return;
    }

    // Pull Request
    const textContent: string = (await cachedCompilerInstance.getEditorContent()) || "";
    const username: string = rawUsername;
    const pageName: string = pageRequest.document.toLowerCase();
    const prMessage: string = prMessageElement?.value.trim() ?? "";

    // Hash password with web-crypto API
    const hashedPasswordHex: string = await sha256(password);

    const response: Response = await fetch("https://tteworker.vcentok.workers.dev/pr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password: hashedPasswordHex,
        document: pageName,
        content: textContent,
        prMessage: prMessage,
      }),
    });

    const result: { message: string; url?: string; prNumber?: number } = await response.json();

    // Display response message to user
    showResponseMessage(result);
  } catch (error: unknown) {
    console.error("Error sending POST request:", error);
    showResponseMessage({ message: "Server error!" });
  } finally {
    // Always unlock submission and restore button state
    editSubmissionLock = false;
    if (submitButtonElement) {
      Object.assign(submitButtonElement, {
        disabled: false,
        innerHTML: `
          <span class="material-symbols-rounded">webhook</span>
          REQUEST CHANGES
        `,
      });
    }
  }
}

// --- Handles user creation
async function handleUserCreation(username: string, hashedPassword: string): Promise<void> {
  const response: Response = await fetch("https://tteworker.vcentok.workers.dev/createuser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password: hashedPassword,
    }),
  });
  const result: { message: string } = await response.json();

  // Show response message
  showResponseMessage(result);
}

// --- Displays response message to user based on API result
function showResponseMessage(result: { message: string; url?: string; prNumber?: number }): void {
  // Find existing response container or create new one
  let responseContainerElement: HTMLElement | null =
    document.querySelector(".edit-content__response");

  if (!responseContainerElement) {
    responseContainerElement = document.createElement("div");
    responseContainerElement.className = "edit-content__response";

    // Insert after the actions section
    const actionsSectionElement: HTMLElement | null =
      document.querySelector(".edit-content__actions");
    actionsSectionElement?.parentNode?.insertBefore(
      responseContainerElement,
      actionsSectionElement.nextSibling,
    );
  }

  // Clear previous content
  responseContainerElement.innerHTML = "";

  const { messageHtml, messageClass }: { messageHtml: string; messageClass: string } =
    determineResponseContent(result);

  responseContainerElement.className = `edit-content__response ${messageClass}`;
  responseContainerElement.innerHTML = messageHtml;
}

// --- Determines the appropriate content and styling for response message
function determineResponseContent(result: { message: string; url?: string; prNumber?: number }): {
  messageHtml: string;
  messageClass: string;
} {
  const { message, url, prNumber }: { message: string; url?: string; prNumber?: number } = result;

  // Handle user creation responses
  if (message === "Username already exists") {
    return {
      messageHtml: "Username already exists.",
      messageClass: "error",
    };
  }

  if (message === "User created successfully") {
    return {
      messageHtml: "User created successfully.",
      messageClass: "success",
    };
  }

  if (message === "Error creating user") {
    return {
      messageHtml: "Error creating user.",
      messageClass: "error",
    };
  }

  // Handle pull request responses
  if (message === "Invalid username or password") {
    return {
      messageHtml: "Invalid username or password.",
      messageClass: "error",
    };
  }

  if (message === "Pull Request created successfully!" && prNumber && url) {
    return {
      messageHtml: `Contribution received! Follow it on <a href="${url}" target="_blank" rel="noopener noreferrer">PR${prNumber}</a>.`,
      messageClass: "success",
    };
  }

  return {
    messageHtml: "Server error!",
    messageClass: "error",
  };
}

// Clear response messages
function clearResponseMessage(): void {
  const responseContainer: HTMLElement | null = document.querySelector(".edit-content__response");
  if (responseContainer) {
    responseContainer.innerHTML = "";
    responseContainer.className = "edit-content__response";
  }
}

async function sha256(message: string): Promise<string> {
  // encode as UTF-8
  const msgBuffer: Uint8Array<ArrayBuffer> = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert ArrayBuffer to Array of bytes
  const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  return hashArray.map((b: number) => b.toString(16).padStart(2, "0")).join("");
}

async function editRefreshAction(): Promise<void> {
  const textContent: string = (await cachedCompilerInstance?.getEditorContent()) || "";
  clearResponseMessage();
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
