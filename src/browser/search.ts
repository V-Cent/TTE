// ---------
// search.js controls the search actions and redirects

import { h2Data, Helper } from "../shared/helper.js";

export class Search {
  private isNavigationLocked: boolean;
  private currentActiveSearchType: string | null;
  private readonly addPageChangeEventCallback: (element: HTMLElement) => void;
  private readonly helperObj: Helper;

  private readonly searchBoxSelector: string = "#nav-bar__searchbox";
  private readonly searchInputSelector: string = "#nav-bar__search--input";
  private readonly searchHrSelector: string = "#nav-bar__search--hr";

  // Search configuration
  private static readonly HARDCODED_FILTERS: readonly string[] = ["TALES OF", "T", "TO"] as const;
  private static readonly MAX_TECH_RESULTS: number = 12;

  constructor(addPageChangeEventCallback: (element: HTMLElement) => void, helperObj: Helper) {
    // Blocks other forms of search when one is active
    this.isNavigationLocked = false;
    this.currentActiveSearchType = null;
    this.addPageChangeEventCallback = addPageChangeEventCallback;
    this.helperObj = helperObj;

    // Bind methods to preserve 'this' context
    this.handleSearchBoxClick = this.handleSearchBoxClick.bind(this);
    this.handleInputKeyUp = this.handleInputKeyUp.bind(this);
    this.handleInputFocusIn = this.handleInputFocusIn.bind(this);
    this.handleSearchBoxFocusOut = this.handleSearchBoxFocusOut.bind(this);
  }

  // --- Init nav-bar search functionality
  initializeSearchIcons(): void {
    // Setup search
    const searchBoxElement: HTMLElement | null = document.querySelector(this.searchBoxSelector);
    if (!searchBoxElement) {
      return; // Exit if the search element is not found
    }

    searchBoxElement.addEventListener("click", this.handleSearchBoxClick);

    // Add filtering when the user types something
    const searchInputElement: HTMLInputElement | null = document.querySelector(
      this.searchInputSelector,
    );
    if (searchInputElement) {
      searchInputElement.addEventListener("keyup", this.handleInputKeyUp);
      searchInputElement.addEventListener("focusin", this.handleInputFocusIn);
    }

    // Dynamically add the `targetParam` property to the `search` element
    // TODO: This is currently only ever search, if games are gone kept as in this functionality can be removed
    (searchBoxElement as HTMLElement & { targetParam: string }).targetParam = "search";

    const gamesIconElement: HTMLElement | null = document.querySelector("#nav-bar__games--icon");
    gamesIconElement?.addEventListener("click", this.performGamesSearch.bind(this));

    // Clears search when you focusout (click out of the search input, use tab ...)
    searchBoxElement.addEventListener("focusout", this.handleSearchBoxFocusOut);
  }

  // --- Homepage icon works the same way as the one inside the search box
  initializeOnboardingIcon(): void {
    const onboardingIconElement: HTMLElement | null = document.querySelector(
      "#content__home__onboarding--icon",
    );
    onboardingIconElement?.addEventListener("click", this.performGamesSearch.bind(this));
  }

  // --- Click event for the search field
  private handleSearchBoxClick(clickEvent: Event): void {
    if (this.isNavigationLocked) {
      return;
    }

    // Get element and its type (games or search)
    const targetElement: EventTarget | null = clickEvent.currentTarget;
    if (!targetElement || !(targetElement instanceof HTMLElement)) {
      return;
    }

    const searchElement: HTMLElement & { targetParam?: string } = targetElement;
    const searchType: string | undefined = searchElement.targetParam;

    if (!searchType) {
      return; // Exit if targetParam is not defined
    }

    // Define the search type and init functionality
    this.currentActiveSearchType = searchType;
    this.displaySearchBox("#nav-bar__search");
  }

