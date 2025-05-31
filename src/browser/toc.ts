// ---------
// toc.js is the table of content functionality for tech pages
//   there are two modes, a side view on desktop and another inside an icon for mobile

import { Helper } from "../shared/helper";

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
  private readonly helperObj: Helper;

  // Sizing constants.
  // TODO define height for scroll
  private static readonly VIEWPORT_THRESHOLD_RATIO: number = 0.25;
  private static readonly MIN_THRESHOLD_PIXELS: number = 150;
  private static readonly TOC_OFFSET_PIXELS: number = -30;
  private static readonly MOBILE_TOC_WIDTH_BREAKPOINT: number = 480;
  private static readonly MOBILE_TOC_WIDTH_LARGE: number = 360;
  private static readonly MOBILE_TOC_WIDTH_SMALL: number = 300;

  constructor(helperObj: Helper) {
    this.headings = [];
    this.ticking = false;
    this.helperObj = helperObj;

    // Enable smart section highlighting based on scroll position
    document.addEventListener("scroll", this.handleScroll.bind(this), { passive: true });
  }

  // --- Handle scroll events with throttling
  private handleScroll(): void {
    if (!this.ticking && this.helperObj.inTechPage) {
      window.requestAnimationFrame(() => {
        this.highlightTOC();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  // --- Clear headings variable
  clearHeadings(): void {
    this.headings.length = 0;
  }

  // --- Creates the TOC based on the provided document. Only for tech pages
  createTOC(currentDocument: string): void {
    // TODO interface for this would be nice
    const tocElements: {
      tocBorder: HTMLElement;
      selector: HTMLElement;
      toc: HTMLElement;
      tocMobile: HTMLElement;
    } | null = this.initializeTOCElements();
    if (!tocElements) return;

    const {
      tocBorder,
      selector,
      toc,
      tocMobile,
    }: { tocBorder: HTMLElement; selector: HTMLElement; toc: HTMLElement; tocMobile: HTMLElement } =
      tocElements;

    // Set TOCborder size to content size - offset
    tocBorder.style.height = `calc(100% - ${selector.offsetTop + 150}px)`;

    // Add content to TOC
    const tocContent: string = "<p>ON THIS SECTION</p><hr>";
    toc.innerHTML = tocContent;
    tocMobile.innerHTML = tocContent;

    this.populateHeadings();
    const tocLinks: string = this.generateTOCLinks(currentDocument);

    // Add the list to the TOC
    toc.innerHTML = tocContent.concat(tocLinks);
    tocMobile.innerHTML = tocContent.concat(tocLinks);
  }

  // --- Initialize TOC elements, creating them if they don't exist
  private initializeTOCElements(): {
    tocBorder: HTMLElement;
    selector: HTMLElement;
    toc: HTMLElement;
    tocMobile: HTMLElement;
  } | null {
    let tocBorder: HTMLElement | null = document.getElementById("content__tocborder");
    let selector: HTMLElement | null = document.getElementById("content__selector");
    let toc: HTMLElement | null = document.getElementById("content__toc");
    let tocMobile: HTMLElement | null = document.getElementById("content__tocmobile");

    if (!tocBorder) {
      const createdElements: {
        tocBorder: HTMLElement;
        selector: HTMLElement;
        content: HTMLElement;
      } | null = this.createTOCElements();
      if (!createdElements) return null;

      // Re-query the elements after creation
      tocBorder = document.getElementById("content__tocborder");
      selector = document.getElementById("content__selector");
      toc = document.getElementById("content__toc");
      tocMobile = document.getElementById("content__tocmobile");
    }

    if (!tocBorder || !selector || !toc || !tocMobile) {
      return null;
    }

    return { tocBorder, selector, toc, tocMobile };
  }

  // --- Create new TOC elements if they don't exist
  private createTOCElements(): {
    tocBorder: HTMLElement;
    selector: HTMLElement;
    content: HTMLElement;
  } | null {
    // Check if it is a tech page by searching for an active h2
    const techPageElement: HTMLElement | null = document.querySelector(
      ".content__selectorbox--item.selected",
    );
    if (!techPageElement) return null;

    // Gets div of id content and creates a new div as children
    const content: HTMLElement | null = document.getElementById("content");
    const selector: HTMLElement | null = document.getElementById("content__selector");
    if (!content || !selector) return null;

    const tocBorder: HTMLElement = document.createElement("div");
    tocBorder.id = "content__tocborder";
    content.appendChild(tocBorder);

    const toc: HTMLElement = document.createElement("div");
    toc.id = "content__toc";
    tocBorder.appendChild(toc);

    // Set TOC y location just after #content__selector
    if (this.helperObj.inEdit) {
      // If in edit also take in consideration the size of the edit-content block
      const editElem: HTMLElement | null = document.getElementById("edit-content");
      if (editElem) {
        // TODO this is asking for a bug to appear, but it seems to work for now
        tocBorder.style.top = `${selector.offsetTop + content.offsetTop - editElem.clientHeight + TOC.TOC_OFFSET_PIXELS * 3}px`;
      }
    } else {
      tocBorder.style.top = `${selector.offsetTop + content.offsetTop + TOC.TOC_OFFSET_PIXELS}px`;
    }

    this.createMobileTOCElements();
    this.setupTOCEventListeners();

    return { tocBorder, selector, content };
  }

  // --- Create mobile TOC elements
  private createMobileTOCElements(): void {
    const sectionContainer: HTMLElement | null = document.getElementById("section-container__div");
    if (!sectionContainer) return;

    // Create TOC icon for mobile
    const tocIcon: HTMLElement = document.createElement("span");
    tocIcon.className = "material-symbols-rounded";
    tocIcon.id = "content__tocicon";
    tocIcon.innerHTML = "menu_book";
    tocIcon.style.display = "none";
    sectionContainer.appendChild(tocIcon);

    // Create TOC box container
    const tocIconBox: HTMLElement = document.createElement("div");
    tocIconBox.id = "content__tocicon--box";
    tocIconBox.tabIndex = 0;
    tocIconBox.style.width = "0px";
    sectionContainer.appendChild(tocIconBox);

    // Create mobile TOC element
    const tocMobile: HTMLElement = document.createElement("div");
    tocMobile.id = "content__tocmobile";
    tocIconBox.appendChild(tocMobile);

    // Setup drag functionality
    // TODO needs set height
    this.helperObj.dragScrollElement(`#${tocIconBox.id}`, 1);
    this.helperObj.dragScrollElement("#content__toc", 1);
  }

  // --- Setup event listeners for TOC functionality
  private setupTOCEventListeners(): void {
    const tocIcon: HTMLElement | null = document.getElementById("content__tocicon");
    const tocIconBox: HTMLElement | null = document.getElementById("content__tocicon--box");

    if (!tocIcon || !tocIconBox) return;

    // Handle TOC icon click
    tocIcon.addEventListener("click", () => this.handleTOCIconClick());

    // Handle focus out on TOC box
    tocIconBox.addEventListener("focusout", (focusEvent: FocusEvent) => {
      this.handleTOCBoxFocusOut(focusEvent);
    });
  }

  // --- Handle TOC icon (mobile or small screen) click event
  private handleTOCIconClick(): void {
    const tocIconBox: HTMLElement | null = document.getElementById("content__tocicon--box");
    if (!tocIconBox) return;

    const boxWidth: number =
      document.body.clientWidth >= TOC.MOBILE_TOC_WIDTH_BREAKPOINT
        ? TOC.MOBILE_TOC_WIDTH_LARGE
        : TOC.MOBILE_TOC_WIDTH_SMALL;

    Object.assign(tocIconBox.style, {
      width: `${boxWidth}px`,
      display: "block",
    });
    tocIconBox.className = "fadein";
    tocIconBox.focus();
  }

  // --- Handle TOC box focus out event
  private handleTOCBoxFocusOut(focusEvent: FocusEvent): void {
    const tocIconBox: HTMLElement | null = document.getElementById("content__tocicon--box");
    if (!tocIconBox) return;

    focusEvent.stopPropagation();
    tocIconBox.className = "fadeout";
  }

  // --- Populate headings array from DOM elements
  private populateHeadings(): void {
    this.headings.length = 0;

    // Get all H3 and H4 from current section
    const h3Elements: NodeListOf<HTMLHeadingElement> =
      document.querySelectorAll("#content__currenth2 h3");
    const h4Elements: NodeListOf<HTMLHeadingElement> =
      document.querySelectorAll("#content__currenth2 h4");

    // Process H3 elements
    for (const h3Element of h3Elements) {
      this.headings.push({
        name: h3Element.textContent ?? "",
        clientY: h3Element.getBoundingClientRect().top,
        isH3: true,
        obj: h3Element,
        id: h3Element.id,
      });
    }

    // Process H4 elements
    for (const h4Element of h4Elements) {
      this.headings.push({
        name: h4Element.textContent ?? "",
        clientY: h4Element.getBoundingClientRect().top,
        isH3: false,
        obj: h4Element,
        id: h4Element.id,
      });
    }

    // Sort headings by their vertical position
    this.headings.sort(
      (headingA: Heading, headingB: Heading) => headingA.clientY - headingB.clientY,
    );
  }

  // --- Generate TOC links HTML
  private generateTOCLinks(currentDocument: string): string {
    let tocLinksHtml: string = "";

    for (let i: number = 0; i < this.headings.length; i++) {
      const heading: Heading = this.headings[i];
      const baseClasses: string = "content__toc--search button__redirect";
      const h4Class: string = heading.isH3 ? "" : " content__toc--search-h4";
      const cssClasses: string = `${baseClasses}${h4Class}`;

      tocLinksHtml +=
        `<div data-document="${currentDocument}" ` +
        `data-section="${this.helperObj.currentSection}" ` +
        `data-redirect="#${heading.id}" ` +
        `class="${cssClasses}" ` +
        `style="display: block;">${heading.name}</div>`;
    }

    return tocLinksHtml;
  }

  // --- Check which H3 is the current one based on scrollPos & headings
  highlightTOC(): void {
    const {
      currentH3,
      currentH3Index,
      nextH3Index,
    }: { currentH3: Heading | null; currentH3Index: number; nextH3Index: number } =
      this.findCurrentH3();

    this.updateTOCHighlighting(currentH3);
    this.updateH4Visibility(currentH3Index, nextH3Index);
  }

  // --- Find the current H3 heading based on scroll position
  private findCurrentH3(): {
    currentH3: Heading | null;
    currentH3Index: number;
    nextH3Index: number;
  } {
    let currentH3: Heading | null = null;
    let currentH3Index: number = 0;
    let nextH3Index: number = 0;

    for (let i: number = 0; i < this.headings.length; i++) {
      const heading: Heading = this.headings[i];
      if (!heading.isH3) continue;

      // Highlight the new section if it makes part of 25% of the page or within 150px
      const headingTop: number = heading.obj.getBoundingClientRect().top;
      const threshold: number = Math.max(
        window.innerHeight * TOC.VIEWPORT_THRESHOLD_RATIO,
        TOC.MIN_THRESHOLD_PIXELS,
      );

      if (headingTop <= threshold || currentH3 === null) {
        currentH3 = heading;
        currentH3Index = i;
      } else {
        nextH3Index = i;
        break;
      }
    }

    return { currentH3, currentH3Index, nextH3Index };
  }

  // --- Update TOC highlighting for current H3
  private updateTOCHighlighting(currentH3: Heading | null): void {
    if (!currentH3) return;

    // Remove active class from all current active elements
    const currentActiveElements: NodeListOf<HTMLElement> = document.querySelectorAll(
      ".content__toc--search.active",
    );

    for (const activeElement of currentActiveElements) {
      activeElement.classList.remove("active");
    }

    // Add active class to current H3 links
    const currentH3Links: NodeListOf<HTMLElement> = document.querySelectorAll(
      `.content__toc--search[data-redirect="#${currentH3.id}"]`,
    );

    for (const linkElement of currentH3Links) {
      linkElement.classList.add("active");
    }
  }

  // --- Update H4 visibility based on current H3 section
  private updateH4Visibility(currentH3Index: number, nextH3Index: number): void {
    for (let i: number = 0; i < this.headings.length; i++) {
      const heading: Heading = this.headings[i];
      if (heading.isH3) continue;

      // Check if H4 is within the visible range for current H3 section
      const isWithinRange: boolean = this.isH4WithinVisibleRange(i, currentH3Index, nextH3Index);

      const h4Links: NodeListOf<HTMLElement> = document.querySelectorAll(
        `.content__toc--search[data-redirect="#${heading.id}"]`,
      );

      for (const linkElement of h4Links) {
        if (isWithinRange) {
          linkElement.style.display = "block";
          linkElement.classList.add("active");
        } else {
          linkElement.style.display = "none";
          linkElement.classList.remove("active");
        }
      }
    }
  }

  // --- Determine if H4 is within the visible range for current H3 section
  private isH4WithinVisibleRange(
    h4Index: number,
    currentH3Index: number,
    nextH3Index: number,
  ): boolean {
    return (
      (h4Index >= currentH3Index && h4Index <= nextH3Index) ||
      (nextH3Index === 0 && currentH3Index > 0 && h4Index >= currentH3Index) ||
      (nextH3Index === 0 && currentH3Index === 0)
    );
  }

  // --- Completely remove the TOC
  clearSectionTOC(): void {
    const tocElementIds: readonly string[] = ["content__tocicon", "content__tocicon--box"] as const;

    for (const elementId of tocElementIds) {
      const element: HTMLElement | null = document.getElementById(elementId);
      element?.remove();
    }
  }
}
