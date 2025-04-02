// ---------
// main.js is the entry point for our code.
//   inits all other modules
//   controls parsing of markdown files
//   controls page flow
//   handles load order
// Additionally, the current available game list is kept here in the fileList.
//   update fileList to add a new tech page!

import { Parser } from "./parser.js";
import { Search } from "./search.js";
import { TOC } from "./toc.js";
import { Headings } from "./headings.js";
import { Directives } from "./directives.js";
import { Helper } from "./helper.js";

// Every page we need to load
var parsedDocuments = new Map();
// Add new documents here!!
var fileList = [
  { document: "./README", section: "README", dim: "N/A", ref: "readme" },
  {
    document: "./STYLING",
    section: "Doucment Syling",
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
    section: "Tales of Destiny Characters",
    dim: "2D",
    ref: "todps2-c",
  },
  {
    document: "TODPS2-B",
    section: "Tales of Destiny Bosses",
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
var searchObj = null;
var tocObj = null;
var helperObj = new Helper(addPageChangeEvent, fileList);
var headingsObj = new Headings(helperObj, fileList);
var directivesObj = new Directives(helperObj);
var parserObj = new Parser();

// Create an array of promises for parsing each document
var parsePromises = fileList.map((item) => {
  if (item.document.includes("./")) {
    return parserObj.parseGFM(item.document).then((page) => {
      parsedDocuments.set(item, page);
    });
  } else if (item.document == "HOME") {
    return parserObj.asyncRead("./home.html").then((page) => {
      parsedDocuments.set(item, page);
    });
  } else {
    return parserObj
      .parseGFM("./tech/" + item.document.toLowerCase())
      .then((page) => {
        parsedDocuments.set(item, page);
      });
  }
});

var currentDocument = null;
var katexLoaded = false;

// Check if DOM elements are ready, if yes, we can start running stuff
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", pageInit);
} else {
  pageInit();
}
// --- Search and click redirections
function pageInit() {
  // Add redirect links for title and footer
  document
    .querySelectorAll("div#nav-bar__title, p.footer-container__help--links")
    .forEach((item) => {
      addPageChangeEvent(item);
    });

  // Fill nav-bar search and game results
  //   initSearchIcons() also already adds page change events to search results
  // Wait for all parsing promises to complete
  Promise.all(parsePromises).then(() => {
    searchObj = new Search(parsedDocuments, addPageChangeEvent);
    searchObj.initSearchIcons();
    searchObj.initOnboardingIcon();

    tocObj = new TOC(helperObj);

    helperObj.scrollInit();
    helperObj.logoInit();

    // Setup History handlers
    // Handle forward/back buttons
    window.addEventListener("popstate", (event) => {
      // If a state has been provided, we have a "simulated" page
      // and we update the current page.
      event.preventDefault();
      event.stopPropagation();
      if (event.state) {
        // Simulate the loading of the previous page
        changeEventObj({ ...event.state, pushState: false });
      } else {
        // No state -- page is home
        changeEventObj({ document: "HOME", section: "HOME", pushState: false });
      }
    });
    // Handle base page URL (first view) -- in case the user wants to load a certain page from the get-go
    let pathname = document.location.pathname;
    // remove leading /
    pathname = pathname.substring(1);
    let ref = pathname;
    // check if pathname has a redirect string (a /) and get its target
    let splitPath = pathname.split("/");
    let redirect = "";
    if (splitPath.length > 1) {
      redirect = splitPath[1];
      ref = splitPath[0];
    }

    // Iterate over fileList and replace the initial history
    for (let obj of fileList) {
      if (obj.ref == ref) {
        if (redirect != "") {
          changeEventObj({
            ...obj,
            redirect: "#" + redirect,
            pushState: false,
          });
          window.history.replaceState(
            JSON.parse(JSON.stringify({ ...obj, redirect: "#" + redirect })),
            obj.section,
            pathname,
          );
        } else {
          changeEventObj({ ...obj, pushState: false });
          window.history.replaceState(
            JSON.parse(JSON.stringify(obj)),
            obj.section,
            pathname,
          );
        }
        break;
      }
    }
  });
}

function prepHome() {
  // function to add functionality to the home page -- called everytime it is loaded
  document
    .querySelectorAll("img#title-text__img, span.content__redirect")
    .forEach((item) => {
      addPageChangeEvent(item);
    });
  for (let elem of document.querySelectorAll(
    ".content__home__showcase-item--play",
  )) {
    elem.addEventListener("click", function () {
      if (event.currentTarget.innerHTML == "play_circle") {
        event.currentTarget.innerHTML = "stop_circle";
        // create child in parent element (so sibling of target), that is a video source
        let video = document.createElement("video");
        video.src = event.currentTarget.dataset.video;
        video.className = "content__home__showcase-item--video";
        video.autoplay = true;
        video.controls = false;
        video.muted = true;
        video.loop = true;
        event.currentTarget.parentElement.appendChild(video);
        setTimeout(
          (video) => {
            video.style.opacity = 1;
          },
          50,
          video,
        );
      } else {
        // try and find the video element, set opacity to 0, and remove it after 2 seconds
        let video = event.currentTarget.parentElement.querySelector(
          ".content__home__showcase-item--video",
        );
        if (video != null) {
          video.style.opacity = 0;
          setTimeout(
            ([element, video]) => {
              video.remove();
              element.innerHTML = "play_circle";
            },
            500,
            [event.currentTarget, video],
          );
        } else {
          event.currentTarget.innerHTML = "play_circle";
        }
      }
    });
  }
}

// --- Function for click events on redirects
export function addPageChangeEvent(item) {
  // Remove the previous event if one exist. This is a bandaid fix fo the fillSearch function.
  let inputField = document.querySelector("#nav-bar__search--input");
  if (inputField != null) {
    inputField.blur();
  }
  item.removeEventListener("click", changeEvent);
  item.addEventListener("click", changeEvent);
}

// Prevent redirections and propagations and calls the change event based on the dataset of the target
function changeEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  // remove focus from search bar
  let inputField = document.querySelector("#nav-bar__search--input");
  if (inputField != null) {
    document.activeElement.blur();
    inputField.blur();
  }

  changeEventObj(event.currentTarget.dataset);
}