  // --- Makes the box for games or search appear
  private displaySearchBox(searchElementId: string): void {
    if (this.isNavigationLocked) {
      return;
    }

    const searchIconElement: HTMLElement | null = document.querySelector(searchElementId);
    if (!searchIconElement) {
      return; // Exit if the search icon element is not found
    }

    // Remove the click listener to prevent duplicate event handling
    searchIconElement.removeEventListener("click", this.handleSearchBoxClick);

    const searchBoxId: string = `${searchElementId}box`;
    const inputElementId: string = `${searchElementId}--input`;

    const searchBoxElement: HTMLElement | null = document.querySelector(searchBoxId);
    const inputFieldElement: HTMLInputElement | null = document.querySelector(inputElementId);

    if (!searchBoxElement) {
      return; // Exit if the base element is not found
    }

    const { clientWidth }: { clientWidth: number } = document.body;
    // TODO have these as member variables for ease-of-test
    const searchBoxWidth: number =
      this.currentActiveSearchType === "search" && clientWidth >= 480 ? 400 : 280;

    searchBoxElement.style.width = `${searchBoxWidth}px`;

    // Focus on the elements to use focusout to exit them
    if (this.currentActiveSearchType === "search") {
      inputFieldElement?.focus();
    } else {
      searchBoxElement.focus();
    }
  }

  // --- Handle focus out event for search box
  private handleSearchBoxFocusOut(focusEvent: FocusEvent): void {
    const searchFieldElement: HTMLElement | null = document.querySelector("#nav-bar__search");
    if (!searchFieldElement) {
      return;
    }

    focusEvent.stopPropagation();

    if (
      !(focusEvent.relatedTarget instanceof Node) ||
      !searchFieldElement.contains(focusEvent.relatedTarget)
    ) {
      this.clearSearchResults();
    }
  }

  // --- Handle input keyup events
  private handleInputKeyUp(): void {
    this.filterSearchResults().then();
  }

  // --- Handle input focus in events
  private handleInputFocusIn(): void {
    this.filterSearchResults().then();
  }

  // --- Clear everything from results
  public clearSearchResults(): void {
    // Function to hide all computed links
    const searchBoxElement: HTMLElement | null = document.querySelector(this.searchBoxSelector);
    if (!searchBoxElement) {
      return; // Exit if the search box element is not found
    }

    this.isNavigationLocked = true;

    const linkElements: HTMLElement[] = Array.from(
      searchBoxElement.getElementsByClassName("button__redirect"),
    ).filter((element: Element): element is HTMLElement => element instanceof HTMLElement);

    for (const linkElement of linkElements) {
      linkElement.style.display = "none";
    }

    const horizontalRuleElement: HTMLElement | null = document.querySelector(this.searchHrSelector);
    if (horizontalRuleElement) {
      horizontalRuleElement.style.display = "none";
    }

    // Re-add the click listener after clearing
    searchBoxElement.addEventListener("click", this.handleSearchBoxClick);
    this.isNavigationLocked = false;
  }

  // --- Filter up to 12 options when you type something in search
  private async filterSearchResults(): Promise<void> {
    const searchElementIdReference: string = "#nav-bar__search";

    const searchCountElement: HTMLElement | null = document.querySelector(
      ".nav-bar__search--results",
    );

    if (!searchCountElement) {
      await this.populateSearchResults();
    }

    // Gets the value from the user input, set each word into an array
    const inputElement: HTMLInputElement | null = document.querySelector(
      `${searchElementIdReference}--input`,
    );
    if (!inputElement) {
      return; // Exit if the input element is not found
    }

    const filterText: string = inputElement.value.toUpperCase().trim();
    const filterWordsArray: string[] = filterText.split(" ");

    // Gets the element of the container and all current computed links
    const searchBoxElement: HTMLElement | null = document.querySelector(
      `${searchElementIdReference}box`,
    );
    if (!searchBoxElement) {
      return; // Exit if the search box element is not found
    }

    const linkElements: HTMLElement[] = Array.from(
      searchBoxElement.getElementsByClassName("button__redirect"),
    ).filter((element: Element): element is HTMLElement => element instanceof HTMLElement);

    let visibleSearchResultsCount: number = 0;

    for (const linkElement of linkElements) {
      const shouldShowLink: boolean = this.shouldShowSearchResult(
        linkElement,
        filterWordsArray,
        filterText,
      );

      if (shouldShowLink) {
        const isHardcodedFilter: boolean = Search.HARDCODED_FILTERS.some(
          (filter: string) => filter === filterText || filter.includes(filterText),
        );

        if (isHardcodedFilter && linkElement.dataset.tag === "game") {
          linkElement.style.display = "flex";
          continue;
        } else if (isHardcodedFilter) {
          // If it's a hardcoded filter but not a game, we skip it
          linkElement.style.display = "none";
          continue;
        }

        // Tech entry -- Hard limit of 12 options on screen
        const shouldDisplay: boolean =
          visibleSearchResultsCount < Search.MAX_TECH_RESULTS || linkElement.dataset.tag === "game";
        linkElement.style.display = shouldDisplay ? "flex" : "none";

        if (shouldDisplay) {
          visibleSearchResultsCount++;
        }
      } else {
        linkElement.style.display = "none";
      }
    }

    // Separator between search results and input field
    this.updateSearchSeparator(visibleSearchResultsCount, filterText);
  }

