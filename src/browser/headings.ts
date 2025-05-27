// ---------
// headings.js contains styling functions for headings. ex: ## ### ####
//   used a lot in tech documents.

import { Helper, colors, colorCollection } from "../shared/helper";

export class Headings {
  private readonly colorCollection: Record<colors, string>;
  private readonly helperObj: Helper;

  private static readonly CHEVRON_UPDATE_DELAY: number = 700;

  constructor(helperObj: Helper) {
    this.colorCollection = colorCollection;
    this.helperObj = helperObj;

    // Bind methods to preserve 'this' context
    this.collapseHeadingStyle = this.collapseHeadingStyle.bind(this);
  }

  // --- Adds collapse functionality to headings
  //      for ##, it also splits them into unique sections
  collapseHeadings(): void {
    this.helperObj.dragScrollElement("#content__selectorbox", 0);

    this.setupChevrons();

    const contentElem: HTMLElement | null = document.getElementById("content");
    if (contentElem !== null) {
      contentElem.style.visibility = "visible";
    }
  }

  // --- Setup chevrons to scroll h2 selection if there is not enough space
  setupChevrons(): void {
    // Get all required elements
    // TODO an interface would be nice
    const chevronElements: {
      chevronBox: HTMLElement;
      chevronLeft: HTMLElement;
      chevronRight: HTMLElement;
      selectorBox: HTMLElement;
    } | null = this.getChevronElements();
    if (!chevronElements) return;

    const {
      chevronBox,
      chevronLeft,
      chevronRight,
      selectorBox,
    }: {
      chevronBox: HTMLElement;
      chevronLeft: HTMLElement;
      chevronRight: HTMLElement;
      selectorBox: HTMLElement;
    } = chevronElements;

    // Check if chevrons are necessary or not and which ones should be active
    const updateChevronVisibility = (): void => {
      const selectorBoxWidth: number = selectorBox.clientWidth;
      const selectorBoxScrollWidth: number = selectorBox.scrollWidth;

      if (selectorBoxWidth < selectorBoxScrollWidth) {
        Object.assign(chevronBox.style, {
          display: "block",
          left: `${selectorBox.getBoundingClientRect().right}px`,
        });
      } else {
        chevronBox.style.display = "none";
      }

      const scrollLeft: number = selectorBox.scrollLeft;

      chevronLeft.classList.toggle("active", scrollLeft > 0);
      chevronRight.classList.toggle(
        "active",
        scrollLeft < selectorBoxScrollWidth - selectorBoxWidth,
      );
    };

    // Initial visibility check
    updateChevronVisibility();

    this.setupChevronEventListeners(
      chevronLeft,
      chevronRight,
      selectorBox,
      updateChevronVisibility,
    );
  }

  // --- Helper method to get chevron elements
  private getChevronElements(): {
    chevronBox: HTMLElement;
    chevronLeft: HTMLElement;
    chevronRight: HTMLElement;
    selectorBox: HTMLElement;
  } | null {
    const chevronBox: HTMLElement | null = document.getElementById("content__mobilechevrons");
    const chevronLeft: HTMLElement | null = document.querySelector(
      ".content__mobilechevrons--left",
    );
    const chevronRight: HTMLElement | null = document.querySelector(
      ".content__mobilechevrons--right",
    );
    const selectorBox: HTMLElement | null = document.getElementById("content__selectorbox");

    if (!chevronBox || !chevronLeft || !chevronRight || !selectorBox) {
      return null;
    }

    return { chevronBox, chevronLeft, chevronRight, selectorBox };
  }

  // --- Setup event listeners for chevron functionality
  private setupChevronEventListeners(
    chevronLeft: HTMLElement,
    chevronRight: HTMLElement,
    selectorBox: HTMLElement,
    updateChevronVisibility: () => void,
  ): void {
    // Add resize event listener to update chevron visibility
    window.addEventListener("resize", updateChevronVisibility);

    // Add click event listener for the left chevron
    chevronLeft.addEventListener("click", (): void => {
      this.handleChevronClick(selectorBox, "left", updateChevronVisibility);
    });

    // Add click event listener for the right chevron
    chevronRight.addEventListener("click", (): void => {
      this.handleChevronClick(selectorBox, "right", updateChevronVisibility);
    });

    // Add scroll event listener to update chevron states dynamically
    selectorBox.addEventListener("scroll", updateChevronVisibility);
  }

  // --- Handle chevron click events
  private handleChevronClick(
    selectorBox: HTMLElement,
    direction: "left" | "right",
    updateChevronVisibility: () => void,
  ): void {
    const selectorBoxWidth: number = selectorBox.offsetWidth;

    const newScrollLeft: number =
      direction === "left"
        ? Math.max(0, selectorBox.scrollLeft - selectorBoxWidth)
        : Math.min(
            selectorBox.scrollWidth - selectorBoxWidth,
            selectorBox.scrollLeft + selectorBoxWidth,
          );

    selectorBox.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    setTimeout(() => updateChevronVisibility(), Headings.CHEVRON_UPDATE_DELAY);
  }

  // --- This is the collapse event for when you click the icon for an h3
  collapseHeadingStyle(event: Event): void {
    const currentTarget: EventTarget | null = event.currentTarget;

    if (!currentTarget || !(currentTarget instanceof HTMLElement) || !currentTarget.dataset.open) {
      return;
    }

    // Check the tags related to the current button
    const openTags: string[] = currentTarget.dataset.open.split(" ");

    for (const tag of openTags) {
      const openTag: string = tag;
      this.toggleElementsByClassName(openTag, currentTarget, openTags.indexOf(openTag) === 0);
    }
  }

  // --- Helper method to toggle elements by class name
  private toggleElementsByClassName(
    className: string,
    currentTarget: HTMLElement,
    isFirstTag: boolean,
  ): void {
    const targetList: HTMLCollectionOf<Element> = document.getElementsByClassName(className);

    // Get all objects that are possibly hidden
    for (const element of targetList) {
      const targetElement: Element = element;

      if (!(targetElement instanceof HTMLElement)) {
        continue;
      }

      if (targetElement.hidden) {
        targetElement.hidden = false;
        this.updateExpandIcon(currentTarget, "expand_circle_up");
      } else if (isFirstTag) {
        // Only hide if the click target is the current heading level and is currently not hidden
        targetElement.hidden = true;
        this.updateExpandIcon(currentTarget, "expand_circle_down");
      }
    }
  }

  // --- Helper method to update expand icon
  private updateExpandIcon(currentTarget: HTMLElement, iconText: string): void {
    const firstChild: Element | null = currentTarget.children[0];

    if (firstChild?.innerHTML !== iconText) {
      if (firstChild) {
        firstChild.innerHTML = iconText;
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

    for (const element of headings) {
      const heading: HTMLHeadingElement = element;
      heading.style.cursor = "copy";

      heading.addEventListener("click", (): void => {
        const headingUrl: string = `${baseUrl}/${pathname}/${heading.id}`;

        // Set text to clipboard or do nothing
        void navigator.clipboard.writeText(headingUrl).catch(() => {});
      });
    }
  }
}
