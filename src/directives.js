// ---
// directives.js contains styling functions for custom directives.
//   this is after they are already treated as unique elements and get a tagging parameter
//   we then change the original element here to show what is needed

export class Directives {
  constructor(helperObj) {
    // Bind methods if needed
    this.compileDirectives = this.compileDirectives.bind(this);
    this.sortTables = this.sortTables.bind(this);
    this.treatSpoilers = this.treatSpoilers.bind(this);
    this.styleImages = this.styleImages.bind(this);
    this.compileTags = this.compileTags.bind(this);
    this.helperObj = helperObj;
    this.katexObj = null;
  }

  // This is used to set the KaTeX object from the main script
  setKatex(katex) {
    this.katexObj = katex;
  }

  // This transforms elements that were tagged (part of a custom directive) to something we can manipulate on HTML or with CSS
  compileTags() {
    //Iterator over every element that needs tagging
    document
      .querySelectorAll(".tagging, .tagging-text")
      .forEach((taggedElement) => {
        if (taggedElement.classList.contains("tagging-computed")) {
          return;
        }
        taggedElement.classList.add("tagging-computed");
        //Get tags from the first child (first heading), which are saved as JSON
        let tagTextData = taggedElement.dataset.tags;
        let tagData = JSON.parse(tagTextData.replace(/'/g, '"'));

        if (tagData.todo) {
          //If it has a todo tag, add an icon with a tooltip.
          let todoTag = document.createElement("span");
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
            this.helperObj.unloadTooltip(todoTag);
          });
        }

        if (tagData.sections) {
          // Sections tag is for article selection in tech pages
          let systemActive = "checked";
          let systemSpan = " <span>(LOADED)</span>";
          let bossesActive = "";
          let bossesSpan = "";
          let charActive = "";
          let charSpan = "";
          if (tagData.article == "b") {
            bossesActive = "checked";
            bossesSpan = " <span>(LOADED)</span>";
            systemActive = "";
            systemSpan = "";
            charActive = "";
            charSpan = "";
          } else if (tagData.article == "c") {
            charActive = "checked";
            charSpan = " <span>(LOADED)</span>";
            bossesActive = "";
            bossesSpan = "";
            systemActive = "";
            systemSpan = "";
          }
          let currentDocument = this.helperObj.currentDocument;
          let currentSection = this.helperObj.currentSection;
          currentDocument = currentDocument.replace("-C", "");
          currentDocument = currentDocument.replace("-B", "");
          let sectionsHTML =
            `
          <div id="content__sections">
            <div class="content__sections--entry">
              <div class="content__sections--input-label">
                <input type="radio" id="systems" name="sections" value="systems" data-redirect="NONE" data-document="` +
            currentDocument +
            `" data-section="` +
            currentSection +
            `" ` +
            systemActive +
            ` />
                <label for="systems">Systems` +
            systemSpan +
            `</label>
              </div>
              <p>Detailed information on the game's systems, techniques, and glitches.</p>
            </div>
            <div class="content__sections--entry">
              <div class="content__sections--input-label">
                <input type="radio" id="characters" name="sections" value="characters" data-redirect="NONE" data-document="` +
            currentDocument +
            '-C" data-section="' +
            currentSection +
            `" ` +
            charActive +
            ` />
                <label for="characters">Characters` +
            charSpan +
            `</label>
              </div>
              <p>A breakdown of each character, such as notable arte properties, strategies, and character-specific techniques.</p>
            </div>
            <div class="content__sections--entry">
              <div class="content__sections--input-label">
                <input type="radio" id="bosses" name="sections" value="bosses" data-redirect="NONE" data-document="` +
            currentDocument +
            '-B" data-section="' +
            currentSection +
            `" ` +
            bossesActive +
            ` />
                <label for="bosses">Bosses` +
            bossesSpan +
            `</label>
              </div>
              <p>A summary of each boss. Contains spoilers!</p>
            </div>
          </div>`;
          let sectionsDiv = document.createElement("div");
          sectionsDiv.innerHTML = sectionsHTML;
          taggedElement.appendChild(sectionsDiv);

          // Add click event listeners to each radio input
          document
            .querySelectorAll('input[name="sections"]')
            .forEach((input) => {
              this.helperObj.addPageChangeEvent(input);
            });
        }

        if (tagData.versions) {
          //If it has a version tag, add an icon with a tooltip which contains the value of the tag.
          let versionText = "Version: ";
          versionText = versionText.concat(tagData.versions);
          versionText = versionText.concat(".");
          if (!this.helperObj.versionMap.has(tagData.versions)) {
            this.helperObj.versionMap.set(
              tagData.versions,
              this.helperObj.colorList[this.helperObj.versionMap.size],
            );
          }
          let versionTag = document.createElement("span");
          versionTag.className = "material-symbols-rounded";
          versionTag.style.marginRight = "15px";
          versionTag.style.cursor = "help";
          versionTag.textContent = "devices";
          versionTag.style.color =
            "var(--" + this.helperObj.versionMap.get(tagData.versions) + ")";
          versionTag.style.filter = "brightness(1.5)";
          taggedElement.appendChild(versionTag);
          versionTag.addEventListener("mouseover", () => {
            this.helperObj.loadTooltip(versionTag, versionText);
          });
          versionTag.addEventListener("mouseleave", () => {
            this.helperObj.unloadTooltip(versionTag);
          });
        }

        if (tagData.media) {
          // Media works for both videos and images
          const isImage =
            tagData.media.includes(".webp") ||
            tagData.media.includes(".png") ||
            tagData.media.includes(".jpg") ||
            tagData.media.includes("&ii");
          const mediaType = isImage ? "img" : "video";

          // They both share a bunch of stuff but video has some extra options that need to be checked
          //   this is used for both
          const createMediaElement = (type, src, width, height, caption) => {
            const mediaHolder = document.createElement("p");
            mediaHolder.style.opacity = "1";

            // Specific parameters
            let mediaTag;
            if (type === "img") {
              mediaTag = document.createElement("img");
            } else if (type === "video") {
              mediaTag = document.createElement("video");
              mediaTag.preload = "metadata";
              mediaTag.controls = true;
              mediaTag.muted = true;
              mediaTag.loop = true;
              const source = document.createElement("source");
              source.src = src;
              source.type = "video/mp4";
              mediaTag.appendChild(source);
            }

            // Parameters that affect both videos and images
            mediaTag.draggable = false;
            mediaTag.width = width;
            mediaTag.height = height;
            mediaTag.style.order = 2;
            mediaTag.style.width = "80%";
            mediaTag.style.height = "auto";
            mediaTag.style.maxWidth = "640px";
            mediaTag.style.outline = "none";
            mediaTag.style.borderRadius = "14px";
            mediaTag.src = src;
            mediaTag.alt = "";
            mediaHolder.appendChild(mediaTag);

            // \xa0 is a non-breaking space character, just to make the underline look better
            if (caption) {
              const captionElement = document.createElement("figcaption");
              captionElement.textContent = "\xa0" + caption + "\xa0";
              mediaHolder.appendChild(captionElement);
            }
            return mediaHolder;
          };

          // Again, different for video and image. This is for when you want to make videos or imgs not forced
          //   so the user needs to click an icon for them to appear
          const addMediaIcon = (type, src, caption) => {
            const mediaTag = document.createElement("span");
            mediaTag.dataset.media = src;
            mediaTag.className = "material-symbols-rounded";
            mediaTag.style.marginRight = "15px";
            mediaTag.style.cursor = "pointer";
            mediaTag.textContent =
              type === "img" ? "imagesmode" : "play_circle";
            taggedElement.appendChild(mediaTag);

            mediaTag.addEventListener("click", (mediaIcon) => {
              const mediaType = type === "img" ? "img" : "video";
              const mediaTarget = document.querySelector(
                `p[data-media~="${mediaIcon.target.dataset.media}"]`,
              );
              if (mediaTarget == null) {
                const mediaHolder = createMediaElement(
                  mediaType,
                  mediaIcon.target.dataset.media,
                  640,
                  480,
                  caption,
                );
                mediaHolder.dataset.media = mediaIcon.target.dataset.media;
                taggedElement.parentNode.insertBefore(
                  mediaHolder,
                  taggedElement.nextSibling,
                );
              } else {
                mediaTarget.remove();
              }
            });
          };

          // If forced --> add the media, if not, add the icon.
          if (tagData.forcedmedia !== false) {
            const mediaHolder = createMediaElement(
              mediaType,
              tagData.media,
              640,
              480,
              tagData.caption,
            );
            taggedElement.parentNode.insertBefore(
              mediaHolder,
              taggedElement.nextSibling,
            );
          } else {
            addMediaIcon(mediaType, tagData.media, tagData.caption);
          }
        }

        if (tagData.redirect) {
          // If it has a redirect tag, create a div to be used with changePage function with data-section, data-document, and data-redirect
          //   turn tagged element into a div
          let redirectIcon = document.createElement("span");
          redirectIcon.className = "material-symbols-rounded";
          redirectIcon.style.marginRight = "5px";
          redirectIcon.textContent = "link";
          taggedElement.classList.remove("tagging");
          taggedElement.classList.remove("tagging-text");
          taggedElement.classList.add("content__redirect");
          taggedElement.dataset.redirect = tagData.redirect;
          if (tagData.document) {
            taggedElement.dataset.document = tagData.document;
            // search the list of objects at this.helperObj.fileList for the object with document tagData.document to get the section
            taggedElement.dataset.section = this.helperObj.fileList.find(
              (obj) => obj.document === tagData.document,
            ).section;
          } else {
            taggedElement.dataset.document = this.helperObj.currentDocument;
            taggedElement.dataset.section = this.helperObj.currentSection;
          }
          taggedElement.insertBefore(redirectIcon, taggedElement.firstChild);
          this.helperObj.addPageChangeEvent(taggedElement);
        }

        if (tagData.reference) {
          taggedElement.classList.remove("tagging");
          taggedElement.classList.remove("tagging-text");
          taggedElement.classList.add("content__redirect");
          taggedElement.dataset.redirect = "#references";
          taggedElement.dataset.document = this.helperObj.currentDocument;
          taggedElement.dataset.section = this.helperObj.currentSection;
          this.helperObj.addPageChangeEvent(taggedElement);
        }
      });

    document.querySelectorAll(".tagging-katex").forEach((taggedElement) => {
      if (taggedElement.classList.contains("tagging-computed")) {
        return;
      }
      taggedElement.classList.add("tagging-computed");

      // Get the text content and replace the innerHTML with the KaTeX version
      let katexText = taggedElement.innerHTML;
      taggedElement.innerHTML = this.katexObj.renderToString(katexText);
    });
  }

