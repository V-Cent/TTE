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
let fileList = [
  { document: "./README", section: "README", dim: "N/A" },
  { document: "./STYLING", section: "Doucment Syling", dim: "N/A" },
  { document: "./CONTRIBUTING", section: "How to Contribute", dim: "N/A" },
  { document: "TODPS2", section: "Tales of Destiny", dim: "2D" },
  { document: "TOL", section: "Tales of Legendia", dim: "2D" },
  { document: "TOA", section: "Tales of Arise", dim: "3D" },
  { document: "TOV", section: "Tales of Vesperia", dim: "3D" },
  { document: "TOTA", section: "Tales of the Abyss", dim: "3D" },
  { document: "TOX2", section: "Tales of Xillia 2", dim: "3D" },
  { document: "TOZ", section: "Tales of Zestiria", dim: "3D" }
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
  } else {
    return parserObj.parseGFM("./tech/" + item.document.toLowerCase()).then((page) => {
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
    .querySelectorAll(
      "div#nav-bar__title, p.footer-container__help--links"
    )
    .forEach((item) => {
      addPageChangeEvent(item);
    });

  // Fill nav-bar search and game results
  //   initSearchIcons() also already adds page change events to search results
  // Wait for all parsing promises to complete
  Promise.all(parsePromises).then(() => {
    searchObj = new Search(parsedDocuments, addPageChangeEvent);
    searchObj.initSearchIcons();

    tocObj = new TOC(helperObj);

    helperObj.scrollInit();
    helperObj.logoInit();
  });
}

// --- Function for click events on redirects
export function addPageChangeEvent(item) {
  // Remove the previous event if one exist. This is a bandaid fix fo the fillSearch function.
  item.removeEventListener("click", changeEvent);
  item.addEventListener("click", changeEvent);
}

// Function to make sure Katex is loaded before changing the page, then calls changeDocument
//   the only data that is downloaded as the page is being loaded are images, videos, and Katex
function changeEvent(event){

  var parsedKatex = null;

  if (!katexLoaded) {
    parsedKatex = new Promise((resolve) => {
      // Create a script element for KaTeX JavaScript
      import("./katex.min.js").then((module) => {
        directivesObj.setKatex(module.default);
        // Create a link element for KaTeX CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.crossOrigin = 'anonymous';
        link.href = 'styles/katex.min.css'; // URL to the KaTeX CSS
        link.onload = () => {
          resolve('KaTeX JS and CSS loaded');
        };

        // Append the link to the head
        document.head.appendChild(link);
      });
    });

    const currentTarget = event.currentTarget;

    parsedKatex.then(() => {
      katexLoaded = true;
      changeDocument(currentTarget);
    });

  } else {
    changeDocument(event.currentTarget);
  }
}

// Function to handle changes to content
function changeDocument(eventTarget) {
  // Get the section and content elements to change the document presented on the page
  let sectionText = document.getElementById("section-container__text");
  let contentText = document.getElementById("content");

  // Clear active search result
  searchObj.clearFunction();
  helperObj.addLogoVelocity();

  if (eventTarget.dataset.document == "HOME") {
    // Redirect to home page
    toHome(sectionText, contentText, eventTarget);
  } else {
    if (eventTarget.dataset.document.includes("./")) {
      // Redirect to pages like the readme, document styling...
      toPage(sectionText, contentText, eventTarget);
    } else {
      //Event is a tech document, set the section as the game name and update the content
      toTech(sectionText, contentText, eventTarget);
    }
  }
}

// --- Load Home Page
function toHome(sectionText, contentText, eventTarget) {
  currentDocument = eventTarget.dataset.document;
  tocObj.clearHeadings();
  helperObj.updateStatus("HOME", "HOME", false);
  tocObj.clearSectionTOC();
  // Removes #content__tocicon if it exists
  // TODO : hardcoded home page HTML. Maybe save in an external file and load from here (using the same method as the parser does)
  contentText.innerHTML = "UNDER CONSTRUCTION";
  // Set section-container
  sectionText.innerHTML = "HOME"
  document.querySelector("#nav-bar").scrollIntoView({
    behavior: "smooth",
  });
}

// --- Load Generic Page
function toPage(sectionText, contentText, eventTarget) {
  currentDocument = eventTarget.dataset.document;
  tocObj.clearHeadings();
  helperObj.updateStatus(eventTarget.dataset.document, eventTarget.dataset.section, false);
  tocObj.clearSectionTOC();
  // Set section-container
  sectionText.innerHTML = eventTarget.dataset.section;
  const documentKey = eventTarget.dataset.document;
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
  document.querySelector("#nav-bar").scrollIntoView({
    behavior: "smooth",
  });
}

// --- Load Tech Page
function toTech(sectionText, contentText, eventTarget){
  helperObj.updateStatus(eventTarget.dataset.document, eventTarget.dataset.section, true);
  // Set section-container
  sectionText.innerHTML = eventTarget.dataset.section;
  // Check if the page to load is the same one
  let pastDocument = currentDocument;
  currentDocument = eventTarget.dataset.document;
  let currentDataset = eventTarget.dataset;
  if (currentDocument == pastDocument) {
    // If yes --> Just redirect
    if (currentDataset.redirect != null) {
      //Event has a redirect location, collapse the headings if needed
      searchObj.revealID(currentDataset.redirect.substring(1));
      document.querySelector(currentDataset.redirect).scrollIntoView({
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
    const documentKey = eventTarget.dataset.document;
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
    headingsObj.collapseHeadings(contentText);
    //Update page & Clear search results
    compileH2s();
    //updatePage(); compileH2s has an updatePage() call already.
    if (currentDataset.redirect != null) {
      //Event has a redirect location, collapse the headings if needed
      searchObj.revealID(currentDataset.redirect.substring(1));
      // Set timeout to give time to page to update (it also looks nice)
      setTimeout(() => {
        document.querySelector(currentDataset.redirect).scrollIntoView({
          behavior: "smooth",
        });
      }, 250);
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
}

// Adds functionality to the h2 section divider and opens the first one
function compileH2s() {
  // Add events to selector tab
  document.querySelectorAll(".content__selectorbox--item").forEach((selectorBox) => {
    selectorBox.style.setProperty('--highlight-color', selectorBox.dataset.highlight);
    selectorBox.addEventListener("click", (event) => {
      // iterate every selectorbox--item
      // -- remove selected status from other elements
      document.querySelectorAll(".content__selectorbox--item").forEach((selectorBox) => {
        selectorBox.className = "content__selectorbox--item";
      });
      // add selected status to the clicked selectorbox--item
      event.currentTarget.className = "content__selectorbox--item selected";
      // replace content_currenth2 with data from h2Collectio[x][3]
      // select the h2Collection based on the current selectorBox.dataset.open
      let currentCollection = headingsObj.returnH2Collection().filter((h2) => h2[0] == event.currentTarget.dataset.open);
      document.getElementById("content__currenth2").innerHTML = currentCollection[0][2];

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
