// page.js controls the spa flow. It technically has 3 files into it, page.js, parser.js and search.js
// This is done because, while other spa may do similar things to keep filesize low, our build system is done considering multiple pages
// TODO - Maybe there is a proper way to do this based on the HTML file. For now, this is pretty light.
// TODO -   for top performance, the parser would only be loaded once you click the search or a game... how to do that?
// CTRL+F parser.js and search.js for the start of their sections. The following is for page.js
// It includes two functions that most files also use:
//   - updatePage() : reloads most things after a page change.
//   - addPageChangeEvent() : treats redirections.
// This makes the page responsive, but can make the code a bit messy. Not sure what would the best fix.

import { loadTooltip, unloadTooltip } from "./tooltip.js";
/*
import { parseGFM } from "./parser.js";
import {
  fillSearch,
  clearFunction,
  filterFunction,
  revealID,
  enableSmoothTOC,
} from "./search.js";
*/
import {
  collapseHeaders,
  sortTables,
  treatSpoilers,
  styleImages,
} from "./style.js";

// TODO - DISABLE SOURCEMAPS after page insights are done
// TODO - Prev. Scores: 50 80 77 60 (Perf, Acc, BP, SEO)
// TODO - Mobile Scores: 35 80 77 60 (Perf, Acc, BP, SEO)

// TODO - v10.x Scores: 69 100 100 90 (Perf, Acc, BP, SEO)
// TODO - v10.x Scores: 42 100 100 92 (Perf, Acc, BP, SEO)

// --- Actions taken on DOM Load
document.addEventListener(
  "DOMContentLoaded",
  function () {
    // Fill search elements
    // Add page change events to nav-bar (requires search bar to be filled)
    document
      .querySelectorAll(
        "div#nav-bar__title, img.nav-bar__tab-bar--links, p.footer-container__help--links, a.nav-bar__search--results"
      )
      .forEach((item) => {
        addPageChangeEvent(item);
      });

    // Add auto-complete and dropdown for the nav-bar search element
    let searchElement = document.querySelector("#nav-bar__search--input");
    searchElement.addEventListener("keyup", filterFunction);
    // Clean the dropdown with a focusout event
    let searchContainerElement = document.querySelector("#nav-bar__search");
    searchContainerElement.addEventListener("click", (event) => {
      let searchCount = document.querySelector(".nav-bar__search--results");
      if (searchCount == null) {
        fillSearch();
      }
    });
    searchContainerElement.addEventListener("focusout", (event) => {
      if (event.relatedTarget != null) {
        if (!(event.relatedTarget.className == "nav-bar__search--results")) {
          clearFunction();
        }
      } else {
        clearFunction();
      }
    });
    // Update page (done after content changes)
    updatePage();
  },
  false
);

// --- Generic actions every time the page is updated
export function updatePage() {
  // Enable smooth scroll on hash links
  enableSmoothTOC();
  // Treat custom directives
  compileTags();
  sortTables();
  treatSpoilers();
  styleImages();
}

