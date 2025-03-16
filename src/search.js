
// ---------
// search.js controls the search actions and redirects

export class Search {
  constructor(techPages, addPageChangeEvent) {
    this.navLock = false;
    this.resultState = false;
    this.currentActiveSearch = null;
    this.techPages = techPages;
    this.addPageChangeEvent = addPageChangeEvent;
    this.searchBoxListener = this.searchBoxListener.bind(this);
  }

  // Init nav-bar
  initSearchIcons() {
    let search = document.querySelector("#nav-bar__searchbox");
    search.addEventListener("click", this.searchBoxListener);
    let input = document.querySelector("#nav-bar__search--input");

    input.addEventListener("keyup", this.filterFunction);
    input.addEventListener("focusin", this.filterFunction);
    search.targetParam = "search";

    let games = document.querySelector("#nav-bar__games--icon");
    games.addEventListener("click", this.gamesFunction);

    // Search has an input field which has a filter function when you type
    // If you focus out of the pop-ups for both icons they will dissapear
    //   things are cleared and css controls the animation
    search.addEventListener("focusout", (event) => {
      let searchField = document.querySelector("#nav-bar__search");
      event.stopPropagation();
      if (!(searchField.contains(event.relatedTarget))) {
        this.clearFunction();
      }
    });

    // First create the HTML elements for each, then fill with the links
    this.fillSearch();
  }

  initOnboardingIcon() {
    let onboardingIcon = document.querySelector("#content__home__onboarding--icon");
    if (onboardingIcon != null) {
      onboardingIcon.addEventListener("click", this.gamesFunction);
    }
  }

  // Click event for the icons
  searchBoxListener() {
    if (this.navLock) {
      return;
    }
    let type = event.currentTarget.targetParam;
    this.currentActiveSearch = type;
    this.injectSearchBox("#nav-bar__search");
    let searchCount = document.querySelector(".nav-bar__search--results");
    if (searchCount == null) {
      this.fillSearch();
    }
  }

  // Makes the box for games or search appear
  injectSearchBox(id) {
    if (this.navLock) {
      return;
    }
    let searchIcon = document.querySelector(id);
    searchIcon.removeEventListener("click", this.searchBoxListener);

    var baseName = id + "box";
    var inputName = id + "--input";
    var base = document.querySelector(baseName);
    var inputField = document.querySelector(inputName);

    base = document.querySelector(baseName);

    // Based on min mobile widths
    var searchboxWidth = 280;
    if (this.currentActiveSearch == "search"){
      if (document.body.clientWidth >= 480) {
        searchboxWidth = 400;
      }
    } else {
      searchboxWidth = 280;
    }
    base.style.width = searchboxWidth + "px";

    // Focus on the elemtents to use focusout to exit them
    if (this.currentActiveSearch == "search"){
      inputField = document.querySelector(inputName);
      inputField.focus();
    } else {
      base.focus();
    }
  }

