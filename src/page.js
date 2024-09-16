// page.js controls the spa flow. It technically has 3 files into it, page.js, parser.js and search.js
// This is done because, while other spa may do similar things to keep filesize low, our build system is done considering multiple pages
// TODO - Maybe there is a proper way to do this based on the HTML file. For now, this is pretty light.
// TODO -   for top performance, the parser would only be loaded once you click the search or a game... how to do that?

// ---------
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
  collapseHeadings,
  collapseHeadingStyle,
  sortTables,
  treatSpoilers,
  styleImages,
  h2Collection,
  dragScrollElement,
} from "./style.js";

var currentSection = null;
var currentDocument = null;
var inTechPage = false;

// TODO - DISABLE SOURCEMAPS before setting up hosting.

function pageInit() {
  // Fill search elements
  // Add page change events to nav-bar (requires search bar to be filled)
  document
    .querySelectorAll(
      "div#nav-bar__title, p.footer-container__help--links, a.nav-bar__search--results"
    )
    .forEach((item) => {
      addPageChangeEvent(item);
    });

  let searchLogo = document.querySelector("#nav-bar__search--icon");
  searchLogo.addEventListener("click", searchBoxListener);
  searchLogo.targetParam = "search";

  let gamesLogo = document.querySelector("#nav-bar__games--icon");
  gamesLogo.addEventListener("click", searchBoxListener);
  gamesLogo.targetParam = "games";

  // Update page (done after content changes)
  updatePage();
}

if (document.readyState !== "loading") {
  pageInit(); // Or setTimeout(pageInit, 0);
} else {
  document.addEventListener("DOMContentLoaded", pageInit);
}

// --- Generic actions every time the page is updated
export function updatePage() {
  // Create TOC
  createTOC();
  // Enable smooth scroll on hash links
  enableSmoothTOC();
  // Treat custom directives
  compileTags();
  sortTables();
  treatSpoilers();
  styleImages();
}

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
      let currentCollection = h2Collection.filter((h2) => h2[0] == event.currentTarget.dataset.open);
      document.getElementById("content__currenth2").innerHTML = currentCollection[0][2];

      // Adds click events for the buttons
      document.querySelectorAll(".content__collapse").forEach((button) => {
        button.addEventListener("click", collapseHeadingStyle);
      });
      updatePage();
      highlightTOC();
    });
  });

  // Opens first H2
  document.querySelectorAll(".content__selectorbox--item")[0].click();
}

