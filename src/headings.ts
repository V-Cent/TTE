// ---
// headings.js contains styling functions for headings. ex: ## ### ####
//   used a lot in tech documents. This also saves something in storage that can be used to make section specific styling
import { Helper } from "./helper.js";

export class Headings {
  private colorCollection: [string, string][];
  private h2Collection: Array<[string, string, string | [string, string]]>;
  private helperObj: Helper;

  constructor(helperObj: Helper) {
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
    // h2Collection will have every data for each section, that way we can load each one individually
    this.h2Collection = [];
    this.helperObj = helperObj;
  }

  returnH2Collection(): Array<[string, string, string | [string, string]]> {
    return this.h2Collection;
  }

  // Adds collapse functionality to headings
  //   for ##, it also split them into unique sections
  collapseHeadings(page: HTMLElement): void {
    this.h2Collection = [];
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

    for (let i = 0; i < currentHTML.length; i++) {
      // Iterates over all the lines from the created HTML and uses it to create a new document with collapsing headings
      if (currentHTML[i].includes('h4 id="')) {
        // Close the div if an h4 is in progress
        if (currentH4) {
          newInner += `</div></div>\n`;
        }

        // Finding reference ID (the id from the original heading)
        currentH4 = currentHTML[i].substring(
          currentHTML[i].indexOf('h4 id="') + 7,
        );
        currentH4 = currentH4.substring(0, currentH4.indexOf('"'));

        // Starts a div for the current heading, divided into title and content
        newInner += `
          <div class="content__h4">
        `;
        // Injects the search tags into the h4 --> just after the end of id
        const injectionIndex =
          currentHTML[i].indexOf('h4 id="') + 7 + currentH4.length + 1;
        const injectedSearch = ` data-open="${currentH4} ${currentH3} ${currentH2}"`;
        const newH4 =
          currentHTML[i].substring(0, injectionIndex) +
          injectedSearch +
          currentHTML[i].substring(injectionIndex);
        newInner += `
          ${newH4}
          <div class="${currentH4}">
        `;
      } else if (currentHTML[i].includes('h3 id="')) {
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
        currentH3 = currentHTML[i].substring(
          currentHTML[i].indexOf('h3 id="') + 7,
        );
        currentH3 = currentH3.substring(0, currentH3.indexOf('"'));

        // Starts a div for the current heading, divided into title and content
        newInner += `
          <div class="content__h3">
            <button class="content__collapse" data-open="${currentH3} ${currentH2}">
              <span class="material-symbols-rounded">expand_circle_up</span>
            </button>
            ${currentHTML[i]}
            <div class="${currentH3}">
        `;
      } else if (currentHTML[i].includes('h2 id="')) {
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
        newInner += `
          <div class="content__h2" id="${currentH2}">
            <div class="${currentH2}">
        `;
      } else {
        if (firstH2) {
          // Within the first lines of the content. Save in another variable since a tab will be added after it
          newHeading += `${currentHTML[i]}\n`;
        } else {
          // Normal text/tags within headings
          newInner += `${currentHTML[i]}\n`;
        }
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
      this.h2Collection.push([currentH2, currentH2Text, newInner]);
      newInner = "";
    }

    let selectionTab = `
      <div id="content__selector">
        <div id="content__selectorbox">
    `;

    // Based on h2Collection, create the individual tabs. Styling based on hardcoded values (colorCollection)
    for (let i = 0; i < this.h2Collection.length; i++) {
      const h2Tag = this.h2Collection[i][0];
      const h2Text = this.h2Collection[i][1];
      const h2Color = this.colorCollection[i % this.colorCollection.length];

      // --- Create the tab
      selectionTab += `
        <div class="content__selectorbox--item" data-open="${h2Tag}" data-highlight="${h2Color[1]}">
          ${h2Text}
        </div>
      `;

      // --- Add h2Color as extra parameters to h2Collection
      this.h2Collection[i].push(h2Color);
    }

    // Save to session storage, used in search
    sessionStorage.setItem("h2Collection", JSON.stringify(this.h2Collection));

    selectionTab += `
        </div>
        <hr id="content__selectorhr"></hr>
    `;

    // Closes the div after selectionTab
    const mobileChevrons = `
      <div id="content__mobilechevrons">
        <span class="content__mobilechevrons--left material-symbols-rounded">chevron_backward</span>
        <span class="content__mobilechevrons--right material-symbols-rounded">chevron_forward</span>
      </div></div>
      <div id="content__currenth2"></div>
    `;

    page.innerHTML =
      this.h2Collection.length > 0
        ? `${newHeading}${selectionTab}${mobileChevrons}`
        : newHeading;

    this.helperObj.dragScrollElement("#content__selectorbox", 0);

    this.setupChevrons();

    contentElem.style.visibility = "visible";
  }

  setupChevrons(): void {
    // Get all required elements
    const chevronBox = document.getElementById(
      "content__mobilechevrons",
    ) as HTMLElement | null;
    const chevronLeft = document.querySelector(
      ".content__mobilechevrons--left",
    ) as HTMLElement | null;
    const chevronRight = document.querySelector(
      ".content__mobilechevrons--right",
    ) as HTMLElement | null;
    const selectorBox = document.getElementById(
      "content__selectorbox",
    ) as HTMLElement | null;

    if (!chevronBox || !chevronLeft || !chevronRight || !selectorBox) {
      return;
    }

    const updateChevronVisibility = (): void => {
      const selectorBoxWidth = selectorBox.clientWidth;
      const selectorBoxScrollWidth = selectorBox.scrollWidth;

      if (selectorBoxWidth < selectorBoxScrollWidth) {
        chevronBox.style.display = "block";
        chevronBox.style.left = `${selectorBox.getBoundingClientRect().right}px`;
      } else {
        chevronBox.style.display = "none";
      }

      const scrollLeft = selectorBox.scrollLeft;
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
      const selectorBoxWidth = selectorBox.offsetWidth;
      const newScrollLeft = Math.max(
        0,
        selectorBox.scrollLeft - selectorBoxWidth,
      );

      selectorBox.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(() => updateChevronVisibility(), 700);
    });

    // Add click event listener for the right chevron
    chevronRight.addEventListener("click", () => {
      const selectorBoxWidth = selectorBox.offsetWidth;
      const newScrollLeft = Math.min(
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
    selectorBox.addEventListener("scroll", () => {
      updateChevronVisibility();
    });
  }

  // This is the collapse event for when you click the icon for an h3
  collapseHeadingStyle(event: Event): void {
    const currentTarget = event.currentTarget as HTMLElement;

    if (!currentTarget.dataset.open) {
      return;
    }

    // Check the tags related to the current button
    const openTags: string[] = currentTarget.dataset.open.split(" ");

    for (let i = 0; i < openTags.length; i++) {
      const targetList: HTMLCollectionOf<Element> =
        document.getElementsByClassName(openTags[i]);

      // Get all objects that are possibly hidden
      for (const target of targetList) {
        const targetElement = target as HTMLElement;

        if (targetElement.hidden) {
          targetElement.hidden = false;

          // Change the button depending on the current state
          const firstChild = currentTarget.firstChild as HTMLElement | null;
          if (firstChild && firstChild.innerHTML === "expand_circle_down") {
            firstChild.innerHTML = "expand_circle_up";
          }
        } else if (i === 0) {
          // Only hide if the click target is the current heading level and is currently not hidden
          targetElement.hidden = true;

          // Change the button depending on the current state
          const firstChild = currentTarget.firstChild as HTMLElement | null;
          if (firstChild && firstChild.innerHTML === "expand_circle_up") {
            firstChild.innerHTML = "expand_circle_down";
          }
        }
      }
    }
  }

  // This iterates over all headings and adds a click event that copies them to your clipboard
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
    const headings: NodeListOf<HTMLHeadingElement> =
      document.querySelectorAll("h3, h4");

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
