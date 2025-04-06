// ---------
// toc.js is the table of content functionality for tech pages
//   there are two modes, a side view on desktop and another inside an icon for mobile

import { Helper } from "./helper.ts";

interface Heading {
  name: string;
  clientY: number;
  isH3: boolean;
  obj: HTMLElement;
  id: string;
}

export class TOC {
  private headings: Heading[];
  private ticking: boolean;
  private helperObj: Helper;

  constructor(helperObj: Helper) {
    this.headings = [];
    this.ticking = false;
    this.helperObj = helperObj;

    // Enable smart section highlighting based on scroll position
    //   bind the scroll event listener
    document.addEventListener("scroll", () => {
      if (!this.ticking && this.helperObj.inTechPage) {
        window.requestAnimationFrame(() => {
          this.highlightTOC();
          this.ticking = false;
        });
        this.ticking = true;
      }
    });
  }

  // --- Clear headings variable
  clearHeadings(): void {
    this.headings = [];
  }

  // --- Creates the TOC based on the provided document. Only for tech pages (looks off when used with something like readme)
  //      this, however, requires a strict styling format for the markdown file
  createTOC(currentDocument: string): void {
    // Check if tocborder already exists
    let tocBorder: HTMLElement | null = document.getElementById("content__tocborder");
    let selector: HTMLElement | null = null;
    let content: HTMLElement | null = null;
    let toc: HTMLElement | null = null;
    let tocMobile: HTMLElement | null = null;

    if (tocBorder == null) {
      // Check if it is a tech page by searching for an active h2 (class == content__selectorbox--item selected)
      const techPage: HTMLElement | null = document.querySelector(
        ".content__selectorbox--item.selected",
      );
      if (techPage == null) {
        return;
      }

      // Gets div of id content and creates a new div as children
      content = document.getElementById("content");
      if (!content) return; // Ensure content exists

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
      if (!selector) return; // Ensure selector exists

      tocBorder.style.top = `${selector.offsetTop + content.offsetTop + 10}px`;

      // Also add an icon on the #section-container__div for mobile
      const tocIcon: HTMLElement = document.createElement("span");
      tocIcon.className = "material-symbols-rounded";
      tocIcon.id = "content__tocicon";
      tocIcon.innerHTML = "menu_book";
      tocIcon.style.display = "none";

      const sectionContainer: HTMLElement | null =
        document.getElementById("section-container__div");
      if (!sectionContainer) return; // Ensure sectionContainer exists

      sectionContainer.appendChild(tocIcon);

      // And a box so the ToC can be added to it
      const tocIconBox: HTMLElement = document.createElement("div");
      tocIconBox.id = "content__tocicon--box";
      tocIconBox.style.width = "0px";
      tocIconBox.tabIndex = 0; // Set tabindex so it can get focused
      sectionContainer.appendChild(tocIconBox);

      // Add the toc to the box
      tocIconBox.appendChild(tocMobile);
      this.helperObj.dragScrollElement(`#${tocIconBox.id}`, 1);
      this.helperObj.dragScrollElement(`#${toc.id}`, 1);

      // Add an event listener to the icon
      tocIcon.addEventListener("click", () => {
        const box: HTMLElement | null = document.getElementById("content__tocicon--box");
        if (!box) return; // Ensure box exists

        const boxWidth: number = document.body.clientWidth >= 480 ? 360 : 300;
        box.style.width = `${boxWidth}px`;
        box.className = "fadein";
        tocIconBox.style.display = "block";
        box.focus();
      });

      tocIconBox.addEventListener("focusout", (event: FocusEvent) => {
        const box: HTMLElement | null = document.getElementById("content__tocicon--box");
        if (!box) return; // Ensure box exists

        event.stopPropagation();
        box.className = "fadeout";
      });
    } else {
      selector = document.getElementById("content__selector");
      content = document.getElementById("content");
      toc = document.getElementById("content__toc");
      tocMobile = document.getElementById("content__tocmobile");
    }

    if (!tocBorder || !selector) return; // Ensure tocBorder and selector exist

    // Set TOCborder size to content size - offset
    tocBorder.style.height = `calc(100% - ${selector.offsetTop + 150}px)`;

    // Add content to TOC
    const tocContent: string = "<p>ON THIS SECTION</p><hr>";
    if (toc) toc.innerHTML = tocContent;
    if (tocMobile) tocMobile.innerHTML = tocContent;

    // Scan headings (h3s and h4s) on #content__currenth2
    this.headings = [];
    const h3s: NodeListOf<HTMLHeadingElement> = document.querySelectorAll("#content__currenth2 h3");
    const h4s: NodeListOf<HTMLHeadingElement> = document.querySelectorAll("#content__currenth2 h4");

    for (const h3 of h3s) {
      this.headings.push({
        name: h3.textContent || "",
        clientY: h3.getBoundingClientRect().top,
        isH3: true,
        obj: h3,
        id: h3.id,
      });
    }

    for (const h4 of h4s) {
      this.headings.push({
        name: h4.textContent || "",
        clientY: h4.getBoundingClientRect().top,
        isH3: false,
        obj: h4,
        id: h4.id,
      });
    }

    // Sort the objects by clientY
    this.headings.sort((a, b) => a.clientY - b.clientY);

    // Create a list of links to the headings
    let tocLinks: string = "";
    for (const heading of this.headings) {
      let link: string = "";
      link = heading.isH3
        ? `<div data-document="${currentDocument}" data-section="${this.helperObj.currentSection}" data-redirect="#${heading.id}" class="content__toc--search button__redirect" style="display: block;">`
        : `<div data-document="${currentDocument}" data-section="${this.helperObj.currentSection}" data-redirect="#${heading.id}" class="content__toc--search content__toc--search-h4 button__redirect" style="display: block;">`;
      link = link.concat(`${heading.name}</div>`);
      tocLinks = tocLinks.concat(link);
    }

    // Add the list to the TOC
    if (toc) toc.innerHTML = tocContent.concat(tocLinks);
    if (tocMobile) tocMobile.innerHTML = tocContent.concat(tocLinks);
  }