  // Clear everthing and then show the icon again
  clearFunction() {
    var a, i;
    // Function to hide all computed links
    var searchBox = document.querySelector("#nav-bar__searchbox");
    if (searchBox == null) {
      return;
    }
    this.navLock = true;

    var referenceBox = searchBox;
    let referenceId = "#nav-bar__search";

    a = referenceBox.getElementsByClassName("button__redirect");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
    }
    document.querySelector(referenceId + "--hr").style.display = "none";
    this.navLock = false;

  }

  // Filter up to 6 options when you type something in search
  filterFunction() {
    var input, filter, a, i;
    var idReference = "#nav-bar__search";
    if (this.currentActiveSearch == "games") {
      return;
    }
    // Gets the value from the user input, set each word into an array
    input = document.querySelector(idReference + "--input");
    filter = input.value.toUpperCase().trim();
    let filterArray = filter.split(" ");
    // Gets the element of the container and all current computed links
    let searchBox = document.querySelector(idReference + "box");
    a = searchBox.getElementsByClassName("button__redirect");
    let searchCounter = 0;
    for (i = 0; i < a.length; i++) {
      // For each link, test if the user input makes part of its text value (ignoring empty inputs)
      // Hide any link that does not have any relation to the current input
      let txtValue = a[i].textContent || a[i].innerText;
      txtValue = txtValue + " " + a[i].dataset.section + " " + a[i].dataset.document;
      let compareTxtValue = txtValue.toUpperCase();
      let containFlag = true;
      for (const stringFilter of filterArray.values()) {
        if (!(compareTxtValue.includes(stringFilter) && !(filter.length === 0))) {
          containFlag = false;
        }
      }
      if (containFlag) {
        if ("TALES OF".includes(filter) || filter == "T" || filter == "TO"){
          if (a[i].dataset.tag == "game") {
            a[i].style.display = "block";
          }
          continue;
        }
        // Hard limit of 18 options on screen
        if (searchCounter < 12 || a[i].dataset.tag == "game") {
          a[i].style.display = "block";
        } else {
          a[i].style.display = "none";
        }
        searchCounter = searchCounter + 1;
      } else {
        a[i].style.display = "none";
      }
    }
    if ((searchCounter > 0 || "TALES OF".includes(filter) || filter == "T" || filter == "TO" ) && filter.length > 0) {
      document.querySelector(idReference + "--hr").style.display = "block";
    } else {
      document.querySelector(idReference + "--hr").style.display = "none";
    }
  }

  // Perform a pre-define search for games
  gamesFunction() {
    // game search now uses the normal search menu and just fills it with "Tales of"
    var searchBox = document.querySelector("#nav-bar__searchbox");
    if (searchBox == null) {
      return;
    }

    let a = searchBox.getElementsByClassName("button__redirect");
    for (let i = 0; i < a.length; i++) {
      a[i].style.display = "none";
    }
    document.querySelector("#nav-bar__search--hr").style.display = "none";
    this.navLock = false;

    let inputField = document.querySelector("#nav-bar__search--input");
    let filter = "Tales of";
    inputField.value = filter;
    // call the current keyup event of the inputField
    inputField.focus();
  }

  // Fill search results based on loaded games
  fillSearch() {
    // Get all items on the tab bar
    var searchContents1L = [];
    var searchContents1 = "";
    var searchContents2L = [];
    var searchContents2 = "";
    var searchResults = document.querySelector("#nav-bar__searchbox");

    // Insert a hidden hr on the first slot of the search
    let hrElem = "<hr id='nav-bar__search--hr'  tabindex='0' style='display: none;'>";
    searchResults.insertAdjacentHTML("beforeend", hrElem);

    // Tech pages are created by the parser. main saves that and uses it to create the search object
    for (const [key, techDocument] of this.techPages.entries()) {
      if (key.dim === "N/A" || key.document.includes("-C") || key.document.includes("-B")) {
        continue; // Skip items with dim as "N/A" (like readme)
      }

      // Create the game instance to add to the nav-bar
      const parser = new DOMParser();

      // Now are read the content to use for the search functionality on the nav-bar
      const doc = parser.parseFromString(techDocument, "text/html");

      // Get all h1, h3, and h4 elements in the order they appear in the document
      const headings1 = doc.querySelectorAll("h1");

      // H1s have different styling. Additionally, they should appear first in the list
      headings1.forEach((currentHeading) => {
        searchContents1 = "";
        searchContents1 = searchContents1.concat('<div data-document="');
        searchContents1 = searchContents1.concat(key.document);
        searchContents1 = searchContents1.concat('" class="nav-bar__search--results button__redirect" tabindex="0" data-section="');
        searchContents1 = searchContents1.concat(key.section);
        searchContents1 = searchContents1.concat('" data-tag="game"><span class="nav-bar__search--results--games material-symbols-rounded"> sports_esports </span><b>');
        searchContents1 = searchContents1.concat(key.section);
        searchContents1 = searchContents1.concat("</b> </div>");
        searchContents1L.push(searchContents1);
      });

      const headings2 = doc.querySelectorAll("h1, h2, h3, h4");

      // Process each heading in the order they appear
      let currentH2 = null;
      headings2.forEach((currentHeading) => {
        if (currentHeading.tagName === "H1") {
          // No need to treat h1s again
          currentH2 = null;
        } else {
          if (currentHeading.tagName === "H2") {
            currentH2 = currentHeading.id;
          }
          if ((currentH2 === "glitches" || currentH2 === "techniques") && currentHeading.id !== "general-techniques" && currentHeading.tagName !== "H2") {
            searchContents2 = "";
            searchContents2 = searchContents2.concat('<div data-document="');
            searchContents2 = searchContents2.concat(key.document);
            searchContents2 = searchContents2.concat('" class="nav-bar__search--results button__redirect" tabindex="0" data-section="');
            searchContents2 = searchContents2.concat(key.section);
            searchContents2 = searchContents2.concat('" data-tag="tech" data-redirect="#');
            searchContents2 = searchContents2.concat(currentHeading.id);
            searchContents2 = searchContents2.concat('"><span class="nav-bar__search--results--games material-symbols-rounded"> book_2 </span><b>');
            searchContents2 = searchContents2.concat(key.document);
            searchContents2 = searchContents2.concat("</b> <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
            searchContents2 = searchContents2.concat(currentHeading.textContent);
            searchContents2 = searchContents2.concat("</div>");
            searchContents2L.push(searchContents2);
          }
        }
      });
    }
    // Sort the search results
    searchContents1L.sort();
    searchContents2L.sort();
    searchContents1 = searchContents1L.join("");
    searchContents2 = searchContents2L.join("");
    // Join searchContents1 and searchContests2
    let searchContents = searchContents1.concat(searchContents2);
    // Insert the HTML on the search bar
    searchResults.insertAdjacentHTML("beforeend", searchContents);
    searchContents = "";
    document.querySelectorAll("div.nav-bar__search--results").forEach((item) => {
      this.addPageChangeEvent(item);
    });
  }

  // --- Show all headings for a specific ID
  revealID(id) {
    // Gets the object of the provided ID
    let targetHeading = document.getElementById(id);
    if (targetHeading == null) {
      // Target hidden within an h2 section -- first we need to open it
      //   get h2 section from session storage
      let h2Collection = JSON.parse(sessionStorage.getItem("h2Collection"));
      let h2Section = 0;
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
                "expand_circle_down"
              ) {
                target.parentNode.firstElementChild.firstChild.innerHTML =
                  "expand_circle_up";
              }
            } else {
              // Target is one level higher if a tagging div was used
              if (
                target.parentNode.parentNode.firstElementChild.firstChild
                  .innerHTML == "expand_circle_down"
              ) {
                target.parentNode.parentNode.firstElementChild.firstChild.innerHTML =
                  "expand_circle_up";
              }
            }
          }
        }
      });
    }
  }
}
