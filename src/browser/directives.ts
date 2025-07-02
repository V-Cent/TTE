// ---------
// directives.js contains styling functions for custom directives.
//   this is after they are already treated as unique elements and get a tagging token
//   we then change the original element here and show what is needed

import { FileEntry, Helper, PageRequest, TagData } from "../shared/helper";
import { fileList } from "../shared/globals";

export class Directives {
  private readonly helperObj: Helper;

  private static readonly ARTICLE_SELECTOR_SELECTOR: string = ".content__article-selector";

  private static readonly TAGGING_COMPUTED_SELECTOR: string = ".tagging-computed";
  private static readonly VERSION_TRIGGER_SELECTOR: string = "[data-tte-version-trigger]";
  private static readonly TODO_TRIGGER_SELECTOR: string = "[data-tte-todo-trigger]";
  private static readonly MEDIA_ICON_SELECTOR: string = "[data-tte-media-icon]";
  private static readonly TABLE_HEADERS_SELECTOR: string = "th";
  private static readonly SPOILER_SELECTOR: string = ".spoiler";

  private readonly handlePageChange: (request: PageRequest) => void;
  private readonly editPage: (page: PageRequest) => void;

  constructor(
    helperObj: Helper,
    handlePageChange: (request: PageRequest) => void,
    editPage: (page: PageRequest) => void,
  ) {
    // Bind methods if needed
    this.compileDirectives = this.compileDirectives.bind(this);
    this.sortTables = this.sortTables.bind(this);
    this.treatSpoilers = this.treatSpoilers.bind(this);
    this.handlePageChange = handlePageChange;
    this.editPage = editPage;

    this.helperObj = helperObj;
  }

  // --- This adds event listeners to elements prepared by compileTags
  compileEvents(): void {
    const taggedElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
      Directives.TAGGING_COMPUTED_SELECTOR,
    );

