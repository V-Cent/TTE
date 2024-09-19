
// ---------
// search.js controls the search actions and redirects

export class Search {
  constructor(techPages, addPageChangeEvent) {
    this.navLock = false;
    this.currentActiveSearch = null;
    this.techPages = techPages;
    this.addPageChangeEvent = addPageChangeEvent;
    this.searchBoxListener = this.searchBoxListener.bind(this);
  }

  // Init icons in the nav-bar
  initSearchIcons() {
    let searchLogo = document.querySelector("#nav-bar__search--icon");
    searchLogo.addEventListener("click", this.searchBoxListener);
    searchLogo.targetParam = "search";

    let gamesLogo = document.querySelector("#nav-bar__games--icon");
    gamesLogo.addEventListener("click", this.searchBoxListener);
    gamesLogo.targetParam = "games";

    // First create the HTML elements for each, then fill with the links
    this.createBoxes();
    this.fillSearch();
  }

  // Click event for the icons
  searchBoxListener() {
    if (this.navLock) {
      return;
    }
    let type = event.currentTarget.targetParam;
    this.currentActiveSearch = type;
    if (type == "search") {
      this.injectSearchBox("#nav-bar__search");
    } else {
      this.injectSearchBox("#nav-bar__games");
    }
    let searchCount = document.querySelector(".nav-bar__search--results");
    if (searchCount == null) {
      this.fillSearch();
    }
    if (type == "games") {
      let gamesBox = document.querySelector("#nav-bar__gamesbox");
      let children = gamesBox.children;
      for (let elem of children) {
        elem.style.display = "inline-block";
      }
      // TODO : check fillsearch function. Remove the following two lines when done
      document.querySelector("#nav-bar__games--hr2D").style.display = "none";
      document.querySelector("#nav-bar__games--hr3D").style.display = "none";
    }
  }

  // Creates a bunch of HTML to be used by search
  createBoxes() {
    let searchBase = document.createElement("div");
    let gamesBase = document.createElement("div");
    searchBase.id = "nav-bar__searchbox";
    gamesBase.id = "nav-bar__gamesbox";
    searchBase.style.width = "0px";
    gamesBase.style.width = "0px";
    gamesBase.tabIndex = "0";

    let searchInputField = document.createElement("input");
    searchInputField.id = "nav-bar__search--input";
    searchInputField.setAttribute("aria-label", "Search");
    searchBase.appendChild(searchInputField);

    let searchIconInst = document.querySelector("#nav-bar__search");
    searchIconInst.appendChild(searchBase);
    let gamesIconInst = document.querySelector("#nav-bar__games");
    gamesIconInst.appendChild(gamesBase);
    // Search has an input field which has a filter function when you type
    searchInputField.addEventListener("keyup", this.filterFunction);
    // If you focus out of the pop-ups for both icons they will dissapear
    //   things are cleared and css controls the animation
    searchInputField.addEventListener("focusout", (event) => {
      let searchField = document.querySelector("#nav-bar__search");
      event.stopPropagation();
      if (!(searchField.contains(event.relatedTarget))) {
        this.clearFunction();
      }
    });
    gamesBase.addEventListener("focusout", (event) => {
      let searchField = document.querySelector("#nav-bar__games");
      event.stopPropagation();
      if (!(searchField.contains(event.relatedTarget))) {
        this.clearFunction();
      }
    });
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
    var logoName = id + "--icon";
    var base = document.querySelector(baseName);
    var inputField = document.querySelector(inputName);

    base = document.querySelector(baseName);

    // Based on min mobile widths
    var searchboxWidth = 220;
    if (this.currentActiveSearch == "search"){
      if (document.body.clientWidth >= 480) {
        searchboxWidth = 360;
      }
    } else {
      searchboxWidth = 300;
    }
    base.style.width = searchboxWidth + "px";

    // Logo dissapears to show the box better
    let searchLogo = document.querySelector(logoName);
    searchLogo.className = "material-symbols-rounded logo-fadeout";
    searchLogo.removeEventListener("click", this.searchBoxListener);
    searchLogo.addEventListener("click", this.clearFunction);

    // Focus on the elemtents to use focusout to exit them
    if (this.currentActiveSearch == "search"){
      inputField = document.querySelector(inputName);
      inputField.focus();
    } else {
      base.focus();
    }

    base.className = "fadein";
  }

