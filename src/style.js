// style.js contains most of the cosmetic functions.

var colorCollection = [
  ["yellow", "#f8d959"],
  ["pink", "#fe796f"],
  ["teal", "#45c9c9"],
  ["green", "#58f15b"],
  ["red", "#e74a41"],
  ["blue", "#205aaa"]
];

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

// --- Function for collapsing headings on tech documents

var mouseDown = false;
var h2Collection = [];
var startX, scrollLeft;

export { h2Collection };

// TODO - buttons need to change
export function collapseHeadings(page) {
  h2Collection = [];
  let currentH4 = null;
  let currentH3 = null;
  let currentH2 = null;
  let newInner = "";
  let newHeading = "";
  let firstH2 = true;
  let currentHTML = page.innerHTML.split("\n");
  let contentElem = document.getElementById("content");
  for (let i = 0; i < currentHTML.length; i++) {
    // Iterates over all the lines from the created HTML and uses it to create a new document with collapsing headings
    if (currentHTML[i].includes('h4 id="')) {
      // Close the div if a h4 is in progress
      if (currentH4) {
        newInner = newInner + "</div></div>" + "\n";
      }

      // Finding reference ID (the id from the original heading)
      currentH4 = currentHTML[i].substring(
        currentHTML[i].indexOf('h4 id="') + 7
      );
      currentH4 = currentH4.substring(0, currentH4.indexOf('"'));

      // Starts a div for the current heading, divided into title and content
      newInner = newInner + '<div class="content__h4">' + "\n";
      // Removed button
      /*newInner =
        newInner +
        '<button class="content__collapse" data-open="' +
        currentH4 +
        " " +
        currentH3 +
        " " +
        currentH2 +
        '"><span class="material-symbols-rounded">remove</span></button>';*/
      // Injects the search tags into the h4 --> just after the end of id
      let injectionIndex = currentHTML[i].indexOf('h4 id="') + 7 + currentH4.length + 1;
      let injectedSearch = ' data-open="' + currentH4 + " " + currentH3 + " " + currentH2 +'"';
      let newH4 = currentHTML[i].substr(0, injectionIndex) + injectedSearch + currentHTML[i].substr(injectionIndex);
      newInner = newInner + newH4 + "\n";
      newInner = newInner + '<div class="' + currentH4 + '">' + "\n";
    } else if (currentHTML[i].includes('h3 id="')) {
      // Close the div if a h4 or h3 is in progress
      if (currentH4) {
        newInner = newInner + "</div></div>" + "\n";
        currentH4 = null;
      }
      if (currentH3) {
        newInner = newInner + '<hr class="content__h3--divider" draggable="false" />' + "</div></div>" + "\n";
      }

      // Finding reference ID (the id from the original heading)
      currentH3 = currentHTML[i].substring(
        currentHTML[i].indexOf('h3 id="') + 7
      );
      currentH3 = currentH3.substring(0, currentH3.indexOf('"'));

      // Starts a div for the current heading, divided into title and content
      newInner = newInner + '<div class="content__h3">' + "\n";
      newInner =
        newInner +
        '<button class="content__collapse" data-open="' +
        currentH3 +
        " " +
        currentH2 +
        '"><span class="material-symbols-rounded">expand_circle_up</span></button>';
      newInner = newInner + currentHTML[i] + "\n";
      newInner = newInner + '<div class="' + currentH3 + '">' + "\n";
    } else if (currentHTML[i].includes('h2 id="')) {
      // TODO For H2, create a selector div with the id of the h2container to un-hide
      // TODO   Mechanics is open by default
      // TODO Most things in this tab will change
      // TODO - so remove button, link id to div, make all default to display-none and show when clicked on the new bar?
      // Close the div if a h4, h3 or h2 is in progress
      firstH2 = false;
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
        h2Collection.push([currentH2, currentH2Text, newInner]);
        newInner = "";
      }

      // Finding reference ID (the id from the original heading)
      currentH2 = currentHTML[i].substring(
        currentHTML[i].indexOf('h2 id="') + 7
      );
      currentH2 = currentH2.substring(0, currentH2.indexOf('"'));

      // Find text so we can replicate the heading but without the id (moved to div)
      currentH2Text = currentHTML[i].substring(
        currentHTML[i].indexOf('">') + 2
      );
      currentH2Text = currentH2Text.substring(0, currentH2Text.indexOf('</h2>'));

      // Starts a div for the current heading, divided into title and content
      newInner = newInner + '<div class="content__h2" id="' + currentH2 + '">' + "\n";
      //newInner = newInner + '<h2>' + currentH2Text + "</h2>" + "\n";
      newInner = newInner + '<div class="' + currentH2 + '">' + "\n";
    } else {
      if (firstH2){
        // Within the first lines of the content. Save in another variable since a tab will be added after it
        newHeading = newHeading + currentHTML[i] + "\n";
      } else {
        // Normal text/tags within headings
        newInner = newInner + currentHTML[i] + "\n";
      }
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
    h2Collection.push([currentH2, currentH2Text, newInner]);
    newInner = "";
  }



  var selectionTab = '<div id="content__selector"><div id="content__selectorbox">';

  let i = 0;
  while (i < h2Collection.length){
    h2Tag = h2Collection[i][0];
    h2Text = h2Collection[i][1];
    h2Color = colorCollection[i % colorCollection.length];

    // --- Create the tab
    selectionTab = selectionTab + '<div class="content__selectorbox--item" data-open="' + h2Tag + '" data-highlight="' + h2Color[1] + '">';
    selectionTab = selectionTab + h2Text + '</div>';

    // --- Next loop
    i++;
  }

  selectionTab = selectionTab + '</div><hr id="content__selectorhr"></hr></div><div id="content__currenth2"></div>';

  if (h2Collection.length > 0){
      page.innerHTML = newHeading + selectionTab;
  } else {
      page.innerHTML = newHeading;
  }

  // TODO : Maybe make this generic so it also works with something like the TOC
  dragScrollElement('#content__selectorbox', 0);

  contentElem.style.visibility = "visible";

  // TODO add click events to the selection div
  // Open  h2Collection[0][0]
}