// --- Function related to tagging behaviour
function compileTags() {
  //Iterator over every element that needs tagging
  document.querySelectorAll(".tagging, .tagging-text").forEach((taggedElement) => {
    //Get tags from the first child (first heading), which are saved as JSON
    let tagTextData = taggedElement.dataset.tags;
    let tagData = JSON.parse(tagTextData.replace(/'/g, '"'));

    if (tagData.todo) {
      //If it has a todo tag, add an icon with a tooltip.
      let todoTag = document.createElement("span");
      todoTag.className = "material-symbols-rounded";
      todoTag.style.color = "goldenrod";
      todoTag.style.marginRight = "15px";
      todoTag.style.cursor = "help";
      todoTag.textContent = "error";
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
      versionTag.className = "material-symbols-rounded";
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
      //Check if it's an youtube video or an mp4
      if (tagData.media.includes(".webp") || tagData.media.includes(".png") || tagData.media.includes(".jpg")) {
        //If it has a media tag, check if it is forced on the page or not.
        if (tagData.forcedmedia != false) {
          //If yes, add it just below the paragraph/heading.
          let mediaHolder = document.createElement("p");
          mediaHolder.style.opacity = "1";
          let mediaTag = document.createElement("img");
          mediaTag.draggable = false;
          mediaTag.width = "640";
          mediaTag.height = "480";
          mediaTag.style.order = 2;
          mediaTag.style.width = "80%";
          mediaTag.style.height = "auto";
          mediaTag.style.maxWidth = "640px";
          mediaTag.style.outline = "none";
          mediaTag.src = tagData.media;
          mediaHolder.appendChild(mediaTag);
          if (tagData.caption) {
            let caption = document.createElement("figcaption");
            caption.textContent = "\xa0" + tagData.caption + "\xa0";
            mediaHolder.appendChild(caption);
          }
          taggedElement.parentNode.insertBefore(mediaHolder, taggedElement.nextSibling);
        } else {
          //If no, display an icon that can create the video once clicked.
          let mediaTag = document.createElement("span");
          mediaTag.dataset.media = tagData.media;
          mediaTag.className = "material-symbols-rounded";
          mediaTag.style.marginRight = "15px";
          mediaTag.style.cursor = "pointer";
          mediaTag.textContent = "imagesmode";
          taggedElement.appendChild(mediaTag);
          mediaTag.addEventListener("click", (mediaIcon) => {
            let imgTarget = document.querySelector('p[data-media~="' + mediaIcon.target.dataset.media + '"]');
            if (imgTarget == null) {
              let mediaHolder = document.createElement("p");
              mediaHolder.style.opacity = "1";
              mediaHolder.dataset.media = mediaIcon.target.dataset.media;
              let hiddenMedia = document.createElement("img");
              hiddenMedia.draggable = false;
              hiddenMedia.width = "640";
              hiddenMedia.height = "480";
              hiddenMedia.style.order = 2;
              hiddenMedia.style.width = "80%";
              hiddenMedia.style.height = "auto";
              hiddenMedia.style.maxWidth = "640px";
              hiddenMedia.style.outline = "none";
              hiddenMedia.src = mediaIcon.target.dataset.media;
              mediaHolder.appendChild(hiddenMedia);
              if (tagData.caption) {
                let caption = document.createElement("figcaption");
                caption.textContent = "\xa0" + tagData.caption + "\xa0";
                mediaHolder.appendChild(caption);
              }
              //mediaIcon.target.parentNode.appendChild(mediaHolder);
              taggedElement.parentNode.insertBefore(mediaHolder, taggedElement.nextSibling);
            } else {
              imgTarget.remove();
            }
          });
        }
      } else {
        //If it has a media tag, check if it is forced on the page or not.
        if (tagData.forcedmedia != false) {
          //If yes, add it just below the paragraph/heading.
          let mediaHolder = document.createElement("p");
          mediaHolder.style.opacity = "1";
          let mediaTag = document.createElement("video");
          mediaTag.width = "640";
          mediaTag.height = "480";
          mediaTag.preload = "metadata";
          mediaTag.style.order = 2;
          mediaTag.style.width = "80%";
          mediaTag.style.height = "auto";
          mediaTag.style.maxWidth = "640px";
          mediaTag.style.outline = "none";
          mediaTag.controls = true;
          mediaTag.muted = true;
          mediaTag.loop = true;
          let sourceVideo = document.createElement("source");
          sourceVideo.src = tagData.media;
          sourceVideo.type = "video/mp4";
          mediaTag.appendChild(sourceVideo);
          mediaHolder.appendChild(mediaTag);
          if (tagData.caption) {
            let caption = document.createElement("figcaption");
            caption.textContent = "\xa0" + tagData.caption + "\xa0";
            mediaHolder.appendChild(caption);
          }
          taggedElement.parentNode.insertBefore(mediaHolder, taggedElement.nextSibling);
        } else {
          //If no, display an icon that can create the video once clicked.
          let mediaTag = document.createElement("span");
          mediaTag.dataset.media = tagData.media;
          mediaTag.className = "material-symbols-rounded";
          mediaTag.style.marginRight = "15px";
          mediaTag.style.cursor = "pointer";
          mediaTag.textContent = "play_circle";
          taggedElement.appendChild(mediaTag);
          mediaTag.addEventListener("click", (mediaIcon) => {
            let videoTarget = document.querySelector('p[data-media~="' + mediaIcon.target.dataset.media + '"]');
            if (videoTarget == null) {
              let mediaHolder = document.createElement("p");
              mediaHolder.style.opacity = "1";
              mediaHolder.dataset.media = mediaIcon.target.dataset.media;
              let hiddenMedia = document.createElement("video");
              hiddenMedia.width = "640";
              hiddenMedia.height = "480";
              hiddenMedia.preload = "metadata";
              hiddenMedia.style.order = 2;
              hiddenMedia.style.width = "80%";
              hiddenMedia.style.height = "auto";
              hiddenMedia.style.maxWidth = "640px";
              hiddenMedia.style.outline = "none";
              hiddenMedia.controls = true;
              hiddenMedia.muted = true;
              hiddenMedia.loop = true;
              let sourceVideo = document.createElement("source");
              sourceVideo.src = mediaIcon.target.dataset.media;
              sourceVideo.type = "video/mp4";
              hiddenMedia.appendChild(sourceVideo);
              mediaHolder.appendChild(hiddenMedia);
              if (tagData.caption) {
                let caption = document.createElement("figcaption");
                caption.textContent = "\xa0" + tagData.caption + "\xa0";
                mediaHolder.appendChild(caption);
              }
              //mediaIcon.target.parentNode.appendChild(mediaHolder);
              taggedElement.parentNode.insertBefore(mediaHolder, taggedElement.nextSibling);
            } else {
              videoTarget.remove();
            }
          });
        }
      }
    }
  });
}

function clearSectionTOC() {
  let tocIcon = document.getElementById("content__tocicon");
  if (tocIcon != null) {
    tocIcon.remove();
  }
  let tocBox = document.getElementById("content__tocicon--box");
  if (tocBox != null) {
    tocBox.remove();
  }
}

function changeEvent(event){
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
    headings = [];
    currentSection = "HOME";
    currentDocument = "HOME";
    // Removes #content__tocicon if it exists (will be created again for the current page if needed)
    clearSectionTOC();
    // TODO - loadHome?();
    contentText.innerHTML = "UNDER CONSTRUCTION";
    sectionText.innerHTML = "HOME"
    inTechPage = false;
    document.querySelector("#nav-bar").scrollIntoView({
      behavior: "smooth",
    });
  } else {
    //Continuous page view
    if (event.currentTarget.dataset.document.includes("./")) {
      headings = [];
      // Removes #content__tocicon if it exists (will be created again for the current page if needed)
      clearSectionTOC();
      inTechPage = false;
      currentSection = event.currentTarget.dataset.section;
      currentDocument = event.currentTarget.dataset.document;
      sectionText.innerHTML = event.currentTarget.dataset.section;
      parseGFM(event.currentTarget.dataset.document).then((page) => {
        contentText.innerHTML = page;
        //Update page & Clear search results
        updatePage();
        clearFunction();
        document.querySelector("#nav-bar").scrollIntoView({
          behavior: "smooth",
        });
      });
    } else {
      //Event is a tech document, set the section as the game name and update the content
      inTechPage = true;
      sectionText.innerHTML = event.currentTarget.dataset.section;
      let pastDocument = currentDocument;
      currentSection = event.currentTarget.dataset.section;
      currentDocument = event.currentTarget.dataset.document;
      let currentDataset = event.currentTarget.dataset;
      if (currentDocument == pastDocument) {
        // Just redirect
        clearFunction();
        if (currentDataset.redirect != null) {
          //Event has a redirect location, collapse the headings if needed
          revealID(currentDataset.redirect.substring(1));
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
        headings = [];
        // Removes #content__tocicon if it exists (will be created again for the current page if needed)
        clearSectionTOC();
        parseGFM(
          ("./tech/" + event.currentTarget.dataset.document).toLowerCase()
        ).then((page) => {
          // TODO - Add a loading icon here?
          // content is hidden until collapseHeadings is finished -- the function itself changes it back
          //   that function adds a selection menu and TOC to the page
          contentText.style.visibility = "hidden";
          contentText.innerHTML = page;
          collapseHeadings(contentText);
          //Update page & Clear search results
          compileH2s();
          //updatePage(); compileH2s has an updatePage() call already.
          clearFunction();
          if (currentDataset.redirect != null) {
            //Event has a redirect location, collapse the headings if needed
            revealID(currentDataset.redirect.substring(1));
            document.querySelector(currentDataset.redirect).scrollIntoView({
              behavior: "smooth",
            });
          } else {
            //No redirect location, scroll to top
            document.querySelector("#nav-bar").scrollIntoView({
              behavior: "smooth",
            });
          }
        });
      }
    }
  }
}

// --- Function for click events on the nav-bar
export function addPageChangeEvent(item) {
  // Remove the previous event if one exist. This is a bandaid fix fo the fillSearch function.
  item.removeEventListener("click", changeEvent);
  item.addEventListener("click", changeEvent);
}

// ---------
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
//     When video sources are from Youtube? or remarkable-embed

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
    let headingEnd = closeHeadingRenderer(tokens, idx, options, env);
    // Change new line position on styling will mess up
    return headingEnd.concat("</span>").replace(/\n/g, ' ') + "\n";
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
  let classOp = "tagging";
  if (tokens[idx].type == "em_open") {
    classOp = "tagging-text";
  }
  return '<span class="'+ classOp +'" data-tags="' + jsonTag + '">';
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

// ---------
// search.js controls the search box and also redirects to search links (includes ToC).

//import { parseGFM } from "./parser.js";
//import { addPageChangeEvent } from "./page.js";

// -- Function for search on the nav-bar

var navLock = false;
var currentActiveSearch = null;

// Listener that adds games to both tabs.
function searchBoxListener() {
  if (navLock) {
    return;
  }
  let type = event.currentTarget.targetParam;
  currentActiveSearch = type;
  if (type == "search") {
    injectSearchBox("#nav-bar__search");
  } else {
    injectSearchBox("#nav-bar__games");
  }
  let searchCount = document.querySelector(".nav-bar__search--results");
  if (searchCount == null) {
    fillSearch();
  }
  if (type == "games") {
    let gamesBox = document.querySelector("#nav-bar__gamesbox");
    let children = gamesBox.children;
    for (elem of children) {
      elem.style.display = "inline-block";
    }
    // TODO : check fillsearch function. Remove the following two lines when done
    document.querySelector("#nav-bar__games--hr2D").style.display = "none";
    document.querySelector("#nav-bar__games--hr3D").style.display = "none";
  }
}

function injectSearchBox(id) {
  if (navLock) {
    return;
  }
  let searchIcon = document.querySelector(id);
  searchIcon.removeEventListener("click", searchBoxListener);

  var baseName = id + "box";
  var inputName = id + "--input";
  var logoName = id + "--icon";
  var base = document.querySelector(baseName);
  var inputField = document.querySelector(inputName);
  // If NULL, create both boxes and create correct reference for base
  if (base == null) {
    let searchBase = document.createElement("div");
    let gamesBase = document.createElement("div");
    searchBase.id = "nav-bar__searchbox";
    gamesBase.id = "nav-bar__gamesbox";
    searchBase.style.width = "0px";
    gamesBase.style.width = "0px";
    gamesBase.tabIndex = "0";

    let searchInputField = document.createElement("input");
    searchInputField.id = "nav-bar__search--input";
    searchBase.appendChild(searchInputField);

    let searchIconInst = document.querySelector("#nav-bar__search");
    searchIconInst.appendChild(searchBase);
    let gamesIconInst = document.querySelector("#nav-bar__games");
    gamesIconInst.appendChild(gamesBase);
    searchInputField.addEventListener("keyup", filterFunction);
    searchInputField.addEventListener("focusout", (event) => {
      let searchField = document.querySelector("#nav-bar__search");
      event.stopPropagation();
      if (!(searchField.contains(event.relatedTarget))) {
        clearFunction();
      }
    });
    gamesBase.addEventListener("focusout", (event) => {
      let searchField = document.querySelector("#nav-bar__games");
      event.stopPropagation();
      if (!(searchField.contains(event.relatedTarget))) {
        clearFunction();
      }
    });
    inputField = searchInputField;
  }

  base = document.querySelector(baseName);

  var searchboxWidth = 220;
  if (currentActiveSearch == "search"){
    if (document.body.clientWidth >= 480) {
      searchboxWidth = 360;
    }
  } else {
    searchboxWidth = 300;
  }
  base.style.width = searchboxWidth + "px";

  let searchLogo = document.querySelector(logoName);
  searchLogo.className = "material-symbols-rounded logo-fadeout";
  searchLogo.removeEventListener("click", searchBoxListener);
  searchLogo.addEventListener("click", clearFunction);

  if (currentActiveSearch == "search"){
    inputField = document.querySelector(inputName);
    inputField.focus();
  } else {
    base.focus();
  }

  base.className = "fadein";
}


export function clearFunction() {
  if (currentActiveSearch == null){
    return;
  }
  var a, i;
  // Function to hide all computed links
  var searchBox = document.querySelector("#nav-bar__searchbox");
  var gamesBox = document.querySelector("#nav-bar__gamesbox");
  if (searchBox == null || gamesBox == null) {
    return;
  }

  navLock = true;
  var referenceBox = null;
  currentActiveSearch == "search" ? referenceBox = searchBox : referenceBox = gamesBox;
  let referenceId = "#nav-bar__" + currentActiveSearch;

  if (currentActiveSearch == "search"){
    a = referenceBox.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
    }
    document.querySelector(referenceId + "--hr").style.display = "none";
  } else {
    figs = referenceBox.getElementsByTagName("figure");
    for (i = 0; i < figs.length; i++) {
      figs[i].style.display = "none";
    }
    document.querySelector(referenceId + "--hr2D").style.display = "none";
    document.querySelector(referenceId + "--hr3D").style.display = "none";
  }

  var searchLogo = document.querySelector(referenceId + "--icon");
  searchLogo.className = "material-symbols-rounded logo-fadein";
  searchLogo.removeEventListener("click", clearFunction);
  searchLogo.addEventListener("click", searchBoxListener);


  if (currentActiveSearch == "search") {
    searchLogo.targetParam = "search";
    setTimeout(() => {
      searchBox.className = "fadeout";
      navLock = false;
    }, "300");
  } else {
    searchLogo.targetParam = "games";
    setTimeout(() => {
      gamesBox.className = "fadeout";
      navLock = false;
    }, "300");
  }
  currentActiveSearch = null;
}

export function filterFunction() {
  var input, filter, a, i;
  var idReference = "#nav-bar__search";
  if (currentActiveSearch == "games") {
    return;
  }
  // Gets the value from the user input, set each word into an array
  input = document.querySelector(idReference + "--input");
  filter = input.value.toUpperCase().trim();
  filterArray = filter.split(" ");
  // Gets the element of the container and all current computed links
  let searchBox = document.querySelector(idReference + "box");
  a = searchBox.getElementsByTagName("a");
  let searchCounter = 0;
  for (i = 0; i < a.length; i++) {
    // For each link, test if the user input makes part of its text value (ignoring empty inputs)
    // Hide any link that does not have any relation to the current input
    txtValue = a[i].textContent || a[i].innerText;
    txtValue = txtValue + " " + a[i].dataset.section + " " + a[i].dataset.document;
    let compareTxtValue = txtValue.toUpperCase();
    let containFlag = true;
    for (const stringFilter of filterArray.values()) {
      if (!(compareTxtValue.includes(stringFilter) && !(filter.length === 0))) {
        containFlag = false;
      }
    }
    if (containFlag) {
      // Hard limit of 6 options on screen
      if (searchCounter < 6 || currentActiveSearch == "games") {
        a[i].style.display = "block";
      } else {
        a[i].style.display = "none";
      }
      searchCounter = searchCounter + 1;
    } else {
      a[i].style.display = "none";
    }
  }
  if (searchCounter > 0) {
    document.querySelector(idReference + "--hr").style.display = "block";
  } else {
    document.querySelector(idReference + "--hr").style.display = "none";
  }
}

// TODO - Filling Search, Games and Pre-Loading MD files should probably be done after page load is done. I think there is a document eventListener for it.
// TODO -   also, since it's a bunch of stuff, it would probably be cool to add a little loading animation at home so the user knows when it's done.
export function fillSearch() {
  // Get all items on the tab bar
  var tabLinks = document.getElementsByClassName("game-instances--links");
  var searchContents = "";
  var game2DContents = "";
  var game3DContents = "";
  var i = 0;
  var searchResults = document.querySelector("#nav-bar__searchbox");
  var gamesResults = document.querySelector("#nav-bar__gamesbox");

  // Insert a hidden hr on the first slot of the search
  let hrElem = "<hr id='nav-bar__search--hr'  tabindex='0' style='display: none;'>";
  searchResults.insertAdjacentHTML("beforeend", hrElem);

  let spanElem = '<span style="cursor: default;height: 50px; display: block; float: right; padding-left: 30px;"></span>';
  gamesResults.insertAdjacentHTML("beforeend", spanElem);

  // TODO : While you can unhide this and make the line appear, right now it doesn't look so good
  // TODO :   so the styling of other elements need to change first
  let hrElem2D = "<hr id='nav-bar__games--hr2D'  tabindex='0' style='display: none;'>";
  gamesResults.insertAdjacentHTML("beforeend", hrElem2D);
  let hrElem3D = "<hr id='nav-bar__games--hr3D'  tabindex='0' style='display: none;'>";
  gamesResults.insertAdjacentHTML("beforeend", hrElem3D);
  //hrElem = "<div class='nav-bar__games--divider' id='nav-bar__games--hr2D'  tabindex='0'><hr/><span>2D</span><hr/></div>";
  //gamesResults.insertAdjacentHTML("beforeend", hrElem);
  //hrElem = "<div  class='nav-bar__games--divider' id='nav-bar__games--hr3D'  tabindex='0'><hr/><span>3D</span><hr/></div>";
  //gamesResults.insertAdjacentHTML("beforeend", hrElem);

  //searchResults.insertAdjacentHTML("beforeend", searchContents);

  for (i = 0; i < tabLinks.length; i++) {
    // Creates a local variable related to the index so it doesn't get overwritten
    let currentIndex = i;
    parseGFM("./tech/" + tabLinks[i].dataset.document.toLowerCase()).then(
      (techDocument) => {
        let currentDocument = techDocument;
        const parser = new DOMParser();
        // Add default page search
        let gameContents = "";
        gameContents = gameContents.concat('<figure class="nav-bar__games--wrapper" data-document="');
        gameContents = gameContents.concat(
          tabLinks[currentIndex].dataset.document
        );
        gameContents = gameContents.concat(
          '" data-dim="'
        );
        gameContents = gameContents.concat(
          tabLinks[currentIndex].dataset.dim
        );
        gameContents = gameContents.concat(
          '" tabindex="0" data-section="'
        );
        gameContents = gameContents.concat(
          tabLinks[currentIndex].dataset.section
        );
        gameContents = gameContents.concat('"><figcaption>');
        gameContents = gameContents.concat(
          tabLinks[currentIndex].dataset.document
        );
        gameContents = gameContents.concat('</figcaption><img  class="nav-bar__search--results" src="media/');
        gameContents = gameContents.concat(
          tabLinks[currentIndex].dataset.document.toLowerCase().trim()
        );
        gameContents = gameContents.concat('/');
        gameContents = gameContents.concat(
          tabLinks[currentIndex].dataset.document.trim()
        );
        gameContents = gameContents.concat('ICONs.webp"></img></figure>');

        if(tabLinks[currentIndex].dataset.dim == "2D"){
          let content2D = document.querySelector("#nav-bar__games--hr2D");
          // Inject AFTER 2D HR  "afterend" 2D HR
          content2D.insertAdjacentHTML("beforebegin", gameContents);
        } else {
          let content3D = document.querySelector("#nav-bar__games--hr3D");
          // Inject AFTER 3D HR
          content3D.insertAdjacentHTML("beforebegin", gameContents);
        }

        //gamesResults.insertAdjacentHTML("beforeend", gameContents);

        gameContents = "";
        document
          .querySelectorAll("figure.nav-bar__games--wrapper")
          .forEach((item) => {
            addPageChangeEvent(item);
          });


        const doc = parser.parseFromString(currentDocument, "text/html");

        // Get all h1, h3, and h4 elements in the order they appear in the document
        const headings = doc.querySelectorAll("h1, h2, h3, h4");

        // Process each heading in the order they appear
        let currentH2 = null;
        headings.forEach((currentHeading) => {
          if (currentHeading.tagName == "H1") {
            currentH2 = null;
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
              tabLinks[currentIndex].dataset.section
            );
            searchContents = searchContents.concat("</b> </a>");
          } else {
            if (currentHeading.tagName == "H2") {
              currentH2 = currentHeading.id;
            }
            if ((currentH2 == "glitches" || currentH2 == "techniques") && currentHeading.id != "general-techniques") {
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
              searchContents = searchContents.concat("</b> <br>&nbsp;&nbsp;&nbsp;");
              searchContents = searchContents.concat(currentHeading.textContent);
              searchContents = searchContents.concat("</a>");
            }
          }
        });
        // Insert the HTML on the search bar
        // TODO - this probably does for the same link multiple times... (not really but...JS)
        // TODO -   not sure what to best way to deal with it is since we're in a promise
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

// --- Show all headings for a specific ID
export function revealID(id) {
  // Gets the object of the provided ID
  targetHeading = document.getElementById(id);
  if (targetHeading == null) {
    // Target hidden within an h2 section -- first we need to open it
    h2Section = 0;
    for (let x = 0; x < h2Collection.length; x++) {
      if (h2Collection[x][2].includes(`id="${id}"`)) {
        h2Section = x;
        break;
      }
    }
    document.querySelectorAll(".content__selectorbox--item")[h2Section].click();
  }
  targetHeading = document.getElementById(id);
  let hiddenItems = null;
  let success = false;
  // Gets the div that holds all the content for a given heading
  if (targetHeading.tagName == "H4") {
    if (targetHeading.dataset.open != null) {
      hiddenItems = targetHeading.dataset.open.split(" ");
      success = true;
    }
  } else if (targetHeading.parentNode.className.includes("content__")) {
    if (targetHeading.parentNode.firstElementChild.dataset.open != null) {
      hiddenItems =
        targetHeading.parentNode.firstElementChild.dataset.open.split(" ");
      success = true;
    }
  } else {
    // Div is one level higher if a tagging div was used
    if (
      targetHeading.parentNode.parentNode.firstElementChild.dataset.open != null
    ) {
      hiddenItems =
        targetHeading.parentNode.parentNode.firstElementChild.dataset.open.split(
          " "
        );
      success = true;
    }
  }
  if (success) {
    // Iterates over all related classes needed to reveal a specific heading
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

var headings = [];

function createTOC() {
  //Check if tocborder already exists
  let tocBorder = document.getElementById("content__tocborder");
  let selector = null;
  let content = null;
  let toc = null;
  let tocMobile = null;
  if (tocBorder == null) {
    //Check if it is a tech page by searching for an active h2 (class == content__selectorbox--item selected)
    let techPage = document.querySelector(".content__selectorbox--item.selected");
    if (techPage == null) {
      return;
    } else {
      // Title is the content of the div
      h2Title = techPage.textContent;
    }
    //Gets div of id content and creats a new div as children
    content = document.getElementById("content");
    tocBorder = document.createElement("div");
    tocBorder.id = "content__tocborder";
    content.appendChild(tocBorder);
    toc = document.createElement("div");
    toc.id = "content__toc";
    tocMobile = document.createElement("div");
    tocMobile.id = "content__tocmobile";
    tocBorder.appendChild(toc);
    //Set TOC y location just after #content__selector
    selector = document.getElementById("content__selector");
    tocBorder.style.top = (selector.offsetTop + 150) + "px";

    // Also add an icon on the #section-container__div for mobile
    let tocIcon = document.createElement("span");
    tocIcon.className = "material-symbols-rounded";
    tocIcon.id = "content__tocicon";
    tocIcon.innerHTML = "menu_book";
    tocIcon.style.display = "none";
    let sectionContainer = document.getElementById("section-container__div");
    sectionContainer.appendChild(tocIcon);
    // And a box so the ToC can be added to it. <div id="content__tocicon--box" style="width: 300px;" tabindex="0" class="fadeout">
    let tocIconBox = document.createElement("div");
    tocIconBox.id = "content__tocicon--box";
    tocIconBox.style.width = "0px";
    // set tabindex so it can get focused
    tocIconBox.tabIndex = "0";
    sectionContainer.appendChild(tocIconBox);
    // Add the toc to the box
    tocIconBox.appendChild(tocMobile);
    dragScrollElement(("#" + tocIconBox.id), 1);
    dragScrollElement(("#" + toc.id), 1);
    // Add an event listener to the icon
    tocIcon.addEventListener("click", (event) => {
      let box = document.getElementById("content__tocicon--box");
      var boxWidth = 300;
      if (document.body.clientWidth >= 480) {
        boxWidth = 360;
      }
      box.style.width = boxWidth + "px";
      box.className = "fadein";
      tocIconBox.display = "block";
      box.focus();
    });
    tocIconBox.addEventListener("focusout", (event) => {
      let box = document.getElementById("content__tocicon--box");
      event.stopPropagation();
      box.className = "fadeout";
    });
  } else {
    selector = document.getElementById("content__selector");
    content = document.getElementById("content");
    toc = document.getElementById("content__toc");
    tocMobile = document.getElementById("content__tocmobile");
    h2Title = document.querySelector(".content__selectorbox--item.selected").textContent;
  }
  //Set TOCborder size to content size - offset
  tocBorder.style.height = "calc(100% - " + (selector.offsetTop + 150) + "px)";
  //Add content to TOC
  let tocContent = "<p>— On this section:</p><hr>";
  toc.innerHTML = tocContent;
  tocMobile.innerHTML = tocContent;
  // - Scan headinds (h3s and h4s) on #content__currenth2, creates objects with name, clientY, isH3 or isH4, and parent (if H4)
  headings = [];
  let h3s = document.querySelectorAll("#content__currenth2 h3");
  let h4s = document.querySelectorAll("#content__currenth2 h4");
  for (let h3 of h3s) {
    headings.push({
      name: h3.textContent,
      clientY: h3.getBoundingClientRect().top,
      isH3: true,
      obj : h3,
      id : h3.id
    });
  }
  for (let h4 of h4s) {
    headings.push({
      name: h4.textContent,
      clientY: h4.getBoundingClientRect().top,
      isH3: false,
      obj : h4,
      id : h4.id
    });
  }
  // - Sort the objects by clientY
  headings.sort((a, b) => a.clientY - b.clientY);

  // - Create a list of links to the headings
  let tocLinks = "";
  for (let heading of headings) {
    let link = '<a data-document="' + currentDocument + '" data-section="'+ currentSection + '" data-redirect="#' + heading.id + '" class="content__toc--search" style="display: block;';
    if (!(heading.isH3)) {
      link = link.concat('padding-left: 30px; font-size: 13px; padding-top: 6px; padding-bottom: 6px;');
    }
    link = link.concat('">' + heading.name);
    link = link.concat("</a>");
    tocLinks = tocLinks.concat(link);
  }
  // - Add the list to the TOC
  toc.innerHTML = tocContent.concat(tocLinks);
  tocMobile.innerHTML = tocContent.concat(tocLinks);
  // Add addPageChangeEvent to links
  document.querySelectorAll(".content__toc--search").forEach((item) => {
    addPageChangeEvent(item);
  });
}

var ticking = false;

function highlightTOC() {
  // Check which H3 is the current one based on scrollPos & headings and hide all other h4s that are not theirs
  let currentH3 = null;
  let currentH3Index = 0;
  let nextH3Index = 0;
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].isH3) {
      // TODO : Something related to viewport instead of 320
      if (headings[i].obj.getBoundingClientRect().top <= 320 || (currentH3 == null)) {
        currentH3 = headings[i];
        currentH3Index = i;
      } else {
        nextH3Index = i;
        break;
      }
    }
  }

  // Hide SEARCH h4s (display: none) before and after the indexes and show (display:block) the ones between
  for (let i = 0; i < headings.length; i++) {
    if (!(headings[i].isH3)) {
      if ((i >= currentH3Index && i <= nextH3Index) || (nextH3Index == 0 && currentH3Index > 0 && i >= currentH3Index) || (nextH3Index == 0 && currentH3Index == 0)) {
        let searchH4 = document.querySelectorAll('.content__toc--search[data-redirect="#' + headings[i].id + '"]');
        for (let search of searchH4) {
          search.style.display = "block";
        }
      } else {
        let searchH4 = document.querySelectorAll('.content__toc--search[data-redirect="#' + headings[i].id + '"]');
        for (let search of searchH4) {
          search.style.display = "none";
        }
      }
    }
  }

  // Add an active to the current h3 and remove active (if there are any) from other
  if (currentH3 != null) {
    let currentActive = document.querySelectorAll(".content__toc--search.active");
    for (let active of currentActive) {
      active.classList.remove("active");
    }
    let currentH3Link = document.querySelectorAll('.content__toc--search[data-redirect="#' + currentH3.id + '"]');
    for (let active of currentH3Link) {
      active.classList.add("active");
    }
  }
}

document.addEventListener("scroll", (event) => {
  if (!ticking && inTechPage) {
    window.requestAnimationFrame(() => {
      highlightTOC();
      ticking = false;
    });
    ticking = true;
  }
});


// --- Function for click events on the nav-bar
export function enableSmoothTOC() {
  //Gets all hash events
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      //Add smooth behaviour to all matches
      e.preventDefault();
      //Collapses the heading if needed
      revealID(this.getAttribute("href").substring(1));
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}

