// ---------
// directives.js contains styling functions for custom directives.
//   this is after they are already treated as unique elements and get a tagging token
//   we then change the original element here and show what is needed

import { Helper, TagData } from "../shared/helper";

export class Directives {
  private readonly helperObj: Helper;

  private static readonly TAGGING_COMPUTED_SELECTOR: string = ".tagging-computed";
  private static readonly VERSION_TRIGGER_SELECTOR: string = "[data-tte-version-trigger]";
  private static readonly TODO_TRIGGER_SELECTOR: string = "[data-tte-todo-trigger]";
  private static readonly MEDIA_ICON_SELECTOR: string = "[data-tte-media-icon]";
  private static readonly TABLE_HEADERS_SELECTOR: string = "th";
  private static readonly SPOILER_SELECTOR: string = ".spoiler";

  constructor(helperObj: Helper) {
    // Bind methods if needed
    this.compileDirectives = this.compileDirectives.bind(this);
    this.sortTables = this.sortTables.bind(this);
    this.treatSpoilers = this.treatSpoilers.bind(this);

    this.helperObj = helperObj;
  }

  // --- This adds event listeners to elements prepared by compileTags
  compileEvents(): void {
    const taggedElements: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>(
      Directives.TAGGING_COMPUTED_SELECTOR,
    );

    for (const element of taggedElements) {
      const taggedElement: HTMLElement = element;
      const tagTextData: string = taggedElement.dataset.tags ?? "{}";
      const tagData: TagData = JSON.parse(tagTextData.replace(/'/g, '"'));

      if (tagData.sections) {
        this.setupSectionEventListeners(taggedElement);
      }

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
        this.helperObj.addPageChangeEvent(taggedElement);
      }
    }
  }

  // --- Setup event listeners for section radio buttons
  private setupSectionEventListeners(taggedElement: HTMLElement): void {
    const sectionInputs: NodeListOf<HTMLInputElement> =
      taggedElement.querySelectorAll<HTMLInputElement>('input[name="sections"]');

    for (const element of sectionInputs) {
      const inputElement: HTMLInputElement = element;
      this.helperObj.addPageChangeEvent(inputElement);
    }
  }

  // --- Setup event listeners for version tooltips
  private setupVersionEventListeners(taggedElement: HTMLElement, versionString: string): void {
    const versionTrigger: HTMLSpanElement | null = taggedElement.querySelector<HTMLSpanElement>(
      Directives.VERSION_TRIGGER_SELECTOR,
    );

    if (!versionTrigger) return;

    const versionText: string = `Version: ${versionString}.`;

    versionTrigger.addEventListener(
      "mouseover",
      (): void => {
        this.helperObj.loadTooltip(versionTrigger, versionText);
      },
      { passive: true },
    );

    versionTrigger.addEventListener(
      "mouseleave",
      (): void => {
        this.helperObj.unloadTooltip();
      },
      { passive: true },
    );
  }

  // --- Setup event listeners for todo tooltips
  private setupTodoEventListeners(taggedElement: HTMLElement): void {
    const todoTrigger: HTMLSpanElement | null = taggedElement.querySelector<HTMLSpanElement>(
      Directives.TODO_TRIGGER_SELECTOR,
    );

    if (!todoTrigger) return;

    const todoText: string = "This section needs work, is not confirmed or needs testing.";

    todoTrigger.addEventListener(
      "mouseover",
      (): void => {
        this.helperObj.loadTooltip(todoTrigger, todoText);
      },
      { passive: true },
    );

    todoTrigger.addEventListener(
      "mouseleave",
      (): void => {
        this.helperObj.unloadTooltip();
      },
      { passive: true },
    );
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
      const sortedRow: HTMLTableRowElement = element;
      tableBody.appendChild(sortedRow);
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
      const spoilerElement: HTMLElement = element;

      spoilerElement.addEventListener(
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