// Function to make sure Katex is loaded before changing the page, then calls changeDocument
//   the only data that is downloaded as the page is being loaded are images, videos, and Katex
// This is also the function called by the history API -- this way we don't need an event like changeEvent()
function changeEventObj(dataset) {
  var parsedKatex = null;

  if (!katexLoaded) {
    parsedKatex = new Promise((resolve) => {
      // Create a script element for KaTeX JavaScript
      import("./katex.min.js").then((module) => {
        directivesObj.setKatex(module.default);
        // Create a link element for KaTeX CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.crossOrigin = "anonymous";
        link.href = "styles/katex.min.css"; // URL to the KaTeX CSS
        link.onload = () => {
          resolve("KaTeX JS and CSS loaded");
        };

        // Append the link to the head
        document.head.appendChild(link);
      });
    });

    parsedKatex.then(() => {
      katexLoaded = true;
      changeDocument(dataset);
    });
  } else {
    changeDocument(dataset);
  }
}

// Function to handle changes to content
function changeDocument(dataset) {
  // Get the content element to change the document presented on the page
  let contentText = document.getElementById("content");

  // Clear active search result
  searchObj.clearFunction();
  helperObj.addLogoVelocity();

  if (dataset.document == "HOME") {
    // Redirect to home page
    toHome(contentText, dataset);
    contentText.style.minHeight = "600px";
  } else {
    if (dataset.document.includes("./")) {
      // Redirect to pages like the readme, document styling...
      contentText.style.minHeight = "600px";
      toPage(contentText, dataset);
    } else {
      //Event is a tech document, set the section as the game name and update the content
      contentText.style.minHeight = "100vh";
      toTech(contentText, dataset);
    }
  }
}

// --- Load Home Page
function toHome(contentText, dataset) {
  let pastDocument = currentDocument;
  currentDocument = dataset.document;
  if (currentDocument != pastDocument) {
    tocObj.clearHeadings();
    helperObj.updateStatus("HOME", "HOME", false);
    tocObj.clearSectionTOC();
    // Removes #content__tocicon if it exists
    // load content from home.html fil and apply to contentText
    let parsedPage = null;

    // Iterate over the entries in parsedDocuments to find the matching document
    for (const [key, value] of parsedDocuments.entries()) {
      if (key.document === "HOME") {
        parsedPage = value;
        break;
      }
    }

    contentText.innerHTML = parsedPage;
    // Set options for SEO
    document.title = "Tales Tech Encyclopedia";
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        "Tales Tech Encyclopedia (TTE), is a project that aims to document techniques and mechanics on the games of the 'Tales of Series'.",
      );

    // Set history if this is not a pop (user did a back or forward on the page)
    if (dataset.pushState == null) {
      window.history.pushState(
        JSON.parse(JSON.stringify(dataset)),
        window.title,
        "/",
      );
    }
    prepHome();
    searchObj.initOnboardingIcon();
  }
}

// --- Load Generic Page
function toPage(contentText, dataset) {
  let pastDocument = currentDocument;
  currentDocument = dataset.document;
  if (currentDocument != pastDocument) {
    tocObj.clearHeadings();
    helperObj.updateStatus(dataset.document, dataset.section, false);
    tocObj.clearSectionTOC();
    const documentKey = dataset.document;
    let parsedPage = null;

    // Iterate over the entries in parsedDocuments to find the matching document
    for (const [key, value] of parsedDocuments.entries()) {
      if (key.document === documentKey) {
        parsedPage = value;
        break;
      }
    }

    contentText.innerHTML = parsedPage;
    // Update page & Clear active search results
    updatePage();
    // Set options for SEO
    document.title = "Tales Tech Encyclopedia";
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        "Tales Tech Encyclopedia (TTE), is a project that aims to document techniques and mechanics on the games of the 'Tales of Series'.",
      );
    const url = "/" + currentDocument.toLowerCase();
    // Set history if this is not a pop (user did a back or forward on the page)
    if (dataset.pushState == null) {
      window.history.pushState(
        JSON.parse(JSON.stringify(dataset)),
        window.title,
        url,
      );
    }
    document.querySelector("#nav-bar").scrollIntoView({
      behavior: "smooth",
    });
  }
}

