// ---
// headings.js contains styling functions for headings. ex: ## ### ####
//   used a lot in tech documents.

import { Helper, h2Data, colors } from "./helper.js";

export class Headings {
  private colorCollection: Record<colors, string>;
  private h2Collection: h2Data[];
  private helperObj: Helper;
  private colorsIndex: number = 0;
  private colorsNames: colors[] = ["yellow", "pink", "teal", "green", "red", "lavender", "blue"];

  constructor(helperObj: Helper) {
    // Blue is currently unused.
    this.colorCollection = {
      yellow: "#f8d959",
      pink: "#fe796f",
      teal: "#45c9c9",
      green: "#58f15b",
      red: "#e74a41",
      lavender: "#c8a2b0",
      blue: "#205aaa",
    };
    // h2Collection will have every data for each section, that way we can load each one individually
    this.h2Collection = [];
    this.helperObj = helperObj;
  }

  // --- Adds collapse functionality to headings
  //      for ##, it also splits them into unique sections
  collapseHeadings(page: HTMLElement): void {
    this.h2Collection = [];
    this.colorsIndex = 0;
    let currentH4: string | null = null;
    let currentH3: string | null = null;
    let currentH2: string | null = null;
    let currentH2Text: string = "";
    let newInner: string = "";
    let newHeading: string = "";
    let firstH2: boolean = true;
    const currentHTML: string[] = page.innerHTML.split("\n");
    const contentElem: HTMLElement | null = document.getElementById("content");

    if (!contentElem) {
      return;
    }

    for (const element of currentHTML) {
      // Iterates over all the lines from the created HTML and uses it to create a new document with collapsing headings
      if (element.includes('h4 id="')) {
        // Close the div if an h4 is in progress
        if (currentH4) {
          newInner += `</div></div>\n`;
        }

        // Finding reference ID (the id from the original heading)
        currentH4 = element.substring(element.indexOf('h4 id="') + 7);
        currentH4 = currentH4.substring(0, currentH4.indexOf('"'));

        // Starts a div for the current heading, divided into title and content
        newInner += `
          <div class="content__h4">
        `;
        // Injects the search tags into the h4 --> just after the end of id
        const injectionIndex: number = element.indexOf('h4 id="') + 7 + currentH4.length + 1;
        const injectedSearch: string = ` data-open="${currentH4} ${currentH3} ${currentH2}"`;
        const newH4: string =
          element.substring(0, injectionIndex) + injectedSearch + element.substring(injectionIndex);
        newInner += `
          ${newH4}
          <div class="${currentH4}">
        `;
      } else if (element.includes('h3 id="')) {
        // Close the div if an h4 or h3 is in progress
        if (currentH4) {
          newInner += `</div></div>\n`;
          currentH4 = null;
        }
        if (currentH3) {
          newInner += `
            <hr class="content__h3--divider" draggable="false" />
            </div></div>
          `;
        }

        // Finding reference ID (the id from the original heading)
        currentH3 = element.substring(element.indexOf('h3 id="') + 7);
        currentH3 = currentH3.substring(0, currentH3.indexOf('"'));

        // Starts a div for the current heading, divided into title and content
        newInner += `
          <div class="content__h3">
            <button class="content__collapse" data-open="${currentH3} ${currentH2}">
              <span class="material-symbols-rounded">expand_circle_up</span>
            </button>
            ${element}
            <div class="${currentH3}">
        `;
      } else if (element.includes('h2 id="')) {
        // Close the div if an h4, h3, or h2 is in progress
        firstH2 = false;
        if (currentH4) {
          newInner += `</div></div>\n`;
          currentH4 = null;
        }
        if (currentH3) {
          newInner += `</div></div>\n`;
          currentH3 = null;
        }
        if (currentH2) {
          newInner += `</div></div>\n`;
          // Save all content so far to the h2
          this.h2Collection.push({
            id: currentH2,
            name: currentH2Text,
            content: newInner,
            color: this.colorsNames[this.colorsIndex],
          });
          this.colorsIndex++;
          if (this.colorsIndex >= this.colorsNames.length) {
            this.colorsIndex = 0;
          }
          newInner = "";
        }

        // Finding reference ID (the id from the original heading)
        currentH2 = element.substring(element.indexOf('h2 id="') + 7);
        currentH2 = currentH2.substring(0, currentH2.indexOf('"'));

        // Find text so we can replicate the heading but without the id (moved to div)
        currentH2Text = element.substring(element.indexOf('">') + 2);
        currentH2Text = currentH2Text.substring(0, currentH2Text.indexOf("</h2>"));

        // Starts a div for the current heading, divided into title and content
        newInner += `
          <div class="content__h2" id="${currentH2}">
            <h2></h2>
            <div class="${currentH2}">
        `;
      } else if (firstH2) {
        // Within the first lines of the content. Save in another variable since a tab will be added after it
        newHeading += `${element}\n`;
      } else {
        // Normal text/tags within headings
        newInner += `${element}\n`;
      }
    }

    // Closes divs if any is still open
    if (currentH4) {
      newInner += `</div></div>\n`;
    }
    if (currentH3) {
      newInner += `</div></div>\n`;
    }
    if (currentH2) {
      newInner += `</div></div>\n`;
      this.h2Collection.push({
        id: currentH2,
        name: currentH2Text,
        content: newInner,
        color: this.colorsNames[this.colorsIndex],
      });
      this.colorsIndex++;
      if (this.colorsIndex >= this.colorsNames.length) {
        this.colorsIndex = 0;
      }
      newInner = "";
    }

    let selectionTab: string = `
      <div id="content__selector">
        <div id="content__selectorbox">
    `;

    // Based on h2Collection, create the individual tabs. Styling based on hardcoded values (colorCollection)
    for (const collection of this.h2Collection) {
      const h2Tag: string = collection.id;
      const h2Text: string = collection.name;
      const h2Color: string = this.colorCollection[collection.color as colors];

      // --- Create the tab
      selectionTab += `
        <div class="content__selectorbox--item" data-open="${h2Tag}" data-highlight="${h2Color}">
          ${h2Text}
        </div>
      `;
    }

    // Save to helper obj
    this.helperObj.h2Collection = this.h2Collection;
    this.helperObj.colorCollection = this.colorCollection;

    selectionTab += `
        </div>
        <hr id="content__selectorhr"></hr>
    `;

    // Closes the div after selectionTab
    const mobileChevrons: string = `
      <div id="content__mobilechevrons">
        <span class="content__mobilechevrons--left material-symbols-rounded">chevron_backward</span>
        <span class="content__mobilechevrons--right material-symbols-rounded">chevron_forward</span>
      </div></div>
      <div id="content__currenth2"></div>
    `;

    page.innerHTML =
      this.h2Collection.length > 0 ? `${newHeading}${selectionTab}${mobileChevrons}` : newHeading;

    this.helperObj.dragScrollElement("#content__selectorbox", 0);

    this.setupChevrons();

    contentElem.style.visibility = "visible";
  }

