// ---
// directives.js contains styling functions for custom directives.
//   this is after they are already treated as unique elements and get a tagging token
//   we then change the original element here and show what is needed

import { Helper, TagData } from "./helper";

export class Directives {
  private helperObj: Helper;
  private katexObj: { renderToString: (input: string) => string } | null;

  constructor(helperObj: Helper) {
    // Bind methods if needed
    this.compileDirectives = this.compileDirectives.bind(this);
    this.sortTables = this.sortTables.bind(this);
    this.treatSpoilers = this.treatSpoilers.bind(this);
    this.styleImages = this.styleImages.bind(this);
    this.compileTags = this.compileTags.bind(this);

    this.helperObj = helperObj;
    this.katexObj = null;
  }

  // --- This is used to set the KaTeX object from the main script
  setKatex(katex: { renderToString: (input: string) => string }): void {
    this.katexObj = katex;
  }

  // --- This transforms elements that were tagged (part of a custom directive) to something we can manipulate on HTML or with CSS
  compileTags(): void {
    // Iterate over every element that needs tagging
    document.querySelectorAll<HTMLElement>(".tagging, .tagging-text").forEach((taggedElement) => {
      if (taggedElement.classList.contains("tagging-computed")) {
        return;
      }
      taggedElement.classList.add("tagging-computed");

      // Get tags from the dataset (saved as JSON)
      const tagTextData: string = taggedElement.dataset.tags || "{}";
      const tagData: TagData = JSON.parse(tagTextData.replace(/'/g, '"'));

      // Helper function to create media elements (images or videos)
      const createMediaElement = (
        type: "img" | "video",
        src: string,
        width: number,
        height: number,
        caption?: string,
      ): HTMLElement => {
        const mediaHolder: HTMLParagraphElement = document.createElement("p");
        mediaHolder.style.opacity = "1";

        let mediaTag: HTMLImageElement | HTMLVideoElement;
        if (type === "img") {
          mediaTag = document.createElement("img");
          // For SEO. This could take data from something else in the future.
          mediaTag.alt = "";
        } else {
          mediaTag = document.createElement("video");
          mediaTag.preload = "metadata";
          mediaTag.controls = true;
          mediaTag.muted = true;
          mediaTag.loop = true;

          const source: HTMLSourceElement = document.createElement("source");
          source.src = src;
          source.type = "video/mp4";
          mediaTag.appendChild(source);
        }

        // Common properties for both images and videos
        mediaTag.draggable = false;
        mediaTag.width = width;
        mediaTag.height = height;
        mediaTag.style.order = "2";
        mediaTag.style.width = "80%";
        mediaTag.style.height = "auto";
        mediaTag.style.maxWidth = "640px";
        mediaTag.style.outline = "none";
        mediaTag.style.borderRadius = "14px";
        mediaTag.src = src;

        mediaHolder.appendChild(mediaTag);

        // Add caption if provided
        if (caption) {
          const captionElement: HTMLElement = document.createElement("figcaption");
          captionElement.textContent = `\xa0${caption}\xa0`; // Non-breaking spaces for better formatting
          mediaHolder.appendChild(captionElement);
        }

        return mediaHolder;
      };

      // Helper function to add a media icon for toggling media elements
      const addMediaIcon = (
        type: "img" | "video",
        src: string,
        caption: string | undefined,
      ): void => {
        const mediaTag: HTMLSpanElement = document.createElement("span");
        mediaTag.dataset.media = src;
        mediaTag.className = "material-symbols-rounded";
        mediaTag.style.marginRight = "15px";
        mediaTag.style.cursor = "pointer";
        mediaTag.textContent = type === "img" ? "imagesmode" : "play_circle";

        taggedElement.appendChild(mediaTag);

        mediaTag.addEventListener("click", () => {
          const mediaType: "img" | "video" = type === "img" ? "img" : "video";
          const existingMedia: Element | null = document.querySelector(
            `p[data-media="${mediaTag.dataset.media}"]`,
          );

          if (existingMedia) {
            existingMedia.remove();
            return;
          }
          const mediaHolder: HTMLElement = createMediaElement(mediaType, src, 640, 480, caption);
          mediaHolder.dataset.media = src;
          taggedElement.parentNode?.insertBefore(mediaHolder, taggedElement.nextSibling);
        });
      };

      // Treat sections tag
      if (tagData.sections) {
        // Sections tag is for article selection in tech pages
        let systemActive: string = "checked";
        let systemSpan: string = " <span>(LOADED)</span>";
        let bossesActive: string = "";
        let bossesSpan: string = "";
        let charActive: string = "";
        let charSpan: string = "";

        if (tagData.article === "b") {
          bossesActive = "checked";
          bossesSpan = " <span>(LOADED)</span>";
          systemActive = "";
          systemSpan = "";
          charActive = "";
          charSpan = "";
        } else if (tagData.article === "c") {
          charActive = "checked";
          charSpan = " <span>(LOADED)</span>";
          bossesActive = "";
          bossesSpan = "";
          systemActive = "";
          systemSpan = "";
        }

        // Token ?? means either the data or, if null/undentified, the value after ??
        const currentDocument: string = (this.helperObj.currentDocument ?? "")
          .replace("-C", "")
          .replace("-B", "");
        const currentSection: string = this.helperObj.currentSection ?? "";

        // TODO : Better option for this would be a drop-down aligned to the h1. Group after group (h2 selection) like this are usually bad for UX.
        const sectionsHTML: string = `
          <div id="content__sections">
            <div class="content__sections--entry">
              <div class="content__sections--input-label">
                <input type="radio" id="systems" name="sections" value="systems" data-redirect="NONE" data-document="${currentDocument}" data-section="${currentSection}" ${systemActive} />
                <label for="systems">Systems${systemSpan}</label>
              </div>
              <p>Detailed information on the game's systems, techniques, and glitches.</p>
            </div>
            <div class="content__sections--entry">
              <div class="content__sections--input-label">
                <input type="radio" id="characters" name="sections" value="characters" data-redirect="NONE" data-document="${currentDocument}-C" data-section="${currentSection}" ${charActive} />
                <label for="characters">Characters${charSpan}</label>
              </div>
              <p>A breakdown of each character, such as notable arte properties, strategies, and character-specific techniques.</p>
            </div>
            <div class="content__sections--entry">
              <div class="content__sections--input-label">
                <input type="radio" id="bosses" name="sections" value="bosses" data-redirect="NONE" data-document="${currentDocument}-B" data-section="${currentSection}" ${bossesActive} />
                <label for="bosses">Bosses${bossesSpan}</label>
              </div>
              <p>A summary of each boss. Contains spoilers!</p>
            </div>
          </div>`;

        const sectionsDiv: HTMLDivElement = document.createElement("div");
        sectionsDiv.innerHTML = sectionsHTML;
        taggedElement.appendChild(sectionsDiv);

        // Add click event listeners to each radio input
        document
          .querySelectorAll<HTMLInputElement>('input[name="sections"]')
          .forEach((input: HTMLInputElement) => {
            this.helperObj.addPageChangeEvent(input);
          });
      }

      // Handle version tags
      if (tagData.versions) {
        // If it has a version tag, add an icon with a tooltip containing the value of the tag.
        let versionText: string = `Version: ${tagData.versions}.`;

        // Add the version to the versionMap if it doesn't already exist
        if (!this.helperObj.versionMap.has(tagData.versions)) {
          const colorIndex: number = this.helperObj.versionMap.size;
          const color: string = this.helperObj.colorList[colorIndex];
          this.helperObj.versionMap.set(tagData.versions, color);
        }

        // Create the version tag element
        const versionTag: HTMLSpanElement = document.createElement("span");
        versionTag.className = "material-symbols-rounded";
        versionTag.style.marginRight = "15px";
        versionTag.style.cursor = "help";
        versionTag.textContent = "devices";
        versionTag.style.color = `var(--${this.helperObj.versionMap.get(tagData.versions)})`;
        versionTag.style.filter = "brightness(1.5)";

        // Append the version tag to the tagged element
        taggedElement.appendChild(versionTag);

        // Add event listeners for the tooltip
        versionTag.addEventListener("mouseover", () => {
          this.helperObj.loadTooltip(versionTag, versionText);
        });

        versionTag.addEventListener("mouseleave", () => {
          this.helperObj.unloadTooltip();
        });
      }

      // Handle "todo" tags
      if (tagData.todo) {
        const todoTag: HTMLSpanElement = document.createElement("span");
        todoTag.className = "material-symbols-rounded";
        todoTag.style.color = "goldenrod";
        todoTag.style.marginRight = "15px";
        todoTag.style.cursor = "help";
        todoTag.textContent = "error";
        taggedElement.appendChild(todoTag);

        todoTag.addEventListener("mouseover", () => {
          this.helperObj.loadTooltip(
            todoTag,
            "This section needs work, is not confirmed or needs testing.",
          );
        });

        todoTag.addEventListener("mouseleave", () => {
          this.helperObj.unloadTooltip();
        });
      }

      // Handle "media" tags
      if (tagData.media) {
        const isImage: boolean = /\.(webp|png|jpg|jpeg|gif)$|&ii$/.test(tagData.media);
        const mediaType: "img" | "video" = isImage ? "img" : "video";

        if (tagData.forcedmedia === false) {
          addMediaIcon(mediaType, tagData.media, tagData.caption);
        } else {
          const mediaHolder: HTMLElement = createMediaElement(
            mediaType,
            tagData.media,
            640,
            480,
            tagData.caption,
          );
          taggedElement.parentNode?.insertBefore(mediaHolder, taggedElement.nextSibling);
        }
      }

      // Handle "redirect" tags
      if (tagData.redirect) {
        const redirectIcon: HTMLSpanElement = document.createElement("span");
        redirectIcon.className = "material-symbols-rounded";
        redirectIcon.style.marginRight = "5px";
        redirectIcon.textContent = "link";

        taggedElement.classList.remove("tagging", "tagging-text");
        taggedElement.classList.add("content__redirect");
        taggedElement.dataset.redirect = tagData.redirect;

        if (tagData.document) {
          taggedElement.dataset.document = tagData.document;
          taggedElement.dataset.section =
            this.helperObj.fileList.find((obj) => obj.document === tagData.document)?.section || "";
        } else {
          taggedElement.dataset.document = this.helperObj.currentDocument;
          taggedElement.dataset.section = this.helperObj.currentSection;
        }

        taggedElement.insertBefore(redirectIcon, taggedElement.firstChild);
        this.helperObj.addPageChangeEvent(taggedElement);
      }

      // Handle "reference" tags
      if (!tagData.reference) {
        return;
      }
      taggedElement.classList.remove("tagging", "tagging-text");
      taggedElement.classList.add("content__redirect");
      taggedElement.dataset.redirect = "#references";
      taggedElement.dataset.document = this.helperObj.currentDocument;
      taggedElement.dataset.section = this.helperObj.currentSection;
      this.helperObj.addPageChangeEvent(taggedElement);
    });

    // Handle KaTeX tags
    document.querySelectorAll<HTMLElement>(".tagging-katex").forEach((taggedElement) => {
      if (taggedElement.classList.contains("tagging-computed")) {
        return;
      }
      taggedElement.classList.add("tagging-computed");

      const katexText: string = taggedElement.innerHTML;
      if (this.katexObj) {
        taggedElement.innerHTML = this.katexObj.renderToString(katexText);
      }
    });
  }

  // --- Style every directive for the current #content
  compileDirectives(): void {
    this.compileTags();
    this.sortTables();
    this.treatSpoilers();
    this.styleImages();
  }

  // --- Tables is not a custom directives but a native one. We style them here anyways
  sortTables(): void {
    // Helper function to get the value of a table cell
    const getCellValue = (tr: HTMLTableRowElement, idx: number): string => {
      return tr.children[idx]?.textContent?.trim() || "";
    };

    // Helper function to compare two rows based on the column index
    const comparer = (
      idx: number,
      asc: boolean,
    ): ((a: HTMLTableRowElement, b: HTMLTableRowElement) => number) => {
      return (a: HTMLTableRowElement, b: HTMLTableRowElement): number => {
        const v1: string = getCellValue(asc ? a : b, idx);
        const v2: string = getCellValue(asc ? b : a, idx);

        // Compare numbers or strings
        if (v1 !== "" && v2 !== "" && !isNaN(Number(v1)) && !isNaN(Number(v2))) {
          return Number(v1) - Number(v2);
        }
        return v1.localeCompare(v2);
      };
    };

    // Iterate over all table headers
    const tableHeaders: NodeListOf<HTMLTableCellElement> =
      document.querySelectorAll<HTMLTableCellElement>("th");
    tableHeaders.forEach((th: HTMLTableCellElement): void => {
      // Add a cosmetic sort span
      th.innerHTML += '<span class="material-symbols-rounded">swap_vert</span>';

      // Add click event listener to sort the table
      th.addEventListener("click", (): void => {
        const table: HTMLTableElement | null = th.closest("table");
        const tbody: HTMLTableSectionElement | null = table?.querySelector("tbody") || null;

        if (!tbody) {
          return;
        }

        const rows: HTMLTableRowElement[] = Array.from(
          tbody.querySelectorAll<HTMLTableRowElement>("tr"),
        );
        const columnIndex: number = Array.from(th.parentNode?.children || []).indexOf(th);
        const ascending: boolean = th.dataset.asc !== "true";

        // Sort rows and append them back to the table body
        rows
          .sort(comparer(columnIndex, ascending))
          .forEach((tr: HTMLTableRowElement) => tbody.appendChild(tr));

        // Update the sort direction
        th.dataset.asc = ascending.toString();
      });
    });
  }

  // --- Spoilers have their background removed when clicked (only once)
  treatSpoilers(): void {
    const spoilerElements: NodeListOf<HTMLElement> =
      document.querySelectorAll<HTMLElement>(".spoiler");

    spoilerElements.forEach((spoilerElement: HTMLElement) => {
      spoilerElement.addEventListener("click", (event: Event) => {
        const target: EventTarget | null = event.currentTarget;
        if (!target || !(target instanceof HTMLElement)) {
          return;
        }
        target.style.background = "transparent";
      });
    });
  }

  // --- Add class to images to be styled by CSS (content.css)
  styleImages(): void {
    const imageList: HTMLCollectionOf<HTMLImageElement> = document.getElementsByTagName("img");
    const contentElement: HTMLElement | null = document.getElementById("content");

    if (!contentElement) {
      return;
    }

    Array.from(imageList).forEach((image: HTMLImageElement) => {
      if (contentElement.contains(image)) {
        image.classList.add("content__figure");
      }
    });
  }
}
