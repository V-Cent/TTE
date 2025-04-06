// ---------
// main.js is the entry point for our code.
//   inits all other modules
//   controls parsing of markdown files
//   controls page flow
//   handles load order
// Additionally, the current available game list is kept here in the fileList.
//   update fileList to add a new tech page!
// TODO: this will be done automatically in the future and search results will be cached

import { Parser } from "./parser.ts";
import { Search } from "./search.ts";
import { TOC } from "./toc.ts";
import { Headings } from "./headings.ts";
import { Directives } from "./directives.ts";
import { Helper, FileEntry, h2Data } from "./helper.ts";

// Every page we need to load
const parsedDocuments: Map<FileEntry, string> = new Map();

// Add new documents here!!
const fileList: FileEntry[] = [
  { document: "./README", section: "README", dim: "N/A", ref: "readme" },
  {
    document: "./STYLING",
    section: "Document Styling",
    dim: "N/A",
    ref: "styling",
  },
  {
    document: "./CONTRIBUTING",
    section: "How to Contribute",
    dim: "N/A",
    ref: "contributing",
  },
  { document: "TODPS2", section: "Tales of Destiny", dim: "2D", ref: "todps2" },
  {
    document: "TODPS2-C",
    section: "Tales of Destiny",
    dim: "2D",
    ref: "todps2-c",
  },
  {
    document: "TODPS2-B",
    section: "Tales of Destiny",
    dim: "2D",
    ref: "todps2-b",
  },
  { document: "TOL", section: "Tales of Legendia", dim: "2D", ref: "tol" },
  { document: "TOA", section: "Tales of Arise", dim: "3D", ref: "toa" },
  { document: "TOV", section: "Tales of Vesperia", dim: "3D", ref: "tov" },
  { document: "TOTA", section: "Tales of the Abyss", dim: "3D", ref: "tota" },
  { document: "TOX2", section: "Tales of Xillia 2", dim: "3D", ref: "tox2" },
  { document: "TOZ", section: "Tales of Zestiria", dim: "3D", ref: "toz" },
  { document: "HOME", section: "HOME", dim: "N/A", ref: "" },
];

// --- Module Objects
let searchObj: Search | null = null;
let tocObj: TOC | null = null;
const helperObj: Helper = new Helper(addPageChangeEvent, fileList);
const headingsObj: Headings = new Headings(helperObj);
const directivesObj: Directives = new Directives(helperObj);
const parserObj: Parser = new Parser();

// Create an array of promises for parsing each document
const parsePromises: Promise<void>[] = fileList.map(async (item) => {
  if (item.document.includes("./")) {
    const page: string = await parserObj.parseGFM(item.document);
    parsedDocuments.set(item, page);
  } else if (item.document === "HOME") {
    const page_1: string = await parserObj.asyncRead("./home.html");
    parsedDocuments.set(item, page_1);
  } else {
    const page_2: string = await parserObj.parseGFM(`./tech/${item.document.toLowerCase()}`);
    parsedDocuments.set(item, page_2);
  }
});

// currentDocument is the ID ('document' token from FileEntry) for the current page
let currentDocument: string = "";
// Locks certain functionalities if katex is not loaded yet
let katexLoaded: boolean = false;

// Check if DOM elements are ready, if yes, we can start running stuff
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", pageInit);
} else {
  pageInit();
}

// --- Search and click redirections
function pageInit(): void {
  // Add redirect links for title and footer
  document
    .querySelectorAll<HTMLElement>(
      "div#nav-bar__title, p.footer-container__help--links, img#title-text__img",
    )
    .forEach((item: HTMLElement) => {
      addPageChangeEvent(item);
    });

  // Fill nav-bar search and game results
  // `initSearchIcons()` also already adds page change events to search results
  // Wait for all parsing promises to complete
  Promise.all(parsePromises).then(() => {
    searchObj = new Search(parsedDocuments, addPageChangeEvent, helperObj);
    searchObj.initSearchIcons();
    searchObj.initOnboardingIcon();

    tocObj = new TOC(helperObj);

    helperObj.scrollInit();
    helperObj.logoInit();

    // Setup History handlers
    // Handle forward/back buttons
    window.addEventListener("popstate", (event: PopStateEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.state) {
        // Simulate the loading of the previous page
        changeEventObj({
          ...event.state,
          pushState: false,
        } as unknown as DOMStringMap);
      } else {
        // No state -- page is home
        changeEventObj({
          document: "HOME",
          section: "HOME",
          pushState: false,
        } as unknown as DOMStringMap);
      }
    });

    // Handle base page URL (first view) -- in case the user wants to load a certain page from the get-go
    const pathname: string = document.location.pathname.substring(1); // Remove leading "/"
    let ref: string = pathname;
    const splitPath: string[] = pathname.split("/");
    let redirect: string = "";

    if (splitPath.length > 1) {
      redirect = splitPath[1];
      ref = splitPath[0];
    }

    // Iterate over fileList and replace the initial history
    for (const obj of fileList) {
      if (obj.ref === ref) {
        if (redirect === "") {
          changeEventObj({
            ...obj,
            pushState: false,
          } as unknown as DOMStringMap);
          window.history.replaceState({ ...obj }, obj.section, pathname);
        } else {
          changeEventObj({
            ...obj,
            redirect: `#${redirect}`,
            pushState: false,
          } as unknown as DOMStringMap);
          window.history.replaceState({ ...obj, redirect: `#${redirect}` }, obj.section, pathname);
        }
        break;
      }
    }
  });
}