  // --- Setup chevrons to scroll h2 selection if there is not enough space
  setupChevrons(): void {
    // Get all required elements
    const chevronBox: HTMLElement | null = document.getElementById("content__mobilechevrons");
    const chevronLeft: HTMLElement | null = document.querySelector(
      ".content__mobilechevrons--left",
    );
    const chevronRight: HTMLElement | null = document.querySelector(
      ".content__mobilechevrons--right",
    );
    const selectorBox: HTMLElement | null = document.getElementById("content__selectorbox");

    if (!chevronBox || !chevronLeft || !chevronRight || !selectorBox) {
      return;
    }

    // Check if chevrons are necessary or not and which ones should be active
    const updateChevronVisibility = (): void => {
      const selectorBoxWidth: number = selectorBox.clientWidth;
      const selectorBoxScrollWidth: number = selectorBox.scrollWidth;

      if (selectorBoxWidth < selectorBoxScrollWidth) {
        chevronBox.style.display = "block";
        chevronBox.style.left = `${selectorBox.getBoundingClientRect().right}px`;
      } else {
        chevronBox.style.display = "none";
      }

      const scrollLeft: number = selectorBox.scrollLeft;
      if (scrollLeft > 0) {
        chevronLeft.classList.add("active");
      } else {
        chevronLeft.classList.remove("active");
      }

      if (scrollLeft < selectorBoxScrollWidth - selectorBoxWidth) {
        chevronRight.classList.add("active");
      } else {
        chevronRight.classList.remove("active");
      }
    };

    // Initial visibility check
    updateChevronVisibility();

    // Add resize event listener to update chevron visibility
    window.addEventListener("resize", updateChevronVisibility, true);

    // Add click event listener for the left chevron
    chevronLeft.addEventListener("click", () => {
      const selectorBoxWidth: number = selectorBox.offsetWidth;
      const newScrollLeft: number = Math.max(0, selectorBox.scrollLeft - selectorBoxWidth);

      selectorBox.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(() => updateChevronVisibility(), 700);
    });

    // Add click event listener for the right chevron
    chevronRight.addEventListener("click", () => {
      const selectorBoxWidth: number = selectorBox.offsetWidth;
      const newScrollLeft: number = Math.min(
        selectorBox.scrollWidth - selectorBoxWidth,
        selectorBox.scrollLeft + selectorBoxWidth,
      );

      selectorBox.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(() => updateChevronVisibility(), 700);
    });

    // Add scroll event listener to update chevron states dynamically
    //   this is used when the user drags the h2 selection with their mouse
    selectorBox.addEventListener("scroll", () => {
      updateChevronVisibility();
    });
  }

