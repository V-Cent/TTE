// ---------
// search.js controls the search actions and redirects

import { Helper, h2Data } from "./helper.js";

export class Search {
  private navLock: boolean;
  private currentActiveSearch: string | null;
  private techPages: Map<{ document: string; section: string; dim: string; ref: string }, string>;
  private addPageChangeEvent: (element: HTMLElement) => void;
  private helperObj: Helper;

  constructor(
    techPages: Map<{ document: string; section: string; dim: string; ref: string }, string>,
    addPageChangeEvent: (element: HTMLElement) => void,
    helperObj: Helper,
  ) {
    // Blocks other forms of search when one is active
    this.navLock = false;
    this.currentActiveSearch = null;
    this.techPages = techPages;
    this.addPageChangeEvent = addPageChangeEvent;
    this.searchBoxListener = this.searchBoxListener.bind(this);
    this.helperObj = helperObj;
  }

  // --- Init nav-bar
  initSearchIcons(): void {
    // Setup search
    const search: HTMLElement | null = document.querySelector("#nav-bar__searchbox");
    if (!search) {
      return; // Exit if the search element is not found
    }

    search.addEventListener("click", this.searchBoxListener);

    // Add filtering when the user types something
    const input: HTMLInputElement | null = document.querySelector("#nav-bar__search--input");
    if (input) {
      input.addEventListener("keyup", this.filterFunction.bind(this));
      input.addEventListener("focusin", this.filterFunction.bind(this));
    }

    // Dynamically add the `targetParam` property to the `search` element
    // TODO: This is currently only ever search, if games are gone kept as in this functionality can be removed
    (search as HTMLElement & { targetParam: string }).targetParam = "search";

    const games: HTMLElement | null = document.querySelector("#nav-bar__games--icon");
    if (games) {
      games.addEventListener("click", this.gamesFunction.bind(this));
    }

    // Clears search when you focusout (click out of the search input, use tab ...)
    search.addEventListener("focusout", (event: FocusEvent) => {
      const searchField: HTMLElement | null = document.querySelector("#nav-bar__search");
      if (!searchField) {
        return;
      }
      event.stopPropagation();

      if (!(event.relatedTarget instanceof Node)) {
        return;
      }

      if (!searchField.contains(event.relatedTarget)) {
        this.clearFunction();
      }
    });

    // First create the HTML elements for each, then fill with the links
    this.fillSearch();
  }

  // --- Homepage icon works the same way as the one inside the search box
  initOnboardingIcon(): void {
    const onboardingIcon: HTMLElement | null = document.querySelector(
      "#content__home__onboarding--icon",
    );
    if (!onboardingIcon) {
      return; // Exit if the onboarding icon element is not found
    }

    onboardingIcon.addEventListener("click", this.gamesFunction.bind(this));
  }

  // --- Click event for the search field
  searchBoxListener(event: Event): void {
    if (this.navLock) {
      return;
    }

    // Get element and its type (games or search)
    const target: EventTarget | null = event.currentTarget;
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }
    const targetElem: HTMLElement & {
      targetParam?: string;
    } = target;
    const type: string | undefined = targetElem.targetParam;

    if (!type) {
      return; // Exit if targetParam is not defined
    }

    // Define the search type and init functionality
    this.currentActiveSearch = type;
    this.injectSearchBox("#nav-bar__search");

