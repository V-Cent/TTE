// news.js controls the news page.
// TODO - It can be a bit messy due to load orders. If image 1 is too heavy, the 3rd
// TODO -   news segment would be already loaded and the container would be created.
// TODO - I created a simple check to see who's last... But there might be a race condition here.

import { parseGFM } from "./parser.js";
import { addPageChangeEvent, updatePage } from "./page.js";

// --- Number of news pages
const newsNumber = 4;
var loadedNewsPages = 0;

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

export function loadNewsSection() {
  //Get the section text and update it to NEWS
  let sectionText = document.getElementById("section-container__text");
  sectionText.innerHTML = "NEWS";
  loadedNewsPages = 0;

  //Create a container for the cards to be added
  var cardContainer = '<div class="card-container">';
  var cardContents = "";

  //For each possible file (up to 3), parse their content and add the card to the container
  for (let index = newsNumber; index > newsNumber - 3 && index > 0; index--) {
    parseGFM("news/news" + index.toString()).then((newsPage) => {
      if (!!newsPage) {
        cardContents = cardContents.concat(parseNewsContent(newsPage, index));
        loadedNewsPages = loadedNewsPages + 1;
      }
      // To make sure we are on the last LOADED news segment. Check based on total number of news.
      if (
        (newsNumber >= 3 && loadedNewsPages == 3) ||
        (newsNumber < 3 && loadedNewsPages == newsNumber)
      ) {
        //Close the container and update the content block on the page
        cardContainer = cardContainer.concat(cardContents + "</div>");
        //Add the Load More button
        cardContainer = cardContainer.concat(
          '<div id="card-container__load-more"> Load More </div>'
        );
        let contentText = document.getElementById("content");
        contentText.innerHTML = cardContainer;

        //Add change page events for each card (to their respective pages)
        document.querySelectorAll(".card-container__figure").forEach((item) => {
          addPageChangeEvent(item);
        });
        //Add Load More event and update the page
        document
          .getElementById("card-container__load-more")
          .addEventListener("click", loadMoreNews);
        updatePage();
      }
    });
  }
}

// --- Function for the Load More button
function loadMoreNews() {
  //Gets the current card container
  var cardContainer = document.querySelector(".card-container");
  var cardContents = cardContainer.innerHTML;

  //Add up to three more cards to the container
  var leftoverPages = newsNumber - loadedNewsPages;
  var currentLoadedPages = 0;
  for (
    let index = leftoverPages;
    index > leftoverPages - 3 && index > 0;
    index--
  ) {
    parseGFM("news/news" + index.toString()).then((newsPage) => {
      if (!!newsPage) {
        cardContents = cardContents.concat(parseNewsContent(newsPage, index));
        loadedNewsPages = loadedNewsPages + 1;
        currentLoadedPages = currentLoadedPages + 1;
      }
      // To make sure we are on the last LOADED news segment. Check based on total number of news.
      if (
        (leftoverPages >= 3 && currentLoadedPages == 3) ||
        (leftoverPages < 3 && currentLoadedPages == leftoverPages)
      ) {
        if (loadedNewsPages == newsNumber) {
          let loadButton = document.getElementById("card-container__load-more");
          loadButton.removeEventListener("click", loadMoreNews, false);
          loadButton.style.filter = "brightness(1.25)";
          loadButton.style.opacity = "0.3";
        }
        cardContainer.innerHTML = cardContents;
        //Add change page events for each card (to their respective pages) and updates the page
        document.querySelectorAll(".card-container__figure").forEach((item) => {
          addPageChangeEvent(item);
        });
        updatePage();
      }
    });
  }
}
