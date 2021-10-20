import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";
import gfm from "remark-gfm";
import slug from "remark-slug";
import toc from "remark-toc";
import math from "remark-math";
import katex from "rehype-katex";
import emoji from "remark-emoji";
import remarkImages from 'remark-images';
import directive from "remark-directive";
import visit from "unist-util-visit";
import h from "hastscript";
import hljs from "highlight.js";
import { loadTooltip, unloadTooltip } from "./visualEffects.js";

// --- Number of news pages
const newsNumber = 4;
var loadedNewsPages = 0;

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
function updatePage() {
  // Enable smooth scroll on hash links
  enableSmoothTOC();
  // Treat checkboxes
  styleCheckboxes();
  // Style code blocks
  hljs.highlightAll();
  // Treat custom directives
  compileTags();
  // Sort tables
  sortTables();
  // Treat spoiler tags
  treatSpoilers();
}

// --- Functions related to file parsing
function loadFile(filePath) {
  //XMLHTTP request for a file in the project folder (valid path needed). No need for CORS treatment since it is from the same source
  let result = null;
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status == 200) {
    result = xmlhttp.responseText;
  }
  //Return text result
  return result;
}

function parseGFM(file) {
  //Read GFM file
  let fileData = loadFile(file + ".md");
  if (fileData.length <= 1 || fileData == null) {
    return "";
  }
  let content = "";
  //Using the unified environment, transform the text GFM format to HTML to be injected into the page
  //Also supports LaTeX-like math, Table of Contents, custom directives, emojis...
  unified()
    .use(toc, { parents: ["root", "containerDirective"] })
    .use(markdown)
    .use(directive)
    .use(htmlDirectives)
    .use(gfm)
    .use(slug)
    .use(math)
    .use(remarkImages)
    .use(remark2rehype)
    .use(katex)
    .use(emoji)
    .use(stringify)
    .process(fileData, function (err, file) {
      if (err) {
        console.log(err);
      } else {
        content = file;
      }
    });
  //Return the HTML data
  return content;
}