    const searchCount: HTMLElement | null = document.querySelector(".nav-bar__search--results");
    if (searchCount === null) {
      this.fillSearch();
    }
  }

  // --- Makes the box for games or search appear
  injectSearchBox(id: string): void {
    if (this.navLock) {
      return;
    }

    const searchIcon: HTMLElement | null = document.querySelector(id);
    if (!searchIcon) {
      return; // Exit if the search icon element is not found
    }
    searchIcon.removeEventListener("click", this.searchBoxListener);

    const baseName: string = `${id}box`;
    const inputName: string = `${id}--input`;

    const base: HTMLElement | null = document.querySelector(baseName);
    const inputField: HTMLInputElement | null = document.querySelector(inputName);

    if (!base) {
      return; // Exit if the base element is not found
    }

    // Based on min mobile widths
    let searchboxWidth: number = 280;
    if (this.currentActiveSearch === "search") {
      if (document.body.clientWidth >= 480) {
        searchboxWidth = 400;
      }
    } else {
      searchboxWidth = 280;
    }
    base.style.width = `${searchboxWidth}px`;

    // Focus on the elements to use focusout to exit them
    if (this.currentActiveSearch === "search") {
      if (inputField) {
        inputField.focus();
      }
    } else {
      base.focus();
    }
  }

  // --- Clear everthing from results
  clearFunction(): void {
    // Function to hide all computed links
    const searchBox: HTMLElement | null = document.querySelector("#nav-bar__searchbox");
    if (!searchBox) {
      return; // Exit if the search box element is not found
    }

    this.navLock = true;

    const referenceBox: HTMLElement = searchBox;
    const referenceId: string = "#nav-bar__search";

    const links: HTMLCollectionOf<Element> =
      referenceBox.getElementsByClassName("button__redirect");
    for (const link of links) {
      if (!(link instanceof HTMLElement)) {
        continue;
      }
      link.style.display = "none";
    }

    const hrElement: HTMLElement | null = document.querySelector(`${referenceId}--hr`);
    if (hrElement) {
      hrElement.style.display = "none";
    }

    this.navLock = false;
  }

  // --- Filter up to 12 options when you type something in search
  filterFunction(): void {
    const idReference: string = "#nav-bar__search";

    // TODO: games is currently dummy code
    if (this.currentActiveSearch === "games") {
      return;
    }

    // Gets the value from the user input, set each word into an array
    const input: HTMLInputElement | null = document.querySelector(`${idReference}--input`);
    if (!input) {
      return; // Exit if the input element is not found
    }

    const filter: string = input.value.toUpperCase().trim();
    const filterArray: string[] = filter.split(" ");

    // Gets the element of the container and all current computed links
    const searchBox: HTMLElement | null = document.querySelector(`${idReference}box`);
    if (!searchBox) {
      return; // Exit if the search box element is not found
    }

    const links: HTMLCollectionOf<Element> = searchBox.getElementsByClassName("button__redirect");
    let searchCounter: number = 0;

    for (const linkElement of links) {
      const link: Element = linkElement;
      if (!(link instanceof HTMLElement)) {
        continue; // Exit if link is not an HTMLElement
      }

      // For each link, test if the user input makes part of its text value (ignoring empty inputs)
      // Hide any link that does not have any relation to the current input
      let txtValue: string = link.textContent || link.innerText || "";
      txtValue += ` ${link.dataset.section || ""} ${link.dataset.document || ""}`;
      const compareTxtValue: string = txtValue.toUpperCase();

      let containFlag: boolean = true;
      for (const stringFilter of filterArray) {
        if (!compareTxtValue.includes(stringFilter) || filter.length === 0) {
          containFlag = false;
          break;
        }
      }

      if (containFlag) {
        // Hardcoded 'Tales of', 'T', 'TO' check
        //  these bypass the 12 item limit
        if ("TALES OF".includes(filter) || filter === "T" || filter === "TO") {
          if (link.dataset.tag === "game") {
            link.style.display = "block";
          }
          continue;
        }

        // Tech entry -- Hard limit of 12 options on screen
        link.style.display = searchCounter < 12 || link.dataset.tag === "game" ? "block" : "none";
        searchCounter++;
      } else {
        link.style.display = "none";
      }
    }

    // Separater between search results and input field
    const hrElement: HTMLElement | null = document.querySelector(`${idReference}--hr`);
    if (hrElement) {
      // If there is at least one tech entry or a hardcoded test, show the HR
      hrElement.style.display =
        (searchCounter > 0 || "TALES OF".includes(filter) || filter === "T" || filter === "TO") &&
        filter.length > 0
          ? "block"
          : "none";
    }
  }

  // --- Perform a pre-define search for games
  gamesFunction(): void {
    // Game search now uses the normal search menu and just fills it with "Tales of"
    const searchBox: HTMLElement | null = document.querySelector("#nav-bar__searchbox");
    if (!searchBox) {
      return; // Exit if the search box element is not found
    }

    const links: HTMLCollectionOf<Element> = searchBox.getElementsByClassName("button__redirect");
    for (const link of links) {
      if (!(link instanceof HTMLElement)) {
        continue;
      }
      link.style.display = "none";
    }

    const hrElement: HTMLElement | null = document.querySelector("#nav-bar__search--hr");
    if (hrElement) {
      hrElement.style.display = "none";
    }

    this.navLock = false;

    const inputField: HTMLInputElement | null = document.querySelector("#nav-bar__search--input");
    if (!inputField) {
      return; // Exit if the input field is not found
    }

    const filter: string = "Tales of";
    inputField.value = filter;

    // Call the current keyup event of the inputField
    inputField.focus();
  }

  // --- Fill search results based on loaded games
  fillSearch(): void {
    // TODO: This will be cached in the future
    // Get all items on the tab bar
    const searchContents1L: string[] = [];
    const searchContents2L: string[] = [];
    const searchResults: HTMLElement | null = document.querySelector("#nav-bar__searchbox");

    if (!searchResults) {
      return; // Exit if the search results container is not found
    }

    // Insert a hidden hr on the first slot of the search
    const hrElem: string = `
      <hr id="nav-bar__search--hr" tabindex="0" style="display: none;">
    `;
    searchResults.insertAdjacentHTML("beforeend", hrElem);

    // Tech pages are created by the parser. main saves that and uses it to create the search object
    for (const [key, techDocument] of this.techPages.entries()) {
      if (key.dim === "N/A" || key.document.includes("-C") || key.document.includes("-B")) {
        continue; // Skip items with dim as "N/A" (like readme)
      }

      // Create the game instance to add to the nav-bar
      const parser: DOMParser = new DOMParser();

      // Now read the content to use for the search functionality on the nav-bar
      const doc: Document = parser.parseFromString(techDocument, "text/html");

      // Get all h1 elements in the order they appear in the document
      const headings1: NodeListOf<HTMLHeadingElement> = doc.querySelectorAll("h1");

      // H1s have different styling. Additionally, they should appear first in the list
      headings1.forEach(() => {
        const searchContent1: string = `
          <a href="/${key.document}" 
             title="${key.section}" 
             data-document="${key.document}" 
             class="nav-bar__search--results button__redirect" 
             tabindex="0" 
             data-section="${key.section}" 
             data-tag="game">
            <span class="nav-bar__search--results--games material-symbols-rounded">sports_esports</span>
            <b>${key.section}</b>
          </a>
        `;
        searchContents1L.push(searchContent1);
      });

      const headings2: NodeListOf<HTMLHeadingElement> = doc.querySelectorAll("h1, h2, h3, h4");

      // Process each heading in the order they appear
      let currentH2: string | null = null;
      headings2.forEach((currentHeading) => {
        if (currentHeading.tagName === "H1") {
          // No need to treat h1s again
          currentH2 = null;
        } else {
          if (currentHeading.tagName === "H2") {
            currentH2 = currentHeading.id;
          }
          if (
            (currentH2 === "glitches" || currentH2 === "techniques") &&
            currentHeading.id !== "general-techniques" &&
            currentHeading.tagName !== "H2"
          ) {
            // label is key.section removing "Tales of" and leading and trailing spaces
            const label: string = key.section.replace("Tales of", "").trim();
            const searchContent2: string = `
              <a href="/${key.document}" 
                 title="${key.section}" 
                 data-document="${key.document}" 
                 class="nav-bar__search--results button__redirect" 
                 tabindex="0" 
                 data-section="${key.section}" 
                 data-tag="tech" 
                 data-redirect="#${currentHeading.id}">
                <span class="nav-bar__search--results--games material-symbols-rounded">book_2</span>
                <b>${label}</b>
                <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${currentHeading.textContent || ""}
              </a>
            `;
            searchContents2L.push(searchContent2);
          }
        }
      });
    }

    // Sort the search results
    searchContents1L.sort();
    searchContents2L.sort();
    const searchContents1: string = searchContents1L.join("");
    const searchContents2: string = searchContents2L.join("");

    // Join searchContents1 and searchContents2
    const searchContents: string = `${searchContents1}${searchContents2}`;

    // Insert the HTML on the search bar
    searchResults.insertAdjacentHTML("beforeend", searchContents);

    // Add event listeners to all search result links
    document.querySelectorAll("a.nav-bar__search--results").forEach((item) => {
      if (!(item instanceof HTMLElement)) {
        return; // Exit if item is not an HTMLElement
      }
      this.addPageChangeEvent(item);
    });
  }

  // --- Show all headings for a specific ID
  revealID(id: string): void {
    // Gets the object of the provided ID
    let targetHeading: HTMLElement | null = document.getElementById(id);
    if (!targetHeading) {
      // Target hidden within an h2 section -- first we need to open it
      // Get h2 section from helperObj
      const h2Collection: h2Data[] = this.helperObj.h2Collection;
      if (!h2Collection) {
        return; // Exit if h2Collection is not found
      }

      let h2Section: number = 0;
      for (const collection of h2Collection) {
        if (collection.content.includes(`id="${id}"`)) {
          h2Section = h2Collection.indexOf(collection);
          break;
        }
      }

      const selectorItems: NodeListOf<HTMLElement> = document.querySelectorAll(
        ".content__selectorbox--item",
      );
      if (selectorItems[h2Section]) {
        selectorItems[h2Section].click();
      }
    }

    targetHeading = document.getElementById(id);
    if (!targetHeading) {
      return; // Exit if targetHeading is still not found
    }

    let hiddenItems: string[] | null = null;
    let success: boolean = false;

    // Gets the div that holds all the content for a given heading
    if (targetHeading.tagName === "H4") {
      if (targetHeading.dataset.open) {
        hiddenItems = targetHeading.dataset.open.split(" ");
        success = true;
      }
    } else if (
      targetHeading.parentNode instanceof HTMLElement &&
      targetHeading.parentNode.className.includes("content__")
    ) {
      const firstChild: Element | null = targetHeading.parentNode.firstElementChild;

      if (firstChild instanceof HTMLElement && firstChild?.dataset.open) {
        hiddenItems = firstChild.dataset.open.split(" ");
        success = true;
      }
    } else if (targetHeading.parentNode?.parentNode instanceof HTMLElement) {
      const firstChild: Element | null = targetHeading.parentNode.parentNode.firstElementChild;
      if (firstChild instanceof HTMLElement && firstChild?.dataset.open) {
        hiddenItems = firstChild.dataset.open.split(" ");
        success = true;
      }
    }

    if (success && hiddenItems) {
      // Iterates over all related classes needed to reveal a specific heading
      hiddenItems.forEach((item: string) => {
        const targetList: HTMLCollectionOf<Element> = document.getElementsByClassName(item);
        // Get all objects that are possibly hidden
        for (const target of targetList) {
          const targetElement: Element = target;
          if (!(targetElement instanceof HTMLElement)) {
            continue;
          }
          if (targetElement.hidden) {
            targetElement.hidden = false;
            // Change the button depending on the current state
            if (
              targetElement.parentNode instanceof HTMLElement &&
              targetElement.parentNode.className.includes("content__")
            ) {
              const firstChild: Element | undefined =
                targetElement.parentNode.firstElementChild?.children[0];
              if (firstChild && firstChild.innerHTML === "expand_circle_down") {
                firstChild.innerHTML = "expand_circle_up";
              }
            } else if (targetElement.parentNode?.parentNode instanceof HTMLElement) {
              const firstChild: Element | undefined =
                targetElement.parentNode.parentNode.firstElementChild?.children[0];
              if (firstChild && firstChild.innerHTML === "expand_circle_down") {
                firstChild.innerHTML = "expand_circle_up";
              }
            }
          }
        }
      });
    }
  }
}