  // --- Helper method to determine if a search result should be shown
  private shouldShowSearchResult(
    linkElement: HTMLElement,
    filterWordsArray: string[],
    filterText: string,
  ): boolean {
    if (filterText.length === 0) {
      return false;
    }

    const linkTextContent: string = [
      linkElement.textContent ?? linkElement.innerText ?? "",
      linkElement.dataset.section ?? "",
      linkElement.dataset.document ?? "",
    ]
      .join(" ")
      .toUpperCase();

    return filterWordsArray.every((filterWord: string) => linkTextContent.includes(filterWord));
  }

  // --- Helper method to update the search separator visibility
  private updateSearchSeparator(visibleResultsCount: number, filterText: string): void {
    const horizontalRuleElement: HTMLElement | null = document.querySelector(this.searchHrSelector);
    if (!horizontalRuleElement) {
      return;
    }

    const isHardcodedFilter: boolean = Search.HARDCODED_FILTERS.some(
      (filter: string) => filter === filterText || filter.includes(filterText),
    );

    const shouldShowSeparator: boolean =
      filterText.length > 0 && (visibleResultsCount > 0 || isHardcodedFilter);

    horizontalRuleElement.style.display = shouldShowSeparator ? "block" : "none";
  }

  // --- Perform a pre-defined search for games
  private performGamesSearch(): void {
    // Game search now uses the normal search menu and just fills it with "Tales of"
    const searchBoxElement: HTMLElement | null = document.querySelector(this.searchBoxSelector);
    if (!searchBoxElement) {
      return; // Exit if the search box element is not found
    }

    this.clearSearchResults();

    this.isNavigationLocked = false;

    const inputFieldElement: HTMLInputElement | null = document.querySelector(
      this.searchInputSelector,
    );
    if (!inputFieldElement) {
      return; // Exit if the input field is not found
    }

    inputFieldElement.value = "Tales of";
    inputFieldElement.focus();
  }

  // --- Fill search results based on loaded games
  private async populateSearchResults(): Promise<void> {
    // Get all items on the tab bar
    const searchResultsContainer: HTMLElement | null = document.querySelector(
      this.searchBoxSelector,
    );
    if (!searchResultsContainer) {
      return; // Exit if the search results container is not found
    }

    try {
      // Dynamic import - only loads when needed
      //  this is built by workflow. tsc should believe it is there.
      const { cachedSearchResultsHTML }: { cachedSearchResultsHTML: string } = await import(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-start
        "../../cache/searchHTML.js"
      );

      const decompressedHTML: string = await this.helperObj.decompress(cachedSearchResultsHTML);

      // Insert a hidden hr on the first slot of the search
      const horizontalRuleHtml: string = `<hr id="nav-bar__search--hr" tabindex="0" style="display: none;">`;
      const searchResultsHtml: string = `<div id="nav-bar__search-results-container">${decompressedHTML}</div>`;
      searchResultsContainer.insertAdjacentHTML(
        "beforeend",
        horizontalRuleHtml + searchResultsHtml,
      );

      // Add event listeners to all search result links
      const searchResultElements: NodeListOf<Element> = document.querySelectorAll(
        "a.nav-bar__search--results",
      );
      for (const searchResultItem of searchResultElements) {
        if (searchResultItem instanceof HTMLElement) {
          this.addPageChangeEventCallback(searchResultItem);
        }
      }
      // Re-add focus if it is lost -- fixes lack of focusout event on search load.
      searchResultsContainer.focus();
    } catch (error) {
      console.error("Failed to load search results:", error);
    }
  }