// --- Page flow:
//     elements have the addPageChangeEvent on them, which when called will either load a
//     tech page, the home page, or a standalone page (e.g., readme)
//
//     for tech pages the flow is changeEvent -> changeEventObj -> changeDocument -> toTech -> compileH2s -> updatePage
//     for the homepage the flow is ... -> changeDocument -> toHome -> prepHome
//     for standalone pages the flow is ... -> changeDocument -> toPage -> updatePage
//
//     changeEvent and changeEventObj are split because you can also call a page without an event, simply creating a pseudo-dataset object.
//     this is currently done for routing.

// --- Function for click events on redirects
export function addPageChangeEvent(item: HTMLElement): void {
  // Remove the previous event if one exists. This is a bandaid fix for the fillSearch function.
  const inputField: HTMLInputElement | null = document.querySelector("#nav-bar__search--input");
  if (inputField !== null) {
    inputField.blur();
  }

  item.removeEventListener("click", changeEvent);
  item.addEventListener("click", changeEvent);
}

// --- Prevent redirections and propagations and calls the change event based on the dataset of the target
function changeEvent(event: Event): void {
  event.preventDefault();
  event.stopPropagation();

  // Remove focus from the search bar
  const inputField: HTMLInputElement | null = document.querySelector("#nav-bar__search--input");
  if (inputField !== null) {
    (document.activeElement as HTMLElement)?.blur();
    inputField.blur();
  }

  // Call the changeEventObj function with the dataset of the current target
  const target: EventTarget | null = event.currentTarget;
  if (!target || !(target instanceof HTMLElement)) {
    return;
  }
  changeEventObj(target.dataset);
}

// --- Function to make sure Katex is loaded before changing the page, then calls changeDocument
//      the only data that is downloaded as the page is being loaded are images, videos, and Katex
//      This is also the function called by the history API -- this way we don't need an event like changeEvent()
function changeEventObj(dataset: DOMStringMap): void {
  let parsedKatex: Promise<string> | null = null;

  if (katexLoaded) {
    changeDocument(dataset);
  } else {
    parsedKatex = new Promise((resolve) => {
      // Dynamically import the KaTeX JavaScript module
      import("./katex.min.js").then(
        (module: {
          default: {
            renderToString: (input: string, options?: Record<string, unknown>) => string;
          };
        }) => {
          directivesObj.setKatex(module.default);

          // Create a link element for KaTeX CSS
          const link: HTMLLinkElement = document.createElement("link");
          link.rel = "stylesheet";
          link.crossOrigin = "anonymous";
          link.href = "styles/katex.min.css"; // URL to the KaTeX CSS
          link.onload = () => {
            resolve("KaTeX JS and CSS loaded");
          };

          // Append the link to the document head
          document.head.appendChild(link);
        },
      );
    });

    parsedKatex.then(() => {
      katexLoaded = true;
      changeDocument(dataset);
    });
  }
}

// --- Function to handle changes to content
function changeDocument(dataset: DOMStringMap): void {
  // Get the content element to change the document presented on the page
  const contentText: HTMLElement | null = document.getElementById("content");

  if (!contentText) {
    return;
  }

  // Clear active search result
  searchObj?.clearFunction();
  helperObj.addLogoVelocity();

  if (dataset.document === "HOME") {
    // Redirect to home page
    toHome(contentText, dataset);
    contentText.style.minHeight = "600px";
  } else if (dataset.document?.includes("./")) {
    // Redirect to pages like the readme, document styling...
    contentText.style.minHeight = "600px";
    toPage(contentText, dataset);
  } else {
    // Event is a tech document, set the section as the game name and update the content
    contentText.style.minHeight = "100vh";
    toTech(contentText, dataset);
  }
}