    // Add this to compileEvents method after other event setups
    const articleSelectors: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
      Directives.ARTICLE_SELECTOR_SELECTOR,
    );

    // Add tooltip for article selector in menu mode
    if (this.helperObj.inEdit) {
      const articleSelectorBox: HTMLElement | null = document.querySelector<HTMLElement>(
        "div.content__article-selector",
      );
      if (articleSelectorBox) {
        this.helperObj.setTooltip(
          articleSelectorBox,
          "Article selection does not function on edit mode.",
        );
      }
    }

    for (const element of articleSelectors) {
      this.setupArticleSelectorEventListeners(element);
    }

    for (const element of taggedElements) {
      const taggedElement: HTMLElement = element;
      const tagTextData: string = taggedElement.dataset.tags ?? "{}";
      const tagData: TagData = JSON.parse(tagTextData.replace(/'/g, '"'));

      if (tagData.versions) {
        this.setupVersionEventListeners(taggedElement, tagData.versions);
      }

      if (tagData.todo) {
        this.setupTodoEventListeners(taggedElement);
      }

      if (tagData.media && tagData.forcedmedia === false) {
        this.setupMediaEventListeners(taggedElement);
      }

      if (taggedElement.classList.contains("content__redirect")) {
        // If data-tags document exists, and edit state is opened, do not add a redirect and instead add a tooltip
        //  "This would have a redirect to: document - tag"
        if (tagData.document && this.helperObj.inEdit) {
          const redirectText: string = `Redirects to: ${tagData.document} - ${tagData.redirect}`;
          this.helperObj.setTooltip(taggedElement, redirectText);
        } else {
          this.helperObj.addPageChangeEvent(taggedElement);
        }
      }
    }
  }

  // --- Setup event listeners for section dropdown menu
  private setupArticleSelectorEventListeners(selectorElement: HTMLElement): void {
    const buttonElement: HTMLButtonElement | null =
      selectorElement.querySelector<HTMLButtonElement>(".content__article-selector--button");
    const menuElement: HTMLElement | null = selectorElement.querySelector<HTMLElement>(
      ".content__article-selector--menu",
    );
    const menuItemElements: NodeListOf<HTMLElement> = selectorElement.querySelectorAll<HTMLElement>(
      ".content__article-selector--item",
    );

    if (!buttonElement || !menuElement) return;

    // Check if already initialized to prevent duplicate listeners
    if (selectorElement.dataset.initialized === "true") return;

    // Toggle dropdown on button click
    buttonElement.addEventListener("click", (clickEvent: Event): void => {
      clickEvent.stopPropagation();
      clickEvent.preventDefault();
      this.toggleArticleSelector(buttonElement, menuElement);
    });

    // Handle item selection for each menu item
    for (const menuItemElement of menuItemElements) {
      menuItemElement.addEventListener("click", (clickEvent: Event): void => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        this.selectArticleSelectorItem(
          selectorElement,
          buttonElement,
          menuElement,
          menuItemElement,
        );
      });
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (clickEvent: Event): void => {
      const targetElement: Node = clickEvent.target as Node;
      if (!selectorElement.contains(targetElement)) {
        this.closeArticleSelector(buttonElement, menuElement);
      }
    };

    document.addEventListener("click", handleClickOutside);

    // Close menu after some time if not selected
    buttonElement.addEventListener("blur", (): void => {
      setTimeout((): void => {
        if (!selectorElement.contains(document.activeElement)) {
          this.closeArticleSelector(buttonElement, menuElement);
        }
      }, 150);
    });

    selectorElement.dataset.initialized = "true";
  }

  // --- Toggle article selector dropdown state
  private toggleArticleSelector(buttonElement: HTMLButtonElement, menuElement: HTMLElement): void {
    const isCurrentlyOpen: boolean = menuElement.classList.contains("open");

    if (isCurrentlyOpen) {
      this.closeArticleSelector(buttonElement, menuElement);
    } else {
      this.openArticleSelector(buttonElement, menuElement);
    }
  }

  // --- Open article selector dropdown
  private openArticleSelector(buttonElement: HTMLButtonElement, menuElement: HTMLElement): void {
    buttonElement.classList.add("open");
    menuElement.classList.add("open");
    buttonElement.setAttribute("aria-expanded", "true");
  }

  // --- Close article selector dropdown
  private closeArticleSelector(buttonElement: HTMLButtonElement, menuElement: HTMLElement): void {
    buttonElement.classList.remove("open");
    menuElement.classList.remove("open");
    buttonElement.setAttribute("aria-expanded", "false");
  }

  // --- Handle article selector item selection and navigation
  private selectArticleSelectorItem(
    selectorElement: HTMLElement,
    buttonElement: HTMLButtonElement,
    menuElement: HTMLElement,
    selectedItemElement: HTMLElement,
  ): void {
    if (this.helperObj.inEdit) {
      // If in edit mode, do not allow selection of items
      this.closeArticleSelector(buttonElement, menuElement);
      return;
    }
    // Handle edit option separately
    if (selectedItemElement.classList.contains("content__article-selector--edit")) {
      this.closeArticleSelector(buttonElement, menuElement);
      this.editPage({
        document: this.helperObj.currentDocument ?? "",
        section: this.helperObj.currentSection ?? "",
        pageType: "tech",
      });
      return;
    }

    this.updateActiveItemState(selectorElement, selectedItemElement);
    this.updateButtonDisplay(buttonElement, selectedItemElement);

    const selectedOptionKey: string | undefined = selectedItemElement.dataset.option;
    if (selectedOptionKey) {
      selectorElement.dataset.active = selectedOptionKey;
    }

    // Close dropdown after selection
    this.closeArticleSelector(buttonElement, menuElement);

    // Only change page if document exists
    const selectedDocument: string | undefined = selectedItemElement.dataset.document;
    if (!selectedDocument) return;
    if (
      !fileList.some((fileEntry: FileEntry): boolean => fileEntry.document === selectedDocument)
    ) {
      return;
    }

    // Navigate to selected document and section
    const navigationRequest: PageRequest = {
      document: selectedDocument ?? "",
      section: selectedItemElement.dataset.section ?? "",
      pageType: "tech",
    };

    this.handlePageChange(navigationRequest);
  }

  // --- Update active state for menu items
  private updateActiveItemState(
    selectorElement: HTMLElement,
    selectedItemElement: HTMLElement,
  ): void {
    // Remove active class from all navigation items (excluding edit option)
    const navigationItemElements: NodeListOf<HTMLElement> =
      selectorElement.querySelectorAll<HTMLElement>(
        ".content__article-selector--item:not(.content__article-selector--edit)",
      );

    for (const navigationItemElement of navigationItemElements) {
      navigationItemElement.classList.remove("active");
    }

    // Add active class to newly selected item
    selectedItemElement.classList.add("active");
  }

  // --- Update button display with selected item content
  private updateButtonDisplay(
    buttonElement: HTMLButtonElement,
    selectedItemElement: HTMLElement,
  ): void {
    const selectedIconElement: HTMLElement | null = selectedItemElement.querySelector<HTMLElement>(
      ".material-symbols-rounded",
    );

    // Extract label text, removing icon text content (group, swords, settings)
    const selectedLabelText: string =
      selectedItemElement.textContent?.trim().replace(/^(group|swords|settings)\s*/, "") ?? "";

    const buttonIconElement: HTMLElement | null = buttonElement.querySelector<HTMLElement>(
      ".material-symbols-rounded:not(.content__article-selector--chevron)",
    );

    if (buttonIconElement && selectedIconElement) {
      buttonIconElement.textContent = selectedIconElement.textContent;
    }

    const buttonLabelElement: HTMLElement | null = buttonElement.querySelector<HTMLElement>(
      ".content__article-selector--label",
    );

    if (buttonLabelElement) {
      buttonLabelElement.textContent = selectedLabelText;
    }
  }

  // --- Setup event listeners for version tooltips
  private setupVersionEventListeners(taggedElement: HTMLElement, versionString: string): void {
    const versionTrigger: HTMLSpanElement | null = taggedElement.querySelector<HTMLSpanElement>(
      Directives.VERSION_TRIGGER_SELECTOR,
    );

    if (!versionTrigger) return;

    const versionText: string = `Version: ${versionString}.`;

    this.helperObj.setTooltip(versionTrigger, versionText);
  }

  // --- Setup event listeners for todo tooltips
  private setupTodoEventListeners(taggedElement: HTMLElement): void {
    const todoTrigger: HTMLSpanElement | null = taggedElement.querySelector<HTMLSpanElement>(
      Directives.TODO_TRIGGER_SELECTOR,
    );

    if (!todoTrigger) return;

    const todoText: string = "This section needs work, is not confirmed or needs testing.";

    this.helperObj.setTooltip(todoTrigger, todoText);
  }

  // --- Setup event listeners for media icons
  private setupMediaEventListeners(taggedElement: HTMLElement): void {
    const mediaIcon: HTMLSpanElement | null = taggedElement.querySelector<HTMLSpanElement>(
      Directives.MEDIA_ICON_SELECTOR,
    );

    if (!mediaIcon) return;

    const mediaSrc: string | undefined = mediaIcon.dataset.mediaSrc;
    const mediaType: "img" | "video" | undefined = mediaIcon.dataset.mediaType as
      | "img"
      | "video"
      | undefined;
    const mediaCaption: string | undefined = mediaIcon.dataset.mediaCaption;

    if (!mediaSrc || !mediaType) return;

    mediaIcon.addEventListener(
      "click",
      (): void => {
        this.handleMediaIconClick(taggedElement, mediaSrc, mediaType, mediaCaption);
      },
      { passive: true },
    );
  }

  // --- Handle media icon click events
  private handleMediaIconClick(
    taggedElement: HTMLElement,
    mediaSrc: string,
    mediaType: "img" | "video",
    mediaCaption?: string,
  ): void {
    const existingMedia: Element | null = document.querySelector(`p[data-media="${mediaSrc}"]`);

    if (existingMedia) {
      existingMedia.remove();
      return;
    }

    const mediaHolder: HTMLElement = this.helperObj.createMediaElement(
      document,
      mediaType,
      mediaSrc,
      640,
      480,
      mediaCaption,
    );

    mediaHolder.dataset.media = mediaSrc; // Important for removal
    taggedElement.parentNode?.insertBefore(mediaHolder, taggedElement.nextSibling);
  }

  // --- Style every directive for the current #content
  compileDirectives(): void {
    this.compileEvents();
    this.sortTables();
    this.treatSpoilers();
  }

  // --- Tables is not a custom directives but a native one. We style them here anyways
  sortTables(): void {
    // Iterate over all table headers
    const tableHeaders: NodeListOf<HTMLTableCellElement> =
      document.querySelectorAll<HTMLTableCellElement>(Directives.TABLE_HEADERS_SELECTOR);

    for (const element of tableHeaders) {
      const tableHeader: HTMLTableCellElement = element;

      // Add a cosmetic sort span
      tableHeader.innerHTML += '<span class="material-symbols-rounded">swap_vert</span>';

      // Add click event listener to sort the table
      tableHeader.addEventListener("click", (): void => {
        this.handleTableHeaderClick(tableHeader);
      });
    }
  }

  // --- Handle table header click for sorting
  private handleTableHeaderClick(tableHeader: HTMLTableCellElement): void {
    const table: HTMLTableElement | null = tableHeader.closest("table");
    const tableBody: HTMLTableSectionElement | null = table?.querySelector("tbody") ?? null;

    if (!tableBody) return;

    const tableRows: HTMLTableRowElement[] = Array.from(
      tableBody.querySelectorAll<HTMLTableRowElement>("tr"),
    );

    const parentChildren: Element[] = Array.from(tableHeader.parentNode?.children ?? []);
    const columnIndex: number = parentChildren.indexOf(tableHeader);
    const isCurrentlyAscending: boolean = tableHeader.dataset.asc === "true";
    const newSortDirection: boolean = !isCurrentlyAscending;

    // Helper function to get the value of a table cell
    const getCellValue = (tableRow: HTMLTableRowElement, columnIndex: number): string => {
      return tableRow.children[columnIndex]?.textContent?.trim() ?? "";
    };

    // Helper function to compare two rows based on the column index
    const createRowComparer = (
      columnIndex: number,
      isAscending: boolean,
    ): ((rowA: HTMLTableRowElement, rowB: HTMLTableRowElement) => number) => {
      return (rowA: HTMLTableRowElement, rowB: HTMLTableRowElement): number => {
        const value1: string = getCellValue(isAscending ? rowA : rowB, columnIndex);
        const value2: string = getCellValue(isAscending ? rowB : rowA, columnIndex);

        if (value1 === "" || value2 === "") {
          return value1.localeCompare(value2);
        }

        const number1: number = Number(value1);
        const number2: number = Number(value2);

        // Compare numbers if both values are numeric
        if (!isNaN(number1) && !isNaN(number2)) {
          return number1 - number2;
        }

        return value1.localeCompare(value2);
      };
    };

    // Sort rows and append them back to the table body
    const sortedRows: HTMLTableRowElement[] = tableRows.toSorted(
      createRowComparer(columnIndex, newSortDirection),
    );

    for (const element of sortedRows) {
      tableBody.appendChild(element);
    }

    // Update the sort direction
    tableHeader.dataset.asc = newSortDirection.toString();
  }

  // --- Spoilers have their background removed when clicked (only once)
  treatSpoilers(): void {
    const spoilerElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
      Directives.SPOILER_SELECTOR,
    );

    for (const element of spoilerElements) {
      element.addEventListener(
        "click",
        (clickEvent: Event): void => {
          const targetElement: EventTarget | null = clickEvent.currentTarget;

          if (!(targetElement instanceof HTMLElement)) return;

          targetElement.style.background = "transparent";
        },
        { passive: true },
      );
    }
  }
}
