// ---------
// toc.js is the table of content functionality for tech pages
//   there are two parts, the one that appears on the side, and another which is in the section-container (helps with mobile)

export class TOC {
  constructor(helperObj) {
    this.headings = [];
    this.ticking = false;
    this.currentSection = null;
    this.inTechPage = false;
    this.helperObj = helperObj;

    // Enable smart section highlighing based on scroll position
    //   bind the scroll event listener
    document.addEventListener("scroll", (event) => {
      if (!this.ticking && this.inTechPage) {
        window.requestAnimationFrame(() => {
          this.highlightTOC();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }

  // Update functions
  updateStatus(section, tech) {
    this.currentSection = section;
    this.inTechPage = tech;
  }

  clearHeadings() {
    this.headings = [];
  }

  // Creates the TOC based on the provided document. Only for tech pages (looks off when used with something like readme)
  //   this, however, requires a strict styling format for the markdown file 
  createTOC(currentDocument) {
    // Check if tocborder already exists
    let tocBorder = document.getElementById("content__tocborder");
    let selector = null;
    let content = null;
    let toc = null;
    let tocMobile = null;
    // Not used for now
    let h2Title = null;

    if (tocBorder == null) {
      // Check if it is a tech page by searching for an active h2 (class == content__selectorbox--item selected)
      let techPage = document.querySelector(".content__selectorbox--item.selected");
      if (techPage == null) {
        return;
      } else {
        // Title is the content of the div
        h2Title = techPage.textContent;
      }
      // Gets div of id content and creates a new div as children
      content = document.getElementById("content");
      tocBorder = document.createElement("div");
      tocBorder.id = "content__tocborder";
      content.appendChild(tocBorder);
      toc = document.createElement("div");
      toc.id = "content__toc";
      tocMobile = document.createElement("div");
      tocMobile.id = "content__tocmobile";
      tocBorder.appendChild(toc);
      // Set TOC y location just after #content__selector
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
      this.helperObj.dragScrollElement(("#" + tocIconBox.id), 1);
      this.helperObj.dragScrollElement(("#" + toc.id), 1);
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
    // Set TOCborder size to content size - offset
    tocBorder.style.height = "calc(100% - " + (selector.offsetTop + 150) + "px)";
    // Add content to TOC
    let tocContent = "<p>— On this section:</p><hr>";
    toc.innerHTML = tocContent;
    tocMobile.innerHTML = tocContent;
    // - Scan headings (h3s and h4s) on #content__currenth2, creates objects with name, clientY, isH3 or isH4, and parent (if H4)
    this.headings = [];
    let h3s = document.querySelectorAll("#content__currenth2 h3");
    let h4s = document.querySelectorAll("#content__currenth2 h4");
    for (let h3 of h3s) {
      this.headings.push({
        name: h3.textContent,
        clientY: h3.getBoundingClientRect().top,
        isH3: true,
        obj: h3,
        id: h3.id
      });
    }
    for (let h4 of h4s) {
      this.headings.push({
        name: h4.textContent,
        clientY: h4.getBoundingClientRect().top,
        isH3: false,
        obj: h4,
        id: h4.id
      });
    }
    // - Sort the objects by clientY
    this.headings.sort((a, b) => a.clientY - b.clientY);

    // - Create a list of links to the headings
    let tocLinks = "";
    for (let heading of this.headings) {
      let link = '<div data-document="' + currentDocument + '" data-section="' + this.currentSection + '" data-redirect="#' + heading.id + '" class="content__toc--search button__redirect" style="display: block;';
      if (!(heading.isH3)) {
        link = link.concat('padding-left: 30px; font-size: 13px; padding-top: 6px; padding-bottom: 6px;');
      }
      link = link.concat('">' + heading.name);
      link = link.concat("</div>");
      tocLinks = tocLinks.concat(link);
    }
    // - Add the list to the TOC
    toc.innerHTML = tocContent.concat(tocLinks);
    tocMobile.innerHTML = tocContent.concat(tocLinks);
  }

  highlightTOC() {
    // Check which H3 is the current one based on scrollPos & headings and hide all other h4s that are not theirs
    let currentH3 = null;
    let currentH3Index = 0;
    let nextH3Index = 0;
    for (let i = 0; i < this.headings.length; i++) {
      if (this.headings[i].isH3) {
        // Highlight the new section if it makes part of 75% of the page (25% of the top) or if it within 150px
        if (this.headings[i].obj.getBoundingClientRect().top <= Math.max((window.innerHeight * 0.25), 150) || (currentH3 == null)) {
          currentH3 = this.headings[i];
          currentH3Index = i;
        } else {
          nextH3Index = i;
          break;
        }
      }
    }

    // Hide SEARCH h4s (display: none) before and after the indexes and show (display:block) the ones between
    for (let i = 0; i < this.headings.length; i++) {
      if (!(this.headings[i].isH3)) {
        if ((i >= currentH3Index && i <= nextH3Index) || (nextH3Index == 0 && currentH3Index > 0 && i >= currentH3Index) || (nextH3Index == 0 && currentH3Index == 0)) {
          let searchH4 = document.querySelectorAll('.content__toc--search[data-redirect="#' + this.headings[i].id + '"]');
          for (let search of searchH4) {
            search.style.display = "block";
          }
        } else {
          let searchH4 = document.querySelectorAll('.content__toc--search[data-redirect="#' + this.headings[i].id + '"]');
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

  // Completely remove the TOC
  clearSectionTOC() {
    let tocIcon = document.getElementById("content__tocicon");
    if (tocIcon != null) {
      tocIcon.remove();
    }
    let tocBox = document.getElementById("content__tocicon--box");
    if (tocBox != null) {
      tocBox.remove();
    }
  }
}