// --- Load Home Page
function toHome(contentText: HTMLElement, dataset: DOMStringMap): void {
  const pastDocument: string = currentDocument;
  currentDocument = dataset.document || "";

  if (currentDocument === pastDocument) {
    return;
  }
  tocObj?.clearHeadings();
  helperObj.updateStatus("HOME", "HOME", false);
  tocObj?.clearSectionTOC();

  // Load content from `home.html` and apply it to `contentText`
  let parsedPage: string | null = null;

  // Iterate over the entries in `parsedDocuments` to find the matching document
  for (const [key, value] of parsedDocuments.entries()) {
    if (key.document === "HOME") {
      parsedPage = value;
      break;
    }
  }

  if (parsedPage) {
    contentText.innerHTML = parsedPage;
  }

  // Set options for SEO
  document.title = "Tales Tech Encyclopaedia";
  const metaDescription: HTMLMetaElement | null = document.querySelector(
    'meta[name="description"]',
  );
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      "Tales Tech Encyclopaedia (TTE), is a project that aims to document techniques and mechanics on the games of the 'Tales of Series'.",
    );
  }

  // Set history if this is not a pop (user did a back or forward on the page)
  if (dataset.pushState == null) {
    window.history.pushState(JSON.parse(JSON.stringify(dataset)), document.title, "/");
  }

  prepHome();
  searchObj?.initOnboardingIcon();
}

// --- Add functionality to the home page
function prepHome(): void {
  // Add page change events to all redirect elements
  document.querySelectorAll<HTMLElement>("span.content__redirect").forEach((item) => {
    addPageChangeEvent(item);
  });

  // Add functionality to showcase items
  document.querySelectorAll<HTMLElement>(".content__home__showcase-item--play").forEach((elem) => {
    elem.addEventListener("click", (event: Event) => {
      const target: EventTarget | null = event.currentTarget;
      if (!target || !(target instanceof HTMLElement)) {
        return;
      }

      if (target.innerHTML === "play_circle") {
        target.innerHTML = "stop_circle";

        // Create a video element as a sibling of the target
        const video: HTMLVideoElement = document.createElement("video");
        video.src = target.dataset.video || "";
        video.className = "content__home__showcase-item--video";
        video.autoplay = true;
        video.controls = false;
        video.muted = true;
        video.loop = true;

        target.parentElement?.appendChild(video);

        setTimeout(() => {
          video.style.opacity = "1";
        }, 50);
        return;
      }
      // Find the video element, fade it out, and remove it
      const video: HTMLVideoElement | null | undefined =
        target.parentElement?.querySelector<HTMLVideoElement>(
          ".content__home__showcase-item--video",
        );

      if (video) {
        video.style.opacity = "0";
        setTimeout(() => {
          video.remove();
          target.innerHTML = "play_circle";
        }, 500);
      } else {
        target.innerHTML = "play_circle";
      }
    });
  });
}

// --- Load Generic Page
function toPage(contentText: HTMLElement, dataset: DOMStringMap): void {
  const pastDocument: string = currentDocument;
  currentDocument = dataset.document || "";

  if (currentDocument === pastDocument) {
    return;
  }
  tocObj?.clearHeadings();
  helperObj.updateStatus(dataset.document || "", dataset.section || "", false);
  tocObj?.clearSectionTOC();

  const documentKey: string | undefined = dataset.document;
  let parsedPage: string | null = null;

  // Iterate over the entries in `parsedDocuments` to find the matching document
  for (const [key, value] of parsedDocuments.entries()) {
    if (key.document === documentKey) {
      parsedPage = value;
      break;
    }
  }

  if (parsedPage) {
    contentText.innerHTML = parsedPage;
  }

  // Update page & Clear active search results
  updatePage();

  // Set options for SEO
  document.title = "Tales Tech Encyclopaedia";
  const metaDescription: HTMLMetaElement | null = document.querySelector(
    'meta[name="description"]',
  );
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      "Tales Tech Encyclopaedia (TTE), is a project that aims to document techniques and mechanics on the games of the 'Tales of Series'.",
    );
  }

  const url: string = `/${currentDocument?.toLowerCase() || ""}`;

  // Set history if this is not a pop (user did a back or forward on the page)
  if (dataset.pushState == null) {
    window.history.pushState(JSON.parse(JSON.stringify(dataset)), document.title, url);
  }

  const navBar: HTMLElement | null = document.querySelector("#nav-bar");
  navBar?.scrollIntoView({
    behavior: "smooth",
  });
}