  // Style every directive for the current #content
  compileDirectives() {
    this.compileTags();
    this.sortTables();
    this.treatSpoilers();
    this.styleImages();
  }

  // Tables is not a custom directives but a native one. We style them here anyways
  sortTables() {
    const getCellValue = (tr, idx) => {
      return tr.children[idx].innerText || tr.children[idx].textContent;
    };

    // This sorts both numbers and text
    const comparer = (idx, asc) => {
      return (a, b) => {
        return ((v1, v2) => {
          return v1 !== "" && v2 !== "" && !isNaN(v1) && !isNaN(v2)
            ? v1 - v2
            : v1.toString().localeCompare(v2);
        })(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
      };
    };

    document.querySelectorAll("th").forEach((th) => {
      // add a cosmetic sort span
      th.innerHTML =
        th.innerHTML +
        '<span class="material-symbols-rounded">swap_vert</span>';
      th.addEventListener("click", () => {
        const table = th.closest("table");
        const tbody = table.querySelector("tbody");
        Array.from(tbody.querySelectorAll("tr"))
          .sort(
            comparer(
              Array.from(th.parentNode.children).indexOf(th),
              (this.asc = !this.asc),
            ),
          )
          .forEach((tr) => tbody.appendChild(tr));
      });
    });
  }

  // Spoilers have their background removed when clicked (only once)
  treatSpoilers() {
    document.querySelectorAll(".spoiler").forEach((spoilerElement) => {
      spoilerElement.addEventListener("click", (event) => {
        event.target.style.background = "transparent";
      });
    });
  }

  // Styled by CSS (content.css)
  styleImages() {
    const imageList = document.getElementsByTagName("img");
    const contentElement = document.getElementById("content");
    for (let i = 0; i < imageList.length; i++) {
      if (contentElement.contains(imageList[i])) {
        imageList[i].classList.add("content__figure");
      }
    }
  }
}
