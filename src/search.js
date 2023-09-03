// search.js controls the search box and also redirects to search links (includes ToC).

import { parseGFM } from "./parser.js";
import { addPageChangeEvent } from "./page.js";

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
    // TODO - Search is working... Just not going.
    parseGFM("./tech/" + tabLinks[i].dataset.document.toLowerCase()).then(
      (techDocument) => {
        let currentDocument = techDocument;
        const parser = new DOMParser();
        // Add default page search
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

        // Parse the result from unified (parseGFM) into usable HTML
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
