// page.js controls the spa flow. It imports most methods from other files.
// It includes two functions that most files also use:
//   - updatePage() : reloads most things after a page change.
//   - addPageChangeEvent() : treats redirections.
// This makes the page responsive, but can make the code a bit messy. Not sure what would the best fix.

import { loadTooltip, unloadTooltip } from "./tooltip.js";
import { parseGFM } from "./parser.js";
import { loadNewsSection } from "./news.js";
import {
  fillSearch,
  clearFunction,
  filterFunction,
  revealID,
  enableSmoothTOC,
} from "./search.js";
import {
  collapseHeaders,
  styleCheckboxes,
  sortTables,
  treatSpoilers,
  styleImages,
} from "./style.js";

// TODO - DISABLE SOURCEMAPS after page insights are done
// TODO - Prev. Scores: 50 80 77 60 (Perf, Acc, BP, SEO)
// TODO - Mobile Scores: 35 80 77 60 (Perf, Acc, BP, SEO)

// --- Actions taken on DOM Load
document.addEventListener(
  "DOMContentLoaded",
  function () {
    // Load news
    loadNewsSection();
    // Fill search elements
    fillSearch();
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
  styleCheckboxes();
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
        event.currentTarget.dataset.document == "NEWS" ||
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

    if (event.currentTarget.dataset.document == "NEWS") {
      //If the event is tagged as "NEWS" (nav-bar logo redirect)
      //Card based view
      loadNewsSection();
    } else {
      //Continuous page view
      if (event.currentTarget.dataset.document.includes("news")) {
        //If the event uses the news folder (document includes news string), set the section as news and update the content
        sectionText.innerHTML = "NEWS";
        parseGFM(event.currentTarget.dataset.document.toLowerCase()).then(
          (page) => {
            contentText.innerHTML = page;
            //Clear search results
            clearFunction();
            //Update page
            updatePage();
          }
        );
      } else if (event.currentTarget.dataset.document.includes("./")) {
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