  // --- Check which H3 is the current one based on scrollPos & headings and hide all other h4s that are not theirs
  highlightTOC(): void {
    // Variables to track the current and next H3 headings
    let currentH3: Heading | null = null;
    let currentH3Index: number = 0;
    let nextH3Index: number = 0;

    // Determine the current H3 based on scroll position
    for (let i: number = 0; i < this.headings.length; i++) {
      const heading: Heading = this.headings[i];
      if (heading.isH3) {
        // Highlight the new section if it makes part of 75% of the page (25% of the top) or if it within 150px
        const headingTop: number = heading.obj.getBoundingClientRect().top;
        const threshold: number = Math.max(window.innerHeight * 0.25, 150);

        if (headingTop <= threshold || currentH3 === null) {
          currentH3 = heading;
          currentH3Index = i;
        } else {
          nextH3Index = i;
          break;
        }
      }
    }

    // Highlight the current H3 and remove active class from others
    if (currentH3 !== null) {
      const currentActive: NodeListOf<HTMLElement> = document.querySelectorAll(
        ".content__toc--search.active",
      );
      currentActive.forEach((active: HTMLElement) => active.classList.remove("active"));

      const currentH3Links: NodeListOf<HTMLElement> = document.querySelectorAll(
        `.content__toc--search[data-redirect="#${currentH3.id}"]`,
      );
      currentH3Links.forEach((link: HTMLElement) => link.classList.add("active"));
    }

    // Hide SEARCH h4s (display: none) before and after the indexes and show (display:block) the ones between
    for (let i: number = 0; i < this.headings.length; i++) {
      const heading: Heading = this.headings[i];
      if (!heading.isH3) {
        const isWithinRange: boolean =
          (i >= currentH3Index && i <= nextH3Index) ||
          (nextH3Index === 0 && currentH3Index > 0 && i >= currentH3Index) ||
          (nextH3Index === 0 && currentH3Index === 0);

        const searchH4: NodeListOf<HTMLElement> = document.querySelectorAll(
          `.content__toc--search[data-redirect="#${heading.id}"]`,
        );

        searchH4.forEach((search: HTMLElement) => {
          if (isWithinRange) {
            search.style.display = "block";
            search.classList.add("active");
          } else {
            search.style.display = "none";
            search.classList.remove("active");
          }
        });
      }
    }
  }

  // --- Completely remove the TOC
  clearSectionTOC(): void {
    const tocIcon: HTMLElement | null = document.getElementById("content__tocicon");
    if (tocIcon !== null) {
      tocIcon.remove();
    }

    const tocBox: HTMLElement | null = document.getElementById("content__tocicon--box");
    if (tocBox !== null) {
      tocBox.remove();
    }
  }
}