// --- Load Tech Page
function toTech(contentText, dataset) {
  helperObj.updateStatus(dataset.document, dataset.section, true);
  // Check if the page to load is the same one
  let pastDocument = currentDocument;
  currentDocument = dataset.document;
  if (currentDocument == pastDocument) {
    // If yes --> Just redirect
    if (dataset.redirect != null) {
      //Event has a redirect location, collapse the headings if needed
      searchObj.revealID(dataset.redirect.substring(1));
      document.querySelector(dataset.redirect).scrollIntoView({
        behavior: "smooth",
      });
    } else {
      //No redirect location, scroll to top
      document.querySelector("#nav-bar").scrollIntoView({
        behavior: "smooth",
      });
    }
  } else {
    tocObj.clearHeadings();
    tocObj.clearSectionTOC();
    const documentKey = dataset.document;
    let parsedPage = null;

    // Iterate over the entries in parsedDocuments to find the matching document
    for (const [key, value] of parsedDocuments.entries()) {
      if (key.document === documentKey) {
        parsedPage = value;
        break;
      }
    }
    contentText.style.visibility = "hidden";
    contentText.innerHTML = parsedPage;
    // Set options for SEO
    document.title = "TTE - " + dataset.section;
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        "Tales Tech Encyclopedia (TTE) article on " + dataset.section + ".",
      );
    // URL is either currentDocument (e.g., /tov) or that + redirect (e.g., /tov/test-test)
    const url =
      "/" +
      currentDocument.toLowerCase() +
      (dataset.redirect && dataset.redirect !== "NONE"
        ? "/" + dataset.redirect.substring(1)
        : "");
    // Set history if this is not a pop (user did a back or forward on the page)
    if (dataset.pushState == null) {
      window.history.pushState(
        JSON.parse(JSON.stringify(dataset)),
        window.title,
        url,
      );
    }
    headingsObj.collapseHeadings(contentText);
    //Update page & Clear search results
    compileH2s();
    //updatePage(); compileH2s has an updatePage() call already.
    if (dataset.redirect != null) {
      if (dataset.redirect != "NONE") {
        //Event has a redirect location, collapse the headings if needed
        searchObj.revealID(dataset.redirect.substring(1));
        // Set timeout to give time to page to update (it also looks nice)
        setTimeout(() => {
          document.querySelector(dataset.redirect).scrollIntoView({
            behavior: "smooth",
          });
        }, 250);
      }
    } else {
      //No redirect location, scroll to top
      document.querySelector("#nav-bar").scrollIntoView({
        behavior: "smooth",
      });
    }
  }
}

// --- Generic actions every time the page is updated
export function updatePage() {
  // Create TOC
  tocObj.createTOC(currentDocument);
  // Add redirect to TOC
  document.querySelectorAll(".content__toc--search").forEach((item) => {
    addPageChangeEvent(item);
  });
  // Treat custom directives
  directivesObj.compileDirectives();
  // Copy headings URL on click
  headingsObj.shareHeadings();
}

// Adds functionality to the h2 section divider and opens the first one
function compileH2s() {
  // Add events to selector tab
  document
    .querySelectorAll(".content__selectorbox--item")
    .forEach((selectorBox) => {
      selectorBox.style.setProperty(
        "--highlight-color",
        selectorBox.dataset.highlight,
      );
      selectorBox.addEventListener("click", (event) => {
        // iterate every selectorbox--item
        // -- remove selected status from other elements
        document
          .querySelectorAll(".content__selectorbox--item")
          .forEach((selectorBox) => {
            selectorBox.className = "content__selectorbox--item";
          });
        // add selected status to the clicked selectorbox--item
        event.currentTarget.className = "content__selectorbox--item selected";
        // replace content_currenth2 with data from h2Collectio[x][3]
        // select the h2Collection based on the current selectorBox.dataset.open
        let currentCollection = headingsObj
          .returnH2Collection()
          .filter((h2) => h2[0] == event.currentTarget.dataset.open);
        document.getElementById("content__currenth2").innerHTML =
          currentCollection[0][2];

        // Adds click events for the buttons
        document.querySelectorAll(".content__collapse").forEach((button) => {
          button.addEventListener("click", headingsObj.collapseHeadingStyle);
        });
        updatePage();
        tocObj.highlightTOC();
      });
    });

  // Opens first H2
  document.querySelectorAll(".content__selectorbox--item")[0].click();
}