  // --- This is the collapse event for when you click the icon for an h3
  collapseHeadingStyle(event: Event): void {
    const currentTarget: EventTarget | null = event.currentTarget;

    if (!currentTarget) {
      return;
    }

    if (!(currentTarget instanceof HTMLElement)) {
      return;
    }

    if (!currentTarget.dataset.open) {
      return;
    }

    // Check the tags related to the current button
    const openTags: string[] = currentTarget.dataset.open.split(" ");

    for (let i = 0; i < openTags.length; i++) {
      const targetList: HTMLCollectionOf<Element> = document.getElementsByClassName(openTags[i]);

      // Get all objects that are possibly hidden
      for (const target of targetList) {
        const targetElement: Element = target;

        if (!(targetElement instanceof HTMLElement)) {
          continue;
        }

        if (targetElement.hidden) {
          targetElement.hidden = false;

          // Change the button depending on the current state
          const firstChild: Element = currentTarget.children[0];
          if (firstChild && firstChild.innerHTML === "expand_circle_down") {
            firstChild.innerHTML = "expand_circle_up";
          }
        } else if (i === 0) {
          // Only hide if the click target is the current heading level and is currently not hidden
          targetElement.hidden = true;

          // Change the button depending on the current state
          const firstChild: Element = currentTarget.children[0];
          if (firstChild && firstChild.innerHTML === "expand_circle_up") {
            firstChild.innerHTML = "expand_circle_down";
          }
        }
      }
    }
  }

  // --- This iterates over all headings and adds a click event that copies them to your clipboard
  shareHeadings(): void {
    // Get the current pathname and remove the leading slash
    let pathname: string = document.location.pathname.substring(1);

    // Check if the pathname contains a redirect string (a `/`) and get its target
    const splitPath: string[] = pathname.split("/");
    if (splitPath.length > 1) {
      pathname = splitPath[0];
    }

    const baseUrl: string = window.location.origin;

    // Select all h3 and h4 headings
    const headings: NodeListOf<HTMLHeadingElement> = document.querySelectorAll("h3, h4");

    // Iterate over each heading and add a click event listener
    headings.forEach((heading: HTMLHeadingElement) => {
      heading.style.cursor = "copy";
      heading.addEventListener("click", () => {
        const headingUrl: string = `${baseUrl}/${pathname}/${heading.id}`;
        // Set text to clipboard or do nothing
        navigator.clipboard.writeText(headingUrl).catch(() => {});
      });
    });
  }
}