export function dragScrollElement(query, direction) {
  const sliderSelector = document.querySelector(query);

  let startDraggingX = function (e) {
    mouseDown = true;
    startX = e.pageX - sliderSelector.offsetLeft;
    if (isNaN(startX)) {
      startX = e.changedTouches[0].pageX - sliderSelector.offsetLeft;
    }
    scrollLeft = sliderSelector.scrollLeft;
  };

  let startDraggingY = function (e) {
    mouseDown = true;
    startY = e.pageY - sliderSelector.offsetTop;
    if (isNaN(startY)) {
      startY = e.changedTouches[0].pageY - sliderSelector.offsetTop;
    }
    scrollTop = sliderSelector.scrollTop;
  };

  let moveX = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if(!mouseDown) { return; }
    const x = e.pageX - sliderSelector.offsetLeft;
    const scroll = x - startX;
    if (isNaN(x)) {
      const x = e.changedTouches[0].pageX - sliderSelector.offsetLeft;
      const scroll = x - startX;
      sliderSelector.scrollLeft = scrollLeft - scroll;
    } else {
      sliderSelector.scrollLeft = scrollLeft - scroll;
    }
  };

  let moveY = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if(!mouseDown) { return; }
    const y = e.pageY - sliderSelector.offsetTop;
    const scroll = y - startY;
    if (isNaN(y)) {
      const y = e.changedTouches[0].pageY - sliderSelector.offsetTop;
      const scroll = y - startY;
      sliderSelector.scrollTop = scrollTop - scroll;
    } else {
      sliderSelector.scrollTop = scrollTop - scroll;
    }
  };

  let stopDragging = function (event) {
    mouseDown = false;
  };

  // Add the event listeners
  if (direction == 1){
    sliderSelector.addEventListener('mousemove', moveY, false);
    sliderSelector.addEventListener('mousedown', startDraggingY, false);
    sliderSelector.addEventListener('mouseup', stopDragging, false);
    sliderSelector.addEventListener('mouseleave', stopDragging, false);

    // For mobile
    sliderSelector.addEventListener('touchmove', moveY, false);
    sliderSelector.addEventListener('touchstart', startDraggingY, false);
    sliderSelector.addEventListener('touchend', stopDragging, false);
  } else {
    sliderSelector.addEventListener('mousemove', moveX, false);
    sliderSelector.addEventListener('mousedown', startDraggingX, false);
    sliderSelector.addEventListener('mouseup', stopDragging, false);
    sliderSelector.addEventListener('mouseleave', stopDragging, false);

    // For mobile
    sliderSelector.addEventListener('touchmove', moveX, false);
    sliderSelector.addEventListener('touchstart', startDraggingX, false);
    sliderSelector.addEventListener('touchend', stopDragging, false);
  }
}

// --- Function for click events on collapse icons
export function collapseHeadingStyle(event) {
  // Check the tags related to the current button
  let openTags = event.currentTarget.dataset.open.split(" ");
  for (let i = 0; i < openTags.length; i++) {
    targetList = document.getElementsByClassName(openTags[i]);
    // Get all objects that are possibly hidden
    for (let target of targetList) {
      if (target.hidden) {
        target.hidden = false;
        // Change the button depending on the current art
        if (event.currentTarget.firstChild.innerHTML == "expand_circle_down") {
          event.currentTarget.firstChild.innerHTML = "expand_circle_up";
        } else {
          event.currentTarget.firstChild.innerHTML = "remove";
        }
      } else if (i == 0) {
        // Only hide if click target is the current heading level and is currently not hidden.
        target.hidden = true;
        // Change the button depending on the current art
        if (event.currentTarget.firstChild.innerHTML == "expand_circle_up") {
          event.currentTarget.firstChild.innerHTML = "expand_circle_down";
        } else {
          event.currentTarget.firstChild.innerHTML = "add";
        }
      }
    }
  }
}
