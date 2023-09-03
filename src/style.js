// style.js contains most of the cosmetic functions.

// TODO - VS recomments this being a class... Maybe? Also is a table .js file needed?
export function sortTables() {
  var getCellValue = function (tr, idx) {
    return tr.children[idx].innerText || tr.children[idx].textContent;
  };

  var comparer = function (idx, asc) {
    return function (a, b) {
      return (function (v1, v2) {
        return v1 !== "" && v2 !== "" && !isNaN(v1) && !isNaN(v2)
          ? v1 - v2
          : v1.toString().localeCompare(v2);
      })(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
    };
  };

  document.querySelectorAll("th").forEach((th) =>
    th.addEventListener("click", () => {
      const table = th.closest("table");
      const tbody = table.querySelector("tbody");
      Array.from(tbody.querySelectorAll("tr"))
        .sort(
          comparer(
            Array.from(th.parentNode.children).indexOf(th),
            (this.asc = !this.asc)
          )
        )
        .forEach((tr) => tbody.appendChild(tr));
    })
  );
}

export function treatSpoilers() {
  document.querySelectorAll(".spoiler").forEach((spoilerElement) => {
    spoilerElement.addEventListener("click", (event) => {
      event.target.style.background = "transparent";
    });
  });
}

export function styleImages() {
  var imageList = document.getElementsByTagName("img");
  var contentElement = document.getElementById("content");
  var i;
  for (var i = 0; i < imageList.length; i++) {
    if (contentElement.contains(imageList[i])) {
      imageList[i].classList.add("content__figure");
    }
  }
}

// --- Functions related to checkbox customization

export function styleCheckboxes() {
  //Add a line-through to each checked input
  document.querySelectorAll("input").forEach((taggedElement) => {
    if (taggedElement.checked) {
      taggedElement.parentElement.style.textDecorationLine = "line-through";
    }
  });
}

// --- Function for collapsing headers on tech documents
export function collapseHeaders(page) {
  let currentH4 = null;
  let currentH3 = null;
  let currentH2 = null;
  let newInner = "";
  let currentHTML = page.innerHTML.split("\n");
  for (let i = 0; i < currentHTML.length; i++) {
    // Iterates over all the lines from the created HTML and uses it to create a new document with collapsing headers
    if (currentHTML[i].includes('h4 id="')) {
      // Close the div if a h4 is in progress
      if (currentH4) {
        newInner = newInner + "</div></div>" + "\n";
      }

      // Finding reference ID (the id from the original header)
      currentH4 = currentHTML[i].substring(
        currentHTML[i].indexOf('h4 id="') + 7
      );
      currentH4 = currentH4.substring(0, currentH4.indexOf('"'));

      // Starts a div for the current header, divided into title and content
      newInner = newInner + '<div class="content__h4">' + "\n";
      newInner =
        newInner +
        '<button class="content__collapse" data-open="' +
        currentH4 +
        " " +
        currentH3 +
        " " +
        currentH2 +
        '"><span class="material-icons md-light md-36">remove</span></button>';
      newInner = newInner + currentHTML[i] + "\n";
      newInner = newInner + '<div class="' + currentH4 + '">' + "\n";
    } else if (currentHTML[i].includes('h3 id="')) {
      // Close the div if a h4 or h3 is in progress
      if (currentH4) {
        newInner = newInner + "</div></div>" + "\n";
        currentH4 = null;
      }
      if (currentH3) {
        newInner = newInner + "</div></div>" + "\n";
      }

      // Finding reference ID (the id from the original header)
      currentH3 = currentHTML[i].substring(
        currentHTML[i].indexOf('h3 id="') + 7
      );
      currentH3 = currentH3.substring(0, currentH3.indexOf('"'));

      // Starts a div for the current header, divided into title and content
      newInner = newInner + '<div class="content__h3">' + "\n";
      newInner =
        newInner +
        '<button class="content__collapse" data-open="' +
        currentH3 +
        " " +
        currentH2 +
        '"><span class="material-icons md-light md-36">expand_more</span></button>';
      newInner = newInner + currentHTML[i] + "\n";
      newInner = newInner + '<div class="' + currentH3 + '" hidden>' + "\n";
    } else if (
      currentHTML[i].includes('h2 id="') &&
      !currentHTML[i].includes("table-of-contents")
    ) {
      // Close the div if a h4, h3 or h2 is in progress
      if (currentH4) {
        newInner = newInner + "</div></div>" + "\n";
        currentH4 = null;
      }
      if (currentH3) {
        newInner = newInner + "</div></div>" + "\n";
        currentH3 = null;
      }
      if (currentH2) {
        newInner = newInner + "</div></div>" + "\n";
      }

      // Finding reference ID (the id from the original header)
      currentH2 = currentHTML[i].substring(
        currentHTML[i].indexOf('h2 id="') + 7
      );
      currentH2 = currentH2.substring(0, currentH2.indexOf('"'));

      // Starts a div for the current header, divided into title and content
      newInner = newInner + '<div class="content__h2">' + "\n";
      newInner =
        newInner +
        '<button class="content__collapse" data-open="' +
        currentH2 +
        '"><span class="material-icons md-light md-36">expand_less</span></button>';
      newInner = newInner + currentHTML[i] + "\n";
      newInner = newInner + '<div class="' + currentH2 + '">' + "\n";
    } else {
      newInner = newInner + currentHTML[i] + "\n";
    }
  }
  // Closes divs if any is still open
  if (currentH4) {
    newInner = newInner + "</div></div>" + "\n";
  }
  if (currentH3) {
    newInner = newInner + "</div></div>" + "\n";
  }
  if (currentH2) {
    newInner = newInner + "</div></div>" + "\n";
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
  for (let i = 0; i < openTags.length; i++) {
    targetList = document.getElementsByClassName(openTags[i]);
    // Get all objects that are possibly hidden
    for (let target of targetList) {
      if (target.hidden) {
        target.hidden = false;
        // Change the button depending on the current art
        if (event.currentTarget.firstChild.innerHTML == "expand_more") {
          event.currentTarget.firstChild.innerHTML = "expand_less";
        } else {
          event.currentTarget.firstChild.innerHTML = "remove";
        }
      } else if (i == 0) {
        // Only hide if click target is the current heading level and is currently not hidden.
        target.hidden = true;
        // Change the button depending on the current art
        if (event.currentTarget.firstChild.innerHTML == "expand_less") {
          event.currentTarget.firstChild.innerHTML = "expand_more";
        } else {
          event.currentTarget.firstChild.innerHTML = "add";
        }
      }
    }
  }
}