// --- Function related to tagging behaviour
function compileTags() {
  //Iterator over every element that needs tagging
  document.querySelectorAll(".tagging").forEach((taggedElement) => {
    //Get tags from the first child (first heading), which are saved as JSON
    let tagTextData = taggedElement.dataset.tags;
    let tagData = JSON.parse(tagTextData.replace(/'/g, '"'));

    if (tagData.todo) {
      //If it has a todo tag, add an icon with a tooltip.
      let todoTag = document.createElement("span");
      todoTag.className = "material-icons md-light md-36";
      todoTag.style.color = "goldenrod";
      todoTag.style.marginRight = "15px";
      todoTag.style.cursor = "help";
      todoTag.textContent = "error_outline";
      taggedElement.appendChild(todoTag);
      todoTag.addEventListener("mouseover", () => {
        loadTooltip(
          todoTag,
          "This section needs work, is not confirmed or needs testing."
        );
      });
      todoTag.addEventListener("mouseleave", () => {
        unloadTooltip(todoTag);
      });
    }

    if (tagData.versions) {
      //If it has a version tag, add an icon with a tooltip which contains the value of the tag.
      let versionText = "Versions: ";
      versionText = versionText.concat(tagData.versions);
      versionText = versionText.concat(".");
      let versionTag = document.createElement("span");
      versionTag.className = "material-icons md-light md-36";
      versionTag.style.marginRight = "15px";
      versionTag.style.cursor = "help";
      versionTag.textContent = "devices";
      taggedElement.appendChild(versionTag);
      versionTag.addEventListener("mouseover", () => {
        loadTooltip(versionTag, versionText);
      });
      versionTag.addEventListener("mouseleave", () => {
        unloadTooltip(versionTag);
      });
    }

    if (tagData.media) {
      //If it has a media tag, check if it is forced on the page or not.
      if (tagData.forcedvideo) {
        //If yes, add it just below the paragraph/heading.
        let mediaTag = document.createElement("video");
        mediaTag.width = "640";
        mediaTag.height = "480";
        mediaTag.preload = "metadata";
        mediaTag.style.order = 2;
        mediaTag.style.width = "100%";
        mediaTag.style.outline = "none";
        mediaTag.controls = true;
        mediaTag.muted = true;
        mediaTag.loop = true;
        let sourceVideo = document.createElement("source");
        sourceVideo.src = tagData.media;
        sourceVideo.type = "video/mp4";
        mediaTag.appendChild(sourceVideo);
        taggedElement.appendChild(mediaTag);
      } else {
        //If no, display an icon that can create the video once clicked.
        let mediaTag = document.createElement("span");
        mediaTag.dataset.media = tagData.media;
        mediaTag.className = "material-icons md-light md-36";
        mediaTag.style.marginRight = "15px";
        mediaTag.style.cursor = "pointer";
        mediaTag.textContent = "play_circle_outline";
        taggedElement.appendChild(mediaTag);
        mediaTag.addEventListener("click", (mediaIcon) => {
          let videoSibling = mediaIcon.target.nextSibling;
          if (videoSibling == null) {
            let hiddenMedia = document.createElement("video");
            hiddenMedia.width = "640";
            hiddenMedia.height = "480";
            hiddenMedia.preload = "metadata";
            hiddenMedia.style.order = 2;
            hiddenMedia.style.width = "100%";
            hiddenMedia.style.outline = "none";
            hiddenMedia.controls = true;
            hiddenMedia.muted = true;
            hiddenMedia.loop = true;
            let sourceVideo = document.createElement("source");
            sourceVideo.src = mediaIcon.target.dataset.media;
            sourceVideo.type = "video/mp4";
            hiddenMedia.appendChild(sourceVideo);
            mediaIcon.target.parentNode.appendChild(hiddenMedia);
          } else {
            videoSibling.remove();
          }
        });
      }
    }
  });
}

// --- Function for click events on the nav-bar
export function addPageChangeEvent(item) {
  item.addEventListener("click", (event) => {
    // Variables to cosmetic modifications on the page
    let i, tabContent, tabLinks;

    // Get all elements with class="nav-bar__tab-bar--content" and hide them
    tabContent = document.getElementsByClassName("nav-bar__tab-bar--content");
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }

    // Get all elements with class="nav-bar__tab-bar--links" and remove the class "active"
    tabLinks = document.getElementsByClassName("nav-bar__tab-bar--links");
    for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab;
    if (
      !(
        event.currentTarget.dataset.document == "HOME" ||
        event.currentTarget.dataset.document.includes("./")
      )
    ) {
      for (i = 0; i < tabLinks.length; i++) {
        if (
          tabLinks[i].dataset.document == event.currentTarget.dataset.document
        ) {
          tabLinks[i].className += " active";
        }
      }
    }

    // Get the section and content elements to change the document presented on the page
    let sectionText = document.getElementById("section-container__text");
    let contentText = document.getElementById("content");

    if (event.currentTarget.dataset.document == "HOME") {
      //If the event is tagged as "HOME" (nav-bar logo redirect)
      // TODO - loadHome?();
      contentText.innerHTML = "UNDER CONSTRUCTION";
      sectionText.innerHTML = "HOME"
    } else {
      //Continuous page view
      if (event.currentTarget.dataset.document.includes("./")) {
        sectionText.innerHTML = event.currentTarget.dataset.section;
        parseGFM(event.currentTarget.dataset.document).then((page) => {
          contentText.innerHTML = page;
          //Clear search results
          clearFunction();
          //Update page
          updatePage();
        });
      } else {
        //Event is a tech document, set the section as the game name and update the content
        sectionText.innerHTML = event.currentTarget.dataset.section;
        let currentDataset = event.currentTarget.dataset;
        parseGFM(
          ("./tech/" + event.currentTarget.dataset.document).toLowerCase()
        ).then((page) => {
          contentText.innerHTML = page;
          collapseHeaders(contentText);
          //Clear search results
          clearFunction();
          //Update page
          updatePage();
          if (currentDataset.redirect != null) {
            //Event has a redirect location, collapse the headers if needed
            revealID(currentDataset.redirect.substring(1));
            document.querySelector(currentDataset.redirect).scrollIntoView({
              behavior: "smooth",
            });
          }
        });
      }
      //Scroll to top if no redirect is defined
      if (event.currentTarget.dataset.redirect == null) {
        document.documentElement.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  });
}

// parser.js is an async markdown-to-html parser.

import { Remarkable } from 'remarkable'; // This is where the bulk of the filesize comes from

var md = new Remarkable('full', {
  html: true,
  typographer: false,
});

const openEmRenderer = md.renderer.rules.em_open;
const closeEmRenderer = md.renderer.rules.em_close;
//const openHeadingRenderer = md.renderer.rules.heading_open;  // Headings are always modified
const closeHeadingRenderer = md.renderer.rules.heading_close;

var injectedHeading = false;
var injectedEm = false;

var tagMap = {
  "r": "red",
  "b": "blue",
  "g": "green",
  "y": "yellow",
  "p": "pink",
  "t": "teal",
  "!": "spoiler"
};

// https://www.npmjs.com/package/remarkable-youtube
//     When video sources are from Youtube?

md.renderer.rules.heading_open = function(tokens, idx, options, env) {
  if (tokens[idx+1].content[0] == ':') {
    injectedHeading = true;
    // Inject a span depending on the category
    if (tokens[idx+1].content[1] == '{') {
      // parseJsonTag modifies tokens, so baseReturn should be recalculated.
      let spanReturn = parseJsonTag(tokens, idx);
      let baseReturn = '<h' + tokens[idx].hLevel + ' id="' + tokens[idx+1].content.replace(/\s+/g, '-').toLowerCase() + '">';
      return spanReturn + baseReturn;
    }
  } else {
    let baseReturn = '<h' + tokens[idx].hLevel + ' id="' + tokens[idx+1].content.replace(/\s+/g, '-').toLowerCase() + '">';
    return baseReturn;
  }
};

md.renderer.rules.em_open = function(tokens, idx, options, env) {
  return parseTags(tokens, idx, options, env, openEmRenderer);
};

md.renderer.rules.heading_close = function(tokens, idx, options, env) {
  if (injectedHeading) {
    injectedHeading = false;
    let headerEnd = closeHeadingRenderer(tokens, idx, options, env);
    // Change new line position on styling will mess up
    return headerEnd.concat("</span>").replace("\n", ' ') + "\n";
  } else {
    return closeHeadingRenderer(tokens, idx, options, env);
  }
};

md.renderer.rules.em_close = function(tokens, idx, options, env) {
  if (injectedEm) {
    injectedEm = false;
    return '</span>';
  } else {
    return closeEmRenderer(tokens, idx, options, env);
  }
};

function parseTags(tokens, idx, options, env, fallback) {
  // Check if first token is a :
  //   if yes, apply changes
  //   if not, use default handler
  if (tokens[idx+1].type == "text") {
    if (tokens[idx+1].content[0] == ':') {
      injectedEm = true;
      // Inject a span depending on the category
      if (tokens[idx+1].content[1] == '{') {
        return parseJsonTag(tokens, idx);
      } else {
        let tagToken = tokens[idx+1].content[1];
        tokens[idx+1].content = tokens[idx+1].content.slice(2);
        return '<span class="' + tagMap[tagToken] + '">';
      }
    } else {
      return fallback(tokens, idx, options, env);
    }
  } else {
    return fallback(tokens, idx, options, env);
  }
}

function parseJsonTag(tokens, idx) {
  // Find index of closing bracket
  let endingIndex = tokens[idx+1].content.indexOf('}');
  let jsonTag = tokens[idx+1].content.substring(1, endingIndex + 1);
  tokens[idx+1].content = tokens[idx+1].content.slice(endingIndex + 2);
  // Inline segments don't change if you only change their content
  if (tokens[idx+1].type == "inline") {
    tokens[idx+1].children[0].content = tokens[idx+1].content;
  }
  return '<span class="tagging" data-tags="' + jsonTag + '">';
}

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
  //Return the HTML data
  content = md.render(fileData);
  return content;
}

// search.js controls the search box and also redirects to search links (includes ToC).

//import { parseGFM } from "./parser.js";
//import { addPageChangeEvent } from "./page.js";

// -- Function for search on the nav-bar
export function filterFunction() {
  var input, filter, a, i;
  // Gets the value from the user input, set each word into an array
  input = document.querySelector("#nav-bar__search--input");
  filter = input.value.toUpperCase().trim();
  filterArray = filter.split(" ");
  // Gets the element of the container and all current computed links
  div = document.querySelector("#nav-bar__search");
  a = div.getElementsByTagName("a");
  let searchCounter = 0;
  for (i = 0; i < a.length; i++) {
    // For each link, test if the user input makes part of its text value (ignoring empty inputs)
    // Hide any link that does not have any relation to the current input
    txtValue = a[i].textContent || a[i].innerText;
    let compareTxtValue = txtValue.toUpperCase();
    let containFlag = true;
    for (const stringFilter of filterArray.values()) {
      if (!(compareTxtValue.includes(stringFilter) && !(filter.length === 0))) {
        containFlag = false;
      }
    }
    if (containFlag) {
      // Hard limit of 6 options on screen
      if (searchCounter < 6) {
        a[i].style.display = "block";
      } else {
        a[i].style.display = "none";
      }
      searchCounter = searchCounter + 1;
    } else {
      a[i].style.display = "none";
    }
  }
}

export function clearFunction() {
  var a, i;
  // Function to hide all computed links
  div = document.querySelector("#nav-bar__search");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    a[i].style.display = "none";
  }
}

export function fillSearch() {
  // Get all items on the tab bar
  var tabLinks = document.getElementsByClassName("nav-bar__tab-bar--links");
  var searchContents = "";
  var i = 0;
  var searchResults = document.querySelector("#nav-bar__search");

  for (i = 0; i < tabLinks.length; i++) {
    // Creates a local variable related to the index so it doesn't get overwritten
    let currentIndex = i;
    parseGFM("./tech/" + tabLinks[i].dataset.document.toLowerCase()).then(
      (techDocument) => {
        let currentDocument = techDocument;
        const parser = new DOMParser();
        // Add default page search
        // TODO - should be divs instead of <a> to improve SEO
        searchContents = searchContents.concat('<a data-document="');
        searchContents = searchContents.concat(
          tabLinks[currentIndex].dataset.document
        );
        searchContents = searchContents.concat(
          '" class = "nav-bar__search--results" tabindex="0" data-section="'
        );
        searchContents = searchContents.concat(
          tabLinks[currentIndex].dataset.section
        );
        searchContents = searchContents.concat('"><b>');
        searchContents = searchContents.concat(
          tabLinks[currentIndex].dataset.section
        );
        searchContents = searchContents.concat("</b> <i>(");
        searchContents = searchContents.concat(
          tabLinks[currentIndex].dataset.document
        );
        searchContents = searchContents.concat(")</i></a>");

        const doc = parser.parseFromString(currentDocument, "text/html");
        doc.querySelectorAll("h4").forEach((currentHeading) => {
          searchContents = searchContents.concat('<a data-document="');
          // Create a link composed of the game name (short) and tech name and concat to the other links made by this function
          searchContents = searchContents.concat(
            tabLinks[currentIndex].dataset.document
          );
          searchContents = searchContents.concat(
            '" class = "nav-bar__search--results" tabindex="0" data-section="'
          );
          searchContents = searchContents.concat(
            tabLinks[currentIndex].dataset.section
          );
          searchContents = searchContents.concat('" data-redirect="#');
          searchContents = searchContents.concat(currentHeading.id);
          searchContents = searchContents.concat('"><b>');
          searchContents = searchContents.concat(
            tabLinks[currentIndex].dataset.document
          );
          searchContents = searchContents.concat("</b> - <i>");
          searchContents = searchContents.concat(currentHeading.textContent);
          searchContents = searchContents.concat("</i></a>");
        });
        // Insert the HTML on the search bar
        searchResults.insertAdjacentHTML("beforeend", searchContents);
        searchContents = "";
        document
          .querySelectorAll("a.nav-bar__search--results")
          .forEach((item) => {
            addPageChangeEvent(item);
          });
      }
    );
  }
}

// --- Show all headers for a specific ID
export function revealID(id) {
  // Gets the object of the provided ID
  targetHeader = document.getElementById(id);
  let hiddenItems = null;
  let success = false;
  // Gets the div that holds all the content for a given header
  if (targetHeader.parentNode.className.includes("content__")) {
    if (targetHeader.parentNode.firstElementChild.dataset.open != null) {
      hiddenItems =
        targetHeader.parentNode.firstElementChild.dataset.open.split(" ");
      success = true;
    }
  } else {
    // Div is one level higher if a tagging div was used
    if (
      targetHeader.parentNode.parentNode.firstElementChild.dataset.open != null
    ) {
      hiddenItems =
        targetHeader.parentNode.parentNode.firstElementChild.dataset.open.split(
          " "
        );
      success = true;
    }
  }
  if (success) {
    // Iterates over all related classes needed to reveal a specific header
    hiddenItems.forEach((item) => {
      let targetList = document.getElementsByClassName(item);
      // Get all objects that are possibly hidden
      for (let target of targetList) {
        if (target.hidden) {
          target.hidden = false;
          // Change the button depending on the current art
          if (target.parentNode.className.includes("content__")) {
            if (
              target.parentNode.firstElementChild.firstChild.innerHTML ==
              "expand_more"
            ) {
              target.parentNode.firstElementChild.firstChild.innerHTML =
                "expand_less";
            } else {
              target.parentNode.firstElementChild.firstChild.innerHTML =
                "remove";
            }
          } else {
            // Target is one level higher if a tagging div was used
            if (
              target.parentNode.parentNode.firstElementChild.firstChild
                .innerHTML == "expand_more"
            ) {
              target.parentNode.parentNode.firstElementChild.firstChild.innerHTML =
                "expand_less";
            } else {
              target.parentNode.parentNode.firstElementChild.firstChild.innerHTML =
                "remove";
            }
          }
        }
      }
    });
  }
}

// --- Function for click events on the nav-bar
export function enableSmoothTOC() {
  //Gets all hash events
  // TODO - once changed to divs, need to change this too
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      //Add smooth behaviour to all matches
      e.preventDefault();
      //Collapses the header if needed
      revealID(this.getAttribute("href").substring(1));
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}

