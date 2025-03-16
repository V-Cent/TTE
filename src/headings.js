// ---
// headings.js contains styling functions for headings. ex: ## ### ####
//   used a lot in tech documents. This also saves something in storage that can be used to make section specific styling

export class Headings {
  constructor(helperObj) {
    // Blue is currently unused.
    this.colorCollection = [
      ["yellow", "#f8d959"],
      ["pink", "#fe796f"],
      ["teal", "#45c9c9"],
      ["green", "#58f15b"],
      ["red", "#e74a41"],
      ["lavender", "#c8a2b0"],
      ["blue", "#205aaa"],
    ];
    this.mouseDown = false;
    // h2Collection will have every data for each section, that way we can load each one individually
    this.h2Collection = [];
    this.startX = 0;
    this.scrollLeft = 0;
    this.helperObj = helperObj;
  }

  returnH2Collection() {
    return this.h2Collection;
  }

  // Adds collapse functionality to headings
  //   for ##, it also split them into unique sections
  collapseHeadings(page) {
    this.h2Collection = [];
    let currentH4 = null;
    let currentH3 = null;
    let currentH2 = null;
    let currentH2Text = "";
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
          currentHTML[i].indexOf('h4 id="') + 7,
        );
        currentH4 = currentH4.substring(0, currentH4.indexOf('"'));