// --- Functions related to custom directives
function htmlDirectives() {
  return transform;

  function transform(tree) {
    //For different directives on the tree, run onDirective()
    visit(
      tree,
      ["textDirective", "leafDirective", "containerDirective"],
      onDirective
    );
  }

  function onDirective(node) {
    //Gets data from the node
    let data = node.data || (node.data = {});
    let hast = h(node.name, node.attributes);

    //From that data, a new div will be created (or paragraph if no properties were given)
    if (hast.properties.length > 0) {
      data.hName = "div";
    } else {
      data.hName = "span";
    }
    //Assign tags and properties from node to the div, which will be used by other functions
    hast.properties = Object.assign({ class: hast.tagName }, hast.properties);
    data.hProperties = hast.properties;
  }
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

// --- Functions related to checkbox customization

function styleCheckboxes() {
  //Add a line-through to each checked input
  document.querySelectorAll("input").forEach((taggedElement) => {
    if (taggedElement.checked) {
      taggedElement.parentElement.style.textDecorationLine = "line-through";
    }
  });
}

// --- Functions related to the NEWS section
function parseNewsContent(page, number) {
  //Define DOMParser object and a placeholder for the content of each card on the NEWS section
  const parser = new DOMParser();
  let cardContents = "";

  //Parse the result from unified (parseGFM) into usable HTML
  const doc = parser.parseFromString(page, "text/html");

  //Get tags from the first child (first heading), which are saved as JSON
  let docTextData = doc.body.firstChild.dataset.tags;
  let docData = JSON.parse(docTextData.replace(/'/g, '"'));

  //Create the card HTML
  cardContents = cardContents.concat(
    '<figure class= "card-container__figure" data-document= "news/news'
  );
  cardContents = cardContents.concat(number);
  cardContents = cardContents.concat('" style="background-image: url(');
  cardContents = cardContents.concat(docData.media);
  cardContents = cardContents.concat(
    ');"><div class="card-container__date"><span class="card-container__date--day">'
  );
  cardContents = cardContents.concat(docData.dateDay);
  cardContents = cardContents.concat(
    '</span><span class="card-container__date--month">'
  );
  cardContents = cardContents.concat(docData.dateMonth);
  cardContents = cardContents.concat(
    '</span></div><figcaption class= "card-container__figure--caption"><h4> <span>'
  );
  cardContents = cardContents.concat(doc.body.firstChild.textContent);
  cardContents = cardContents.concat("</span></h4><p>");
  cardContents = cardContents.concat(docData.description);
  cardContents = cardContents.concat("</p></figcaption></figure>");

  //Return the full card HTML data
  return cardContents;
}

function loadNewsSection() {
  //Get the section text and update it to NEWS
  let sectionText = document.getElementById("section-container__text");
  sectionText.innerHTML = "NEWS";

  //Create a container for the cards to be added
  let cardContainer = '<div class="card-container">';
  let cardContents = "";

  //For each possible file (up to 3), parse their content and add the card to the container
  for (let index = newsNumber; ((index > (newsNumber - 3)) && (index > 0)); index--) {
    let newsPage = parseGFM(("news/news" + index.toString()));
    if (!!newsPage) {
      cardContents = cardContents.concat(parseNewsContent(newsPage, index));
    }
  }

  loadedNewsPages = 3;

  //Close the container and update the content block on the page
  cardContainer = cardContainer.concat(cardContents + "</div>");
  //Add the Load More button
  cardContainer = cardContainer.concat('<div id="card-container__load-more"> Load More </div>');
  let contentText = document.getElementById("content");
  contentText.innerHTML = cardContainer;

  //Add change page events for each card (to their respective pages)
  document.querySelectorAll(".card-container__figure").forEach((item) => {
    addPageChangeEvent(item);
  });
  //Add Load More event and update the page
  document.getElementById("card-container__load-more").addEventListener("click", loadMoreNews);
  updatePage();
}

// --- Function for the Load More button
function loadMoreNews() {
  //Gets the current card container
  let cardContainer = document.querySelector(".card-container");
  let cardContents = cardContainer.innerHTML;

  //Add up to three more cards to the container
  let leftoverPages = (newsNumber - loadedNewsPages);
  for (let index = leftoverPages;
       ((index > (leftoverPages - 3)) && (index > 0));
       index--) {
    let newsPage = parseGFM(("news/news" + index.toString()));
    if (!!newsPage) {
      cardContents = cardContents.concat(parseNewsContent(newsPage, index));
    }
    loadedNewsPages = loadedNewsPages + 1;
  }

  cardContainer.innerHTML = cardContents;
  //Add change page events for each card (to their respective pages) and updates the page
  document.querySelectorAll(".card-container__figure").forEach((item) => {
    addPageChangeEvent(item);
  });
  updatePage();
}

// --- Function for click events on the nav-bar
function addPageChangeEvent(item) {
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
    if (!(
      event.currentTarget.dataset.document == "NEWS" ||
      event.currentTarget.dataset.document.includes("./")
    )) {
      for (i = 0; i < tabLinks.length; i++) {
        if (tabLinks[i].dataset.document == event.currentTarget.dataset.document) {
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
        contentText.innerHTML = parseGFM((event.currentTarget.dataset.document).toLowerCase());
        //Clear search results
        clearFunction();
        //Update page
        updatePage();
      } else if (event.currentTarget.dataset.document.includes("./")) {
        sectionText.innerHTML = event.currentTarget.dataset.section;
        contentText.innerHTML = parseGFM(event.currentTarget.dataset.document);
        //Clear search results
        clearFunction();
        //Update page
        updatePage();
      } else {
        //Event is a tech document, set the section as the game name and update the content
        sectionText.innerHTML = event.currentTarget.dataset.section;
        contentText.innerHTML = parseGFM(("./tech/" + event.currentTarget.dataset.document).toLowerCase());
        collapseHeaders(contentText);
        //Clear search results
        clearFunction();
        //Update page
        updatePage();
        if (event.currentTarget.dataset.redirect != null) {
          //Event has a redirect location, collapse the headers if needed
          revealID(event.currentTarget.dataset.redirect.substring(1));
          document
            .querySelector(event.currentTarget.dataset.redirect)
            .scrollIntoView({
              behavior: "smooth",
            });
        }
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

// --- Function for collapsing headers on tech documents
function collapseHeaders(page) {
  let currentH4 = null;
  let currentH3 = null;
  let currentH2 = null;
  let newInner = ""
  let currentHTML = page.innerHTML.split("\n");
  for(let i = 0; i < currentHTML.length; i++){
    // Iterates over all the lines from the created HTML and uses it to create a new document with collapsing headers
    if (currentHTML[i].includes("h4")){
      // Close the div if a h4 is in progress
      if (currentH4){
        newInner = newInner + "</div></div>" + "\n"
      }

      // Finding reference ID (the id from the original header)
      currentH4 = currentHTML[i].substring((currentHTML[i].indexOf('h4 id="') + 7));
      currentH4 = currentH4.substring(0,currentH4.indexOf('"'));

      // Starts a div for the current header, divided into title and content
      newInner = newInner + '<div class="content__h4">' + "\n"
      newInner = newInner + '<button class="content__collapse" data-open="' + currentH4 + " " + currentH3 + " " + currentH2 + '"><span class="material-icons md-light md-36">remove</span></button>'
      newInner = newInner + currentHTML[i] + "\n"
      newInner = newInner + '<div class="' + currentH4 + '">' + "\n"
    } else if (currentHTML[i].includes("h3")){
      // Close the div if a h4 or h3 is in progress
      if (currentH4){
        newInner = newInner + "</div></div>" + "\n"
        currentH4 = null
      }
      if (currentH3){
        newInner = newInner + "</div></div>" + "\n"
      }

      // Finding reference ID (the id from the original header)
      currentH3 = currentHTML[i].substring((currentHTML[i].indexOf('h3 id="') + 7));
      currentH3 = currentH3.substring(0,currentH3.indexOf('"'));

      // Starts a div for the current header, divided into title and content
      newInner = newInner + '<div class="content__h3">' + "\n"
      newInner = newInner + '<button class="content__collapse" data-open="' + currentH3 + " " + currentH2 + '"><span class="material-icons md-light md-36">expand_more</span></button>'
      newInner = newInner + currentHTML[i] + "\n"
      newInner = newInner + '<div class="' + currentH3 + '" hidden>' + "\n"
    } else if (currentHTML[i].includes("h2") && !currentHTML[i].includes("table-of-contents")){
      // Close the div if a h4, h3 or h2 is in progress
      if (currentH4){
        newInner = newInner + "</div></div>" + "\n"
        currentH4 = null
      }
      if (currentH3){
        newInner = newInner + "</div></div>" + "\n"
        currentH3 = null
      }
      if (currentH2){
        newInner = newInner + "</div></div>" + "\n"
      }

      // Finding reference ID (the id from the original header)
      currentH2 = currentHTML[i].substring((currentHTML[i].indexOf('h2 id="') + 7));
      currentH2 = currentH2.substring(0,currentH2.indexOf('"'));

      // Starts a div for the current header, divided into title and content
      newInner = newInner + '<div class="content__h2">' + "\n"
      newInner = newInner + '<button class="content__collapse" data-open="' + currentH2 + '"><span class="material-icons md-light md-36">expand_more</span></button>'
      newInner = newInner + currentHTML[i] + "\n"
      newInner = newInner + '<div class="' + currentH2 + '" hidden>' + "\n"
    } else {
      newInner = newInner + currentHTML[i] + "\n"
    }
  }
  // Closes divs if any is still open
  if (currentH4){
    newInner = newInner + "</div></div>" + "\n"
  }
  if (currentH3){
    newInner = newInner + "</div></div>" + "\n"
  }
  if (currentH2){
    newInner = newInner + "</div></div>" + "\n"
  }
  page.innerHTML = newInner;

  // Adds click events for the buttons
  document.querySelectorAll(".content__collapse").forEach((button) => {
    button.addEventListener("click", collapseHeaderStyle);
  });
}

// --- Function for click events on collapse icons
function collapseHeaderStyle(event) {
  // Check the tags related to the current button
  let openTags = event.currentTarget.dataset.open.split(" ");
  for (let i =0; i < openTags.length; i++) {
    targetList = document.getElementsByClassName(openTags[i]);
    // Get all objects that are possibly hidden
    for (let target of targetList) {
      if (target.hidden){
        target.hidden = false;
        // Change the button depending on the current art
        if (event.currentTarget.firstChild.innerHTML == "expand_more"){
          event.currentTarget.firstChild.innerHTML = "expand_less";
        } else {
          event.currentTarget.firstChild.innerHTML = "remove";
        }
      } else if (i == 0) {
        // Only hide if click target is the current heading level and is currently not hidden.
        target.hidden = true;
        // Change the button depending on the current art
        if (event.currentTarget.firstChild.innerHTML == "expand_less"){
          event.currentTarget.firstChild.innerHTML = "expand_more";
        } else {
          event.currentTarget.firstChild.innerHTML = "add";
        }
      }
    }
  }
}

// --- Function for click events on the nav-bar
function enableSmoothTOC() {
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

// --- Show all headers for a specific ID
function revealID(id){
  // Gets the object of the provided ID
  targetHeader = document.getElementById(id);
  let hiddenItems = null
  // Gets the div that holds all the content for a given header
  if (targetHeader.parentNode.className.includes("content__")) {
    hiddenItems = targetHeader.parentNode.firstElementChild.dataset.open.split(" ");
  } else {
    // Div is one level higher if a tagging div was used
    hiddenItems = targetHeader.parentNode.parentNode.firstElementChild.dataset.open.split(" ");
  }
  // Iterates over all related classes needed to reveal a specific header
  hiddenItems.forEach(item => {
    let targetList = document.getElementsByClassName(item);
    // Get all objects that are possibly hidden
    for (let target of targetList) {
      if (target.hidden){
        target.hidden = false;
        // Change the button depending on the current art
        if (target.parentNode.className.includes("content__")) {
          if (target.parentNode.firstElementChild.firstChild.innerHTML == "expand_more"){
            target.parentNode.firstElementChild.firstChild.innerHTML = "expand_less";
          } else {
            target.parentNode.firstElementChild.firstChild.innerHTML = "remove";
          }
        } else {
          // Target is one level higher if a tagging div was used
          if (target.parentNode.parentNode.firstElementChild.firstChild.innerHTML == "expand_more"){
            target.parentNode.parentNode.firstElementChild.firstChild.innerHTML = "expand_less";
          } else {
            target.parentNode.parentNode.firstElementChild.firstChild.innerHTML = "remove";
          }
        }
      }
    }
  });
}

// -- Function for search on the nav-bar
function filterFunction() {
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

function clearFunction() {
  var a, i;
  // Function to hide all computed links
  div = document.querySelector("#nav-bar__search");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    a[i].style.display = "none";
  }
}

function fillSearch() {
  // Get all items on the tab bar
  var tabLinks = document.getElementsByClassName("nav-bar__tab-bar--links");
  var i = 0;
  let searchContents = "";
  for (i = 0; i < tabLinks.length; i++) {
    // Open the document related to each item
    let currentDocument = parseGFM("./tech/" + (tabLinks[i].dataset.document).toLowerCase());
    const parser = new DOMParser();

    // Add default page search
    searchContents = searchContents.concat('<a data-document="');
    searchContents = searchContents.concat(tabLinks[i].dataset.document);
    searchContents = searchContents.concat(
      '" class = "nav-bar__search--results" tabindex="0" data-section="'
    );
    searchContents = searchContents.concat(tabLinks[i].dataset.section);
    searchContents = searchContents.concat('"><b>');
    searchContents = searchContents.concat(tabLinks[i].dataset.section);
    searchContents = searchContents.concat("</b> <i>(");
    searchContents = searchContents.concat(tabLinks[i].dataset.document);
    searchContents = searchContents.concat(")</i></a>");

    // Parse the result from unified (parseGFM) into usable HTML
    const doc = parser.parseFromString(currentDocument, "text/html");
    doc.querySelectorAll("h4").forEach((currentHeading) => {
      searchContents = searchContents.concat('<a data-document="');
      // Create a link composed of the game name (short) and tech name and concat to the other links made by this function
      searchContents = searchContents.concat(tabLinks[i].dataset.document);
      searchContents = searchContents.concat(
        '" class = "nav-bar__search--results" tabindex="0" data-section="'
      );
      searchContents = searchContents.concat(tabLinks[i].dataset.section);
      searchContents = searchContents.concat('" data-redirect="#');
      searchContents = searchContents.concat(currentHeading.id);
      searchContents = searchContents.concat('"><b>');
      searchContents = searchContents.concat(tabLinks[i].dataset.document);
      searchContents = searchContents.concat("</b> - <i>");
      searchContents = searchContents.concat(currentHeading.textContent);
      searchContents = searchContents.concat("</i></a>");
    });
  }
  // Insert the HTML on the search bar
  let searchResults = document.querySelector("#nav-bar__search");
  searchResults.insertAdjacentHTML("beforeend", searchContents);
}

function sortTables() {
  var getCellValue = function(tr, idx){ return tr.children[idx].innerText || tr.children[idx].textContent; };

  var comparer = function(idx, asc) { return function(a, b) { return function(v1, v2) {
          return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2);
      }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
  }};

  document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
    const table = th.closest('table');
    const tbody = table.querySelector('tbody');
    Array.from(tbody.querySelectorAll('tr'))
      .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
      .forEach(tr => tbody.appendChild(tr) );
  })));
}

function treatSpoilers() {
  document.querySelectorAll(".spoiler").forEach((spoilerElement) => {
    spoilerElement.addEventListener("click", (event) => {
      event.target.style.background = "transparent";
    });
  });
}