// --- Load Tech Page
function toTech(contentText: HTMLElement, dataset: DOMStringMap): void {
  helperObj.updateStatus(dataset.document || "", dataset.section || "", true);

  // Check if the page to load is the same one
  const pastDocument: string = currentDocument;
  currentDocument = dataset.document || "";

  if (currentDocument === pastDocument) {
    // If yes --> Just redirect
    if (dataset.redirect) {
      // Event has a redirect location, collapse the headings if needed
      searchObj?.revealID(dataset.redirect.substring(1));
      if (dataset.redirect) {
        document.querySelector(dataset.redirect)?.scrollIntoView({
          behavior: "smooth",
        });
      }
    } else {
      // No redirect location, scroll to top
      document.querySelector("#nav-bar")?.scrollIntoView({
        behavior: "smooth",
      });
    }
    return;
  }

  tocObj?.clearHeadings();
  tocObj?.clearSectionTOC();

  const documentKey: string | undefined = dataset.document;
  let parsedPage: string | null = null;

  // Iterate over the entries in `parsedDocuments` to find the matching document
  for (const [key, value] of parsedDocuments.entries()) {
    if (key.document === documentKey) {
      parsedPage = value;
      break;
    }
  }

  contentText.style.visibility = "hidden";
  if (parsedPage) {
    contentText.innerHTML = parsedPage;
  }

  // Set options for SEO
  document.title = `TTE - ${dataset.section || ""}`;
  const metaDescription: HTMLMetaElement | null = document.querySelector(
    'meta[name="description"]',
  );
  if (metaDescription) {
    metaDescription.setAttribute(
      "content",
      `Tales Tech Encyclopaedia (TTE) article on ${dataset.section || ""}.`,
    );
  }

  // URL is either currentDocument (e.g., /tov) or that + redirect (e.g., /tov/test-test)
  const url: string =
    `/${currentDocument?.toLowerCase() || ""}` +
    (dataset.redirect && dataset.redirect !== "NONE" ? `/${dataset.redirect.substring(1)}` : "");

  // Set history if this is not a pop (user did a back or forward on the page)
  if (dataset.pushState == null) {
    window.history.pushState(JSON.parse(JSON.stringify(dataset)), document.title, url);
  }

  headingsObj.collapseHeadings(contentText);

  // Update page & Clear search results
  compileH2s();
  // `compileH2s` already calls `updatePage`

  if (dataset.redirect && dataset.redirect !== "NONE") {
    // Event has a redirect location, collapse the headings if needed
    searchObj?.revealID(dataset.redirect.substring(1));
    // Set timeout to give time for the page to update (it also looks nice)
    setTimeout(() => {
      if (dataset.redirect) {
        document.querySelector(dataset.redirect)?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 250);
  } else {
    // No redirect location, scroll to top
    document.querySelector("#nav-bar")?.scrollIntoView({
      behavior: "smooth",
    });
  }
}

// --- Generic actions every time the page is updated
export function updatePage(): void {
  // Treat custom directives
  directivesObj.compileDirectives();

  // Create TOC
  tocObj?.createTOC(currentDocument);

  // Add redirect to TOC
  document.querySelectorAll<HTMLElement>(".content__toc--search").forEach((item: HTMLElement) => {
    addPageChangeEvent(item);
  });

  // Copy headings URL on click
  headingsObj.shareHeadings();
}

// --- Adds functionality to the h2 section divider and opens the first one
function compileH2s(): void {
  // Add events to selector tab
  document
    .querySelectorAll<HTMLElement>(".content__selectorbox--item")
    .forEach((selectorBox: HTMLElement) => {
      // Set the highlight color from the dataset
      selectorBox.style.setProperty("--highlight-color", selectorBox.dataset.highlight || "");

      selectorBox.addEventListener("click", (event: Event) => {
        const target: EventTarget | null = event.currentTarget;
        if (!target || !(target instanceof HTMLElement)) {
          return;
        }

        // Iterate over every selectorbox--item and remove the selected status from other elements
        document
          .querySelectorAll<HTMLElement>(".content__selectorbox--item")
          .forEach((item: HTMLElement) => {
            item.className = "content__selectorbox--item";
          });

        // Add selected status to the clicked selectorbox--item
        target.className = "content__selectorbox--item selected";

        // Replace content_currenth2 with data from h2Collection[x][3]
        // Select the h2Collection based on the current selectorBox.dataset.open
        const currentCollection: h2Data[] = helperObj.h2Collection.filter(
          (h2: h2Data) => h2.id === target.dataset.open,
        );

        const contentCurrentH2: HTMLElement | null = document.getElementById("content__currenth2");
        if (contentCurrentH2 && currentCollection.length > 0) {
          const content: string = currentCollection[0].content;
          contentCurrentH2.innerHTML = content;
        }

        // Add click events for the buttons
        document
          .querySelectorAll<HTMLElement>(".content__collapse")
          .forEach((button: HTMLElement) => {
            button.addEventListener("click", headingsObj.collapseHeadingStyle);
          });

        updatePage();
        tocObj?.highlightTOC();
      });
    });

  // Opens the first H2
  const firstSelectorBox: HTMLElement | undefined = document.querySelectorAll<HTMLElement>(
    ".content__selectorbox--item",
  )[0];
  firstSelectorBox?.click();
}