  // --- Show all headings for a specific ID
  async revealElementById(targetElementId: string): Promise<void> {
    // Gets the object of the provided ID
    let targetHeadingElement: HTMLElement | null = document.getElementById(targetElementId);

    if (!targetHeadingElement) {
      // Target hidden within an h2 section -- first we need to open it
      const h2SectionIndex: number = this.findH2SectionIndex(targetElementId);
      if (h2SectionIndex === -1) {
        return; // Exit if not found in h2Collection
      }

      const selectorItemElements: NodeListOf<HTMLElement> = document.querySelectorAll(
        ".content__selectorbox--item",
      );
      selectorItemElements[h2SectionIndex]?.click();

      // Force two DOM updates
      await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => {
          requestAnimationFrame((): void => {
            resolve();
          });
        });
      });

      // Try to get the element again after opening the section
      targetHeadingElement = document.getElementById(targetElementId);
    }

    if (!targetHeadingElement) {
      return; // Exit if targetHeading is still not found
    }

    const hiddenElementClasses: string[] | null =
      this.getHiddenElementClasses(targetHeadingElement);
    if (!hiddenElementClasses) {
      return; // Exit if no hidden classes found
    }

    for (const className of hiddenElementClasses) {
      await this.revealElementsByClassName(className);
    }
  }

  // --- Helper method to find H2 section index
  private findH2SectionIndex(targetElementId: string): number {
    const h2DataCollection: h2Data[] = this.helperObj.h2Collection;
    if (!h2DataCollection) {
      return -1;
    }

    return h2DataCollection.findIndex(
      (h2DataItem: h2Data) =>
        h2DataItem.content.includes(`id="${targetElementId}"`) || h2DataItem.id === targetElementId,
    );
  }

  // --- Helper method to get hidden element classes
  private getHiddenElementClasses(targetHeadingElement: HTMLElement): string[] | null {
    if (targetHeadingElement.tagName === "H4" && targetHeadingElement.dataset.open) {
      return targetHeadingElement.dataset.open.split(" ");
    }

    // Check parent node for content classes
    const parentNode: HTMLElement | null = targetHeadingElement.parentNode as HTMLElement;
    if (parentNode?.className.includes("content__")) {
      const firstChildElement: HTMLElement = parentNode.firstElementChild as HTMLElement;
      if (firstChildElement?.dataset.open) {
        return firstChildElement.dataset.open.split(" ");
      }
    }

    // Check grandparent node
    const grandParentNode: HTMLElement | null = parentNode?.parentNode as HTMLElement;
    if (grandParentNode) {
      const firstChildElement: HTMLElement = grandParentNode.firstElementChild as HTMLElement;
      if (firstChildElement?.dataset.open) {
        return firstChildElement.dataset.open.split(" ");
      }
    }

    return null;
  }

  // --- Helper method to reveal elements by class name
  private async revealElementsByClassName(className: string): Promise<void> {
    const targetElementsByClass: HTMLCollectionOf<Element> =
      document.getElementsByClassName(className);

    for (const targetElement of targetElementsByClass) {
      if (!(targetElement instanceof HTMLElement) || !targetElement.hidden) {
        continue;
      }

      targetElement.hidden = false;
      this.updateExpandIcon(targetElement);
    }

    // Force two DOM updates
    await new Promise<void>((resolve: () => void): void => {
      requestAnimationFrame((): void => {
        requestAnimationFrame((): void => {
          resolve();
        });
      });
    });
  }

  // --- Helper method to update expand icon state
  private updateExpandIcon(targetElement: HTMLElement): void {
    // Our hierarchy is like this:
    //  div (content__h3)
    //    button (expand_circle_down or expand_circle_up)
    //    h3
    // Our target is the h3, thus we need to get the first child of the div
    const getExpandIcon = (element: HTMLElement): Element | null => {
      const parentNode: HTMLElement | null = element.parentNode as HTMLElement;
      if (parentNode?.className.includes("content__")) {
        return parentNode.firstElementChild?.children[0] ?? null;
      }

      // sometimes h3 is in a block (directive)
      const grandParentNode: HTMLElement | null = parentNode?.parentNode as HTMLElement;
      return grandParentNode?.firstElementChild?.children[0] ?? null;
    };

    const expandIconElement: Element | null = getExpandIcon(targetElement);
    if (expandIconElement instanceof HTMLElement) {
      // Add rotation class when revealing content
      if (expandIconElement.classList.contains("rotated")) {
        expandIconElement.classList.remove("rotated");
      }
    }
  }
}