  // Clear everthing and then show the icon again
  clearFunction() {
    if (this.currentActiveSearch == null){
      return;
    }
    var a, i;
    // Function to hide all computed links
    var searchBox = document.querySelector("#nav-bar__searchbox");
    var gamesBox = document.querySelector("#nav-bar__gamesbox");
    if (searchBox == null || gamesBox == null) {
      return;
    }

    this.navLock = true;
    var referenceBox = null;
    this.currentActiveSearch == "search" ? referenceBox = searchBox : referenceBox = gamesBox;
    let referenceId = "#nav-bar__" + this.currentActiveSearch;

    if (this.currentActiveSearch == "search"){
      a = referenceBox.getElementsByClassName("button__redirect");
      for (i = 0; i < a.length; i++) {
        a[i].style.display = "none";
      }
      document.querySelector(referenceId + "--hr").style.display = "none";
      setTimeout(() => {
        searchBox.className = "fadeout";
        this.navLock = false;
      }, "300");
    } else {
      let figs = referenceBox.getElementsByTagName("figure");
      for (i = 0; i < figs.length; i++) {
        figs[i].style.display = "none";
      }
      document.querySelector(referenceId + "--hr2D").style.display = "none";
      document.querySelector(referenceId + "--hr3D").style.display = "none";
      setTimeout(() => {
        gamesBox.className = "fadeout";
        this.navLock = false;
      }, "300");
    }

    var searchLogo = document.querySelector(referenceId + "--icon");
    searchLogo.className = "material-symbols-rounded logo-fadein";
    searchLogo.removeEventListener("click", this.clearFunction);
    searchLogo.addEventListener("click", this.searchBoxListener);

    this.currentActiveSearch = null;
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
        // Hard limit of 6 options on screen
        if (searchCounter < 6 || this.currentActiveSearch == "games") {
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

  // Fill search results based on loaded games
  fillSearch() {
    // Get all items on the tab bar
    var searchContents1 = "";
    var searchContents2 = "";
    var game2DContents = "";
    var game3DContents = "";
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

    // Tech pages are created by the parser. main saves that and uses it to create the search object
    for (const [key, techDocument] of this.techPages.entries()) {
      if (key.dim === "N/A") {
        continue; // Skip items with dim as "N/A" (like readme)
      }

      // Create the game instance to add to the nav-bar
      const parser = new DOMParser();
      let gameContents = "";
      gameContents = gameContents.concat('<figure class="nav-bar__games--wrapper" data-document="');
      gameContents = gameContents.concat(key.document);
      gameContents = gameContents.concat('" data-dim="');
      gameContents = gameContents.concat(key.dim);
      gameContents = gameContents.concat('" tabindex="0" data-section="');
      gameContents = gameContents.concat(key.section);
      gameContents = gameContents.concat('"><figcaption>');
      gameContents = gameContents.concat(key.document);
      gameContents = gameContents.concat('</figcaption><img class="nav-bar__search--results" src="media/');
      gameContents = gameContents.concat(key.document.toLowerCase().trim());
      gameContents = gameContents.concat('/');
      gameContents = gameContents.concat(key.document.trim());
      gameContents = gameContents.concat('ICONs3.webp" alt="');
      gameContents = gameContents.concat(key.section);
      gameContents = gameContents.concat('"></img></figure>');

      if (key.dim === "2D") {
        let content2D = document.querySelector("#nav-bar__games--hr2D");
        // Inject AFTER 2D HR  "afterend" 2D HR
        content2D.insertAdjacentHTML("beforebegin", gameContents);
      } else {
        let content3D = document.querySelector("#nav-bar__games--hr3D");
        // Inject AFTER 3D HR
        content3D.insertAdjacentHTML("beforebegin", gameContents);
      }

      gameContents = "";
      document.querySelectorAll("figure.nav-bar__games--wrapper").forEach((item) => {
        this.addPageChangeEvent(item);
      });

      // Now are read the content to use for the search functionality on the nav-bar
      const doc = parser.parseFromString(techDocument, "text/html");

      // Get all h1, h3, and h4 elements in the order they appear in the document
      const headings1 = doc.querySelectorAll("h1");

      // H1s have different styling. Additionally, they should appear first in the list
      headings1.forEach((currentHeading) => {
        searchContents1 = searchContents1.concat('<div data-document="');
        searchContents1 = searchContents1.concat(key.document);
        searchContents1 = searchContents1.concat('" class="nav-bar__search--results button__redirect" tabindex="0" data-section="');
        searchContents1 = searchContents1.concat(key.section);
        searchContents1 = searchContents1.concat('" data-redirect="#');
        searchContents1 = searchContents1.concat(currentHeading.id);
        searchContents1 = searchContents1.concat('"><b>');
        searchContents1 = searchContents1.concat(key.section);
        searchContents1 = searchContents1.concat("</b> </div>");
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
          if ((currentH2 === "glitches" || currentH2 === "techniques") && currentHeading.id !== "general-techniques") {
            searchContents2 = searchContents2.concat('<div data-document="');
            searchContents2 = searchContents2.concat(key.document);
            searchContents2 = searchContents2.concat('" class="nav-bar__search--results button__redirect" tabindex="0" data-section="');
            searchContents2 = searchContents2.concat(key.section);
            searchContents2 = searchContents2.concat('" data-redirect="#');
            searchContents2 = searchContents2.concat(currentHeading.id);
            searchContents2 = searchContents2.concat('"><b>');
            searchContents2 = searchContents2.concat(key.document);
            searchContents2 = searchContents2.concat("</b> <br>&nbsp;&nbsp;&nbsp;");
            searchContents2 = searchContents2.concat(currentHeading.textContent);
            searchContents2 = searchContents2.concat("</div>");
          }
        }
      });
    }
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
}