        // Starts a div for the current heading, divided into title and content
        newInner = newInner + '<div class="content__h4">' + "\n";
        // Injects the search tags into the h4 --> just after the end of id
        let injectionIndex =
          currentHTML[i].indexOf('h4 id="') + 7 + currentH4.length + 1;
        let injectedSearch =
          ' data-open="' + currentH4 + " " + currentH3 + " " + currentH2 + '"';
        let newH4 =
          currentHTML[i].substr(0, injectionIndex) +
          injectedSearch +
          currentHTML[i].substr(injectionIndex);
        newInner = newInner + newH4 + "\n";
        newInner = newInner + '<div class="' + currentH4 + '">' + "\n";
      } else if (currentHTML[i].includes('h3 id="')) {
        // Close the div if a h4 or h3 is in progress
        if (currentH4) {
          newInner = newInner + "</div></div>" + "\n";
          currentH4 = null;
        }
        if (currentH3) {
          newInner =
            newInner +
            '<hr class="content__h3--divider" draggable="false" />' +
            "</div></div>" +
            "\n";
        }

        // Finding reference ID (the id from the original heading)
        currentH3 = currentHTML[i].substring(
          currentHTML[i].indexOf('h3 id="') + 7,
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
          // Save all content so far to the h2
          this.h2Collection.push([currentH2, currentH2Text, newInner]);
          newInner = "";
        }

        // Finding reference ID (the id from the original heading)
        currentH2 = currentHTML[i].substring(
          currentHTML[i].indexOf('h2 id="') + 7,
        );
        currentH2 = currentH2.substring(0, currentH2.indexOf('"'));

        // Find text so we can replicate the heading but without the id (moved to div)
        currentH2Text = currentHTML[i].substring(
          currentHTML[i].indexOf('">') + 2,
        );
        currentH2Text = currentH2Text.substring(
          0,
          currentH2Text.indexOf("</h2>"),
        );

        // Starts a div for the current heading, divided into title and content
        newInner =
          newInner + '<div class="content__h2" id="' + currentH2 + '">' + "\n";
        //newInner = newInner + '<h2>' + currentH2Text + "</h2>" + "\n";
        newInner = newInner + '<div class="' + currentH2 + '">' + "\n";
      } else {
        if (firstH2) {
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
      this.h2Collection.push([currentH2, currentH2Text, newInner]);
      newInner = "";
    }

    var selectionTab =
      '<div id="content__selector"><div id="content__selectorbox">';

    // Based on h2Collection, create the individual tabs. Styling based on hardcoded values (colorCollection)
    let i = 0;
    while (i < this.h2Collection.length) {
      let h2Tag = this.h2Collection[i][0];
      let h2Text = this.h2Collection[i][1];
      let h2Color = this.colorCollection[i % this.colorCollection.length];

      // --- Create the tab
      selectionTab =
        selectionTab +
        '<div class="content__selectorbox--item" data-open="' +
        h2Tag +
        '" data-highlight="' +
        h2Color[1] +
        '">';
      selectionTab = selectionTab + h2Text + "</div>";

      // --- Add h2Color as extra parameters to h2Collection
      this.h2Collection[i].push(h2Color);

      // --- Next loop
      i++;
    }

    // Save to session storage, used in search
    sessionStorage.setItem("h2Collection", JSON.stringify(this.h2Collection));

    selectionTab = selectionTab + '</div><hr id="content__selectorhr"></hr>';

    var mobileChevrons =
      '<div id="content__mobilechevrons"><span class="content__mobilechevrons--left material-symbols-rounded">chevron_backward</span><span class="content__mobilechevrons--right material-symbols-rounded">chevron_forward</span></div></div><div id="content__currenth2"></div>';

    if (this.h2Collection.length > 0) {
      page.innerHTML = newHeading + selectionTab + mobileChevrons;
    } else {
      page.innerHTML = newHeading;
    }

    this.helperObj.dragScrollElement("#content__selectorbox", 0);

    this.setupChevrons();

    contentElem.style.visibility = "visible";
  }

  setupChevrons() {
    // TODO : this could probably use a refactor later
    // Get all three elements
    let chevronBox = document.getElementById("content__mobilechevrons");
    let chevronLeft = document.getElementsByClassName(
      "content__mobilechevrons--left",
    )[0];
    let chevronRight = document.getElementsByClassName(
      "content__mobilechevrons--right",
    )[0];

    // check if any item in content__selectorbox is out-of-bounds. If yes, enable the chevronBox
    let selectorBox = document.getElementById("content__selectorbox");
    let selectorBoxWidth = selectorBox.clientWidth;
    let selectorBoxScrollWidth = selectorBox.scrollWidth;
    if (selectorBoxWidth < selectorBoxScrollWidth) {
      chevronBox.style.display = "block";
      chevronBox.style.left =
        selectorBox.getBoundingClientRect()["right"] + "px";
    } else {
      chevronBox.style.display = "none";
    }

    // Add an event to window to check when it is resized to see if enabling the chevronBox is needed
    window.addEventListener(
      "resize",
      function () {
        let selectorBox = document.getElementById("content__selectorbox");
        if (selectorBox == null) {
          return;
        }
        let chevronBox = document.getElementById("content__mobilechevrons");
        let selectorBoxWidth = selectorBox.clientWidth;
        let selectorBoxScrollWidth = selectorBox.scrollWidth;
        let chevronLeft = document.getElementsByClassName(
          "content__mobilechevrons--left",
        )[0];
        let chevronRight = document.getElementsByClassName(
          "content__mobilechevrons--right",
        )[0];
        if (selectorBoxWidth < selectorBoxScrollWidth) {
          chevronBox.style.display = "block";
          chevronBox.style.left =
            selectorBox.getBoundingClientRect()["right"] + "px";
          let sBoxScrollLeft = selectorBox.scrollLeft;
          if (sBoxScrollLeft > 0) {
            chevronLeft.classList.add("active");
          }
          if (
            sBoxScrollLeft <
            selectorBox.scrollWidth - selectorBox.offsetWidth
          ) {
            chevronRight.classList.add("active");
          }
        } else {
          chevronBox.style.display = "none";
        }
      },
      true,
    );

    // the buttons become active if they're not at the end of their scrolls
    let sBoxScrollLeft = selectorBox.scrollLeft;
    if (sBoxScrollLeft > 0) {
      chevronLeft.classList.add("active");
    }
    if (sBoxScrollLeft < selectorBox.scrollWidth - selectorBox.offsetWidth) {
      chevronRight.classList.add("active");
    }

    // Add event listeners to the chevrons -- if they are enabled they scroll to their direction by selectorBoxWidth
    chevronLeft.addEventListener(
      "click",
      function () {
        let chevronLeft = document.getElementsByClassName(
          "content__mobilechevrons--left",
        )[0];
        let chevronRight = document.getElementsByClassName(
          "content__mobilechevrons--right",
        )[0];
        let selectorBox = document.getElementById("content__selectorbox");
        let selectorBoxWidth = selectorBox.offsetWidth;

        let leftActive = chevronLeft.classList.contains("active");
        let rightActive = chevronRight.classList.contains("active");
        if (leftActive) {
          if (selectorBox.scrollLeft - selectorBoxWidth <= 0) {
            selectorBox.dataset.isScrolling = "true";
            chevronLeft.classList.remove("active");
            setTimeout(function () {
              let selectorBox = document.getElementById("content__selectorbox");
              selectorBox.dataset.isScrolling = "false";
            }, 700);
            leftActive = false;
          }
          selectorBox.scrollTo({
            left: selectorBox.scrollLeft - selectorBoxWidth,
            behavior: "smooth",
          });
          if (!rightActive) {
            chevronRight.classList.add("active");
          }
        }
      },
      true,
    );

    chevronRight.addEventListener(
      "click",
      function () {
        let chevronLeft = document.getElementsByClassName(
          "content__mobilechevrons--left",
        )[0];
        let chevronRight = document.getElementsByClassName(
          "content__mobilechevrons--right",
        )[0];
        let selectorBox = document.getElementById("content__selectorbox");
        let selectorBoxWidth = selectorBox.offsetWidth;

        let rightActive = chevronRight.classList.contains("active");
        let leftActive = chevronLeft.classList.contains("active");
        if (rightActive) {
          // Get the last child element
          if (
            selectorBox.scrollLeft + selectorBoxWidth + selectorBoxWidth >=
            selectorBox.scrollWidth
          ) {
            selectorBox.dataset.isScrolling = "true";
            chevronRight.classList.remove("active");
            setTimeout(function () {
              let selectorBox = document.getElementById("content__selectorbox");
              selectorBox.dataset.isScrolling = "false";
            }, 700);
            rightActive = false;
          }
          selectorBox.scrollTo({
            left: selectorBox.scrollLeft + selectorBoxWidth,
            behavior: "smooth",
          });
          if (!leftActive) {
            chevronLeft.classList.add("active");
            leftActive = true;
          }
        }
      },
      true,
    );

    // add a scroll event to the selector box to disable/enable scroll when the user scrolls themselves
    selectorBox.addEventListener(
      "scroll",
      function () {
        let chevronLeft = document.getElementsByClassName(
          "content__mobilechevrons--left",
        )[0];
        let chevronRight = document.getElementsByClassName(
          "content__mobilechevrons--right",
        )[0];
        let selectorBox = document.getElementById("content__selectorbox");
        let selectorBoxWidth = selectorBox.offsetWidth;

        if (selectorBox.dataset.isScrolling != undefined) {
          if (selectorBox.dataset.isScrolling == "true") {
            return;
          }
        }

        let leftActive = chevronLeft.classList.contains("active");
        let rightActive = chevronRight.classList.contains("active");

        if (selectorBox.scrollLeft <= 0) {
          chevronLeft.classList.remove("active");
        } else if (!leftActive) {
          chevronLeft.classList.add("active");
        }

        if (
          selectorBox.scrollLeft >=
          selectorBox.scrollWidth - selectorBoxWidth
        ) {
          chevronRight.classList.remove("active");
        } else if (!rightActive) {
          chevronRight.classList.add("active");
        }
      },
      true,
    );
  }

  // This is the collapse event for when you click the icon for an h3
  collapseHeadingStyle(event) {
    // Check the tags related to the current button
    let openTags = event.currentTarget.dataset.open.split(" ");
    for (let i = 0; i < openTags.length; i++) {
      let targetList = document.getElementsByClassName(openTags[i]);
      // Get all objects that are possibly hidden
      for (let target of targetList) {
        if (target.hidden) {
          target.hidden = false;
          // Change the button depending on the current art
          if (
            event.currentTarget.firstChild.innerHTML == "expand_circle_down"
          ) {
            event.currentTarget.firstChild.innerHTML = "expand_circle_up";
          }
        } else if (i == 0) {
          // Only hide if click target is the current heading level and is currently not hidden.
          target.hidden = true;
          // Change the button depending on the current art
          if (event.currentTarget.firstChild.innerHTML == "expand_circle_up") {
            event.currentTarget.firstChild.innerHTML = "expand_circle_down";
          }
        }
      }
    }
  }
}
