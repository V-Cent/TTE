// ---------
// helper.js, as the name implies, is for a lot of helper functions to other modules
//   used both in the browser and node
//   a better alternative than sessionStorage and can also save live objects
//
// SEARCH BLOCKS (CTRL+F):
// - [INTERFACES] - Type definitions and interfaces
// - [CONSTRUCTOR] - Class initialization
// - [STATUS] - Global state management
// - [LOGO] - Logo animation and rotation functions
// - [SCROLL] - Scroll handling and scroll-to-top functionality
// - [TOOLTIP] - Tooltip display and management
// - [DRAG] - Drag and scroll functionality for elements
// - [MEDIA] - Media element creation (images/videos)
// - [FILE] - File loading and async reading

// --- [INTERFACES] - Type definitions and interfaces

export interface FileEntry {
  document: string;
  section: string;
  dim: string;
  ref: string;
}

export interface h2Data {
  id: string;
  name: string;
  content: string;
  color: string;
}

export interface TagData {
  sections?: boolean;
  article?: string;
  versions?: string;
  todo?: boolean;
  media?: string;
  forcedmedia?: boolean;
  caption?: string;
  redirect?: string;
  document?: string;
  section?: string;
  reference?: boolean;
  float?: "left" | "right";
  aside?: "note" | "caution" | "error";
}

export type PageType = "home" | "generic" | "tech";

export interface PageRequest {
  document: string;
  section: string;
  redirect?: string;
  pageType: PageType;
  isPopstate?: boolean;
}

// Centralized color definitions -- add on change values here and they will be reflected on the page

export type colors = "yellow" | "pink" | "teal" | "green" | "red" | "lavender" | "blue";

export const colorList: colors[] = ["yellow", "pink", "teal", "green", "red", "lavender", "blue"];

export const colorCollection: Record<colors, string> = {
  yellow: "#f8d959",
  pink: "#fe796f",
  teal: "#45c9c9",
  green: "#58f15b",
  red: "#e74a41",
  lavender: "#c8a2b0",
  blue: "#205aaa",
};

// --- [CONSTRUCTOR] - Class initialization

export class Helper {
  // State properties for drag functionality
  private mouseDown: boolean;
  private startX: number;
  private scrollLeft: number;
  private startY: number;
  private scrollTop: number;

  // UI element references
  private scrollButton: HTMLElement | null;
  private rootElement: HTMLElement | null;
  private logoElement: HTMLElement | null;

  // Logo animation state
  private rotateFlag: boolean;
  private leaveCounter: number;
  private currentVelocity: number;

  // Chrome regex for scroll bug in old versions
  private readonly chromeVersionRegex: RegExp =
    /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/;

  // Public properties for external access
  versionMap: Map<string, string>;
  currentSection: string | undefined;
  currentDocument: string | undefined;
  inTechPage: boolean;
  inEdit: boolean;
  addPageChangeEvent: (element: HTMLElement) => void;
  fileList: FileEntry[];
  h2Collection: h2Data[];

  constructor(addPageChangeEvent: (element: HTMLElement) => void, fileList: FileEntry[]) {
    // Initialize drag state
    this.mouseDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.startY = 0;
    this.scrollTop = 0;

    // Initialize UI references
    this.scrollButton = null;
    this.rootElement = null;
    this.logoElement = null;

    // Initialize logo animation state
    this.rotateFlag = false;
    this.leaveCounter = 0;
    this.currentVelocity = 0;

    // Use the exported constants instead of duplicating
    this.versionMap = new Map<string, string>();
    this.currentSection = undefined;
    this.currentDocument = undefined;
    this.inTechPage = false;
    this.inEdit = false;
    this.addPageChangeEvent = addPageChangeEvent;
    this.fileList = fileList;
    this.h2Collection = [];
  }

  // --- [STATUS] - Global state management

  // --- Update global values
  updateStatus(document: string, section: string, inTechPage: boolean): void {
    this.currentDocument = document;
    this.currentSection = section;
    this.inTechPage = inTechPage;
    this.versionMap.clear();
  }

  // --- [LOGO] - Logo animation and rotation functions

  // --- Logo functions
  logoInit(): void {
    // Add nav-bar events --> logo rotation
    const titleElement: HTMLElement | null = document.querySelector("#nav-bar__title");
    titleElement?.addEventListener("mouseenter", this.startRotateLogo.bind(this));
    titleElement?.addEventListener("mouseleave", this.stopRotateLogo.bind(this));

    this.logoElement = document.querySelector("#nav-bar__title__logo");
  }

  // --- Add vel on page change
  addLogoVelocity(): void {
    // When clicking on any game, rotate the logo a bit
    if (!this.rotateFlag && this.leaveCounter === 0) {
      this.currentVelocity = 4;
      this.leaveCounter = 200;
      requestAnimationFrame(this.rotateLogo.bind(this));
      return;
    }
    this.currentVelocity = 4;
    this.leaveCounter = 200;
  }

  // --- Rotate on mouseover
  startRotateLogo(): void {
    // On mouseover, start animation
    if (!this.rotateFlag && this.leaveCounter === 0) {
      this.rotateFlag = true;
      requestAnimationFrame(this.rotateLogo.bind(this));
    } else {
      this.rotateFlag = true;
      this.leaveCounter = 200;
    }
  }

  // --- Stop rotation on mouseleave
  stopRotateLogo(): void {
    // On mouseleave, change flag so rotateLogo() makes the logo slow down
    this.rotateFlag = false;
  }

  // --- Animation rotate function
  rotateLogo(): void {
    this.logoElement ??= document.querySelector("#nav-bar__title__logo");
    if (!this.logoElement) return;

    const computedStyle: CSSStyleDeclaration = getComputedStyle(this.logoElement);
    const transformProperty: string = computedStyle.getPropertyValue("transform");

    if (transformProperty === "none") return;

    const transformValues: string[] = transformProperty.split("(")[1].split(")")[0].split(",");
    const matrixA: number = parseFloat(transformValues[0]);
    const matrixB: number = parseFloat(transformValues[1]);

    // Convert angle
    let currentAngle: number = Math.atan2(matrixB, matrixA) * (180 / Math.PI);

    // Speed up if the mouse is in the logo, slow down if not
    if (this.rotateFlag) {
      this.currentVelocity = Math.min(this.currentVelocity + 0.06, 1.8);
    } else {
      this.currentVelocity = Math.max(this.currentVelocity - 0.03, 0);
    }

    // Normalize angle
    currentAngle = currentAngle < 0 ? currentAngle + 360 : currentAngle;
    const newAngle: number = this.currentVelocity + currentAngle;

    // Update style and start animation again
    this.logoElement.style.transform = `rotate(${newAngle}deg)`;

    if (this.rotateFlag) {
      this.leaveCounter = 200;
      requestAnimationFrame(this.rotateLogo.bind(this));
      return;
    }

    // If flag is not set, keep running for a maximum of 200 frames to show the logo slowing down
    this.leaveCounter--;
    if (this.currentVelocity <= 0) {
      this.leaveCounter = 0;
    }
    if (this.leaveCounter > 0) {
      requestAnimationFrame(this.rotateLogo.bind(this));
    }
  }

  // --- [SCROLL] - Scroll handling and scroll-to-top functionality

  // --- Scroll functions
  scrollInit(): void {
    this.scrollButton = document.querySelector("#scroll__button--to-top");
    this.rootElement = document.documentElement;

    this.scrollButton?.addEventListener("click", this.scrollToTop.bind(this));
    window.addEventListener("scroll", this.handleScroll.bind(this));
  }

  // --- Functions related to scrolling effects
  //      Checks if scroll icon should be shown to user
  handleScroll(): void {
    if (!this.rootElement) return;

    // Get current scroll position
    const scrollTotal: number = this.rootElement.scrollHeight - this.rootElement.clientHeight;

    // Get TOC if it exists
    const tableOfContents: HTMLElement | null = document.getElementById("content__selectorbox");
    let tocLocation: number = 0;

    if (tableOfContents) {
      // If the content selector exists, calculate the difference between the selector location and the top of the page
      const bodyRect: DOMRect = document.body.getBoundingClientRect();
      const elementRect: DOMRect = tableOfContents.getBoundingClientRect();
      const offsetFromTop: number = elementRect.top - bodyRect.top;

      tocLocation = Math.max(offsetFromTop, 0);
    }

    // Test if current scroll position is past the top of the page or the top of the TOC
    const scrollThreshold: number = 0.05;
    if ((this.rootElement.scrollTop - tocLocation) / scrollTotal > scrollThreshold) {
      // Show button on 5% scroll down
      this.scrollButton?.classList.add("scroll__button--to-top--show");
    } else {
      // Hide button otherwise
      this.scrollButton?.classList.remove("scroll__button--to-top--show");
    }
  }

  // --- Scroll to top of the page or the H2 selection
  scrollToTop(): void {
    // Get content selector if it exists
    const tableOfContents: HTMLElement | null = document.getElementById("content__selectorbox");
    let tocLocation: number = 0;

    if (tableOfContents) {
      // If the selector exists, calculate the difference between the selector location and the top of the page
      const bodyRect: DOMRect = document.body.getBoundingClientRect();
      const elementRect: DOMRect = tableOfContents.getBoundingClientRect();
      const offsetFromTop: number = elementRect.top - bodyRect.top;

      tocLocation = Math.max(offsetFromTop - 20, 0);
    }

    // Scroll either to the top of the page or to the selector smoothly
    window.requestAnimationFrame(() => {
      let scrollBehavior: ScrollBehavior = "smooth";

      if (navigator.userAgent.includes("Chrome")) {
        const chromeVersionMatch: RegExpMatchArray | null = navigator.userAgent.match(
          this.chromeVersionRegex,
        );

        // Get version number or, if regex fails, hope its 130+
        const versionNumber: number = Number(chromeVersionMatch?.[1] ?? 130);
        if (!isNaN(versionNumber) && versionNumber < 130) {
          scrollBehavior = "auto";
        }
      }

      this.rootElement?.scrollTo({
        top: tocLocation,
        behavior: scrollBehavior,
      });
    });
  }

  // --- [TOOLTIP] - Tooltip display and management

  // --- Setup tooltip on any element with text
  setTooltip(tooltipTriggerElement: HTMLElement | null, tooltipText: string): void {
    if (!tooltipTriggerElement || !tooltipText) return;
    tooltipTriggerElement.addEventListener(
      "mouseover",
      (): void => {
        this.loadTooltip(tooltipTriggerElement, tooltipText);
      },
      { passive: true },
    );

    tooltipTriggerElement.addEventListener(
      "mouseleave",
      (): void => {
        this.unloadTooltip();
      },
      { passive: true },
    );
  }

  // --- Tooltip functions
  //      load on hover
  loadTooltip(tooltipTriggerElement: HTMLElement | null, tooltipText: string): void {
    if (!tooltipTriggerElement) return;

    // Remove existing tooltip if needed
    document.getElementsByTagName("tooltip")[0]?.remove();

    // Create tooltip element
    const tooltipElement: HTMLElement = document.createElement("tooltip");
    tooltipElement.id = "nav-bar__tooltip";
    tooltipElement.textContent = tooltipText;

    // Set tooltip location and add it to the page
    const triggerBoundingBox: DOMRect = tooltipTriggerElement.getBoundingClientRect();
    // if tooltipTrigger is more than half to the left of the page, put the tooltip towards the right
    // else towards the left
    if (triggerBoundingBox.left < window.innerWidth / 2) {
      Object.assign(tooltipElement.style, {
        top: `${triggerBoundingBox.bottom - 10}px`,
        left: `${triggerBoundingBox.right}px`,
      });
    } else {
      Object.assign(tooltipElement.style, {
        top: `${triggerBoundingBox.bottom - 10}px`,
        right: `${window.innerWidth - triggerBoundingBox.left - 10}px`,
      });
    }

    document.body.appendChild(tooltipElement);
  }

  // --- Delete first found tooltip after not hovering the tooltip area
  unloadTooltip(): void {
    // Remove existing tooltip
    document.getElementsByTagName("tooltip")[0]?.remove();
  }

  // --- [DRAG] - Drag and scroll functionality for elements

  // --- Drag function for h2s and TOC
  dragScrollElement(elementQuery: string, scrollDirection: number): void {
    // This is a generic function that you can use to drag a div horizontally or vertically
    // Gets the Element from the query
    const scrollableElement: HTMLElement | null = document.querySelector(elementQuery);
    if (!scrollableElement) return;

    // Function to return coords on both axis
    const getEventCoordinates = (dragEvent: MouseEvent | TouchEvent): { x: number; y: number } => {
      if (dragEvent instanceof MouseEvent) {
        return { x: dragEvent.pageX, y: dragEvent.pageY };
      }
      return { x: dragEvent.changedTouches[0].pageX, y: dragEvent.changedTouches[0].pageY };
    };

    // Define mouse/touch start event functions
    const startDraggingHorizontal = (dragEvent: MouseEvent | TouchEvent): void => {
      this.mouseDown = true;
      const coords: { x: number; y: number } = getEventCoordinates(dragEvent);
      this.startX = coords.x - scrollableElement.offsetLeft;
      this.scrollLeft = scrollableElement.scrollLeft;
    };

    const startDraggingVertical = (dragEvent: MouseEvent | TouchEvent): void => {
      this.mouseDown = true;
      const coords: { x: number; y: number } = getEventCoordinates(dragEvent);
      this.startY = coords.y - scrollableElement.offsetTop;
      this.scrollTop = scrollableElement.scrollTop;
    };

    // Define the mouse/touch drag event functions
    const moveHorizontal = (dragEvent: MouseEvent | TouchEvent): void => {
      dragEvent.stopPropagation();
      if (!this.mouseDown) return;

      const coords: { x: number; y: number } = getEventCoordinates(dragEvent);
      const currentX: number = coords.x - scrollableElement.offsetLeft;
      const scrollDistance: number = currentX - this.startX;
      scrollableElement.scrollLeft = this.scrollLeft - scrollDistance;
    };

    const moveVertical = (dragEvent: MouseEvent | TouchEvent): void => {
      dragEvent.stopPropagation();
      if (!this.mouseDown) return;

      const coords: { x: number; y: number } = getEventCoordinates(dragEvent);
      const currentY: number = coords.y - scrollableElement.offsetTop;
      const scrollDistance: number = currentY - this.startY;
      scrollableElement.scrollTop = this.scrollTop - scrollDistance;
    };

    // Stops movement
    const stopDragging = (): void => {
      this.mouseDown = false;
    };

    // Passive doesn't block touch and wheel event listeners
    const eventOptions: AddEventListenerOptions = { passive: false };
    const passiveEventOptions: AddEventListenerOptions = { passive: true };

    // All event handlers for both directions
    const eventHandlerPairs: [
      string,
      EventListenerOrEventListenerObject,
      AddEventListenerOptions,
    ][] =
      scrollDirection === 1
        ? ([
            ["mousemove", moveVertical, eventOptions],
            ["mousedown", startDraggingVertical, passiveEventOptions],
            ["mouseup", stopDragging, passiveEventOptions],
            ["mouseleave", stopDragging, passiveEventOptions],
            ["touchmove", moveVertical, eventOptions],
            ["touchstart", startDraggingVertical, passiveEventOptions],
            ["touchend", stopDragging, passiveEventOptions],
          ] as [string, EventListenerOrEventListenerObject, AddEventListenerOptions][])
        : ([
            ["mousemove", moveHorizontal, eventOptions],
            ["mousedown", startDraggingHorizontal, passiveEventOptions],
            ["mouseup", stopDragging, passiveEventOptions],
            ["mouseleave", stopDragging, passiveEventOptions],
            ["touchmove", moveHorizontal, eventOptions],
            ["touchstart", startDraggingHorizontal, passiveEventOptions],
            ["touchend", stopDragging, passiveEventOptions],
          ] as [string, EventListenerOrEventListenerObject, AddEventListenerOptions][]);

    // Add all event handlers to the scrollable element
    for (const [eventType, handler, options] of eventHandlerPairs) {
      scrollableElement.addEventListener(eventType, handler as EventListener, options);
    }
  }

  // --- [MEDIA] - Media element creation (images/videos)

  // --- Helper function to create media elements (images or videos)
  createMediaElement(
    documentContext: Document,
    mediaType: "img" | "video",
    mediaSrc: string,
    mediaWidth: number,
    mediaHeight: number,
    mediaCaption?: string,
    floatDirection?: "left" | "right",
  ): HTMLElement {
    // Keep in mind that very few elements can be inside a paragraph block without it auto closing itself!
    const mediaContainer: HTMLElement = documentContext.createElement("p");
    if (floatDirection) {
      mediaContainer.classList.add(
        floatDirection === "left" ? "content__figure--float-left" : "content__figure--float-right",
      );
      Object.assign(mediaContainer.style, {
        opacity: "1",
      });
    } else {
      Object.assign(mediaContainer.style, {
        opacity: "1",
        textAlign: "center",
      });
    }

    let mediaElement: HTMLImageElement | HTMLVideoElement;
    if (mediaType === "img") {
      mediaElement = documentContext.createElement("img");
      Object.assign(mediaElement, {
        alt: mediaCaption ?? "",
        loading: "lazy",
        src: mediaSrc,
      });
    } else {
      mediaElement = documentContext.createElement("video");
      Object.assign(mediaElement, {
        preload: "metadata",
        controls: true,
        muted: true,
        loop: true,
      });

      const videoSource: HTMLSourceElement = documentContext.createElement("source");
      Object.assign(videoSource, {
        src: mediaSrc,
        type: "video/mp4",
      });
      mediaElement.appendChild(videoSource);
    }

    // Apply general draggable attribute
    Object.assign(mediaElement, { draggable: false });

    if (floatDirection) {
      // Hardcoded CSS for floating elements
      Object.assign(mediaElement.style, {
        width: "100%",
        height: "auto",
        outline: "none",
        borderRadius: "8px",
      });
    } else {
      // Apply width/height attributes and styles for non-floated (centered) media
      Object.assign(mediaElement, {
        width: mediaWidth,
        height: mediaHeight,
      });
      mediaElement.classList.add("content__figure");
    }

    mediaContainer.appendChild(mediaElement);

    if (mediaCaption) {
      const captionElement: HTMLElement = documentContext.createElement("u");
      captionElement.classList.add("content__figure-caption");
      // So the underline appears a bit to the left and right of the caption.
      Object.assign(captionElement.style, { whiteSpace: "pre" });
      captionElement.textContent = ` ${mediaCaption} `;
      mediaContainer.appendChild(captionElement);
    }

    return mediaContainer;
  }

  // --- [FILE] - File loading and async reading

  // --- Get data from a loaded file (with extension)
  async asyncRead(fileName: string): Promise<string> {
    const fileData: string = await this.loadFile(fileName);

    if (!fileData || fileData.length <= 1) {
      return "";
    }

    return fileData;
  }

  // --- Load a text file on a relative path
  async loadFile(filePath: string): Promise<string> {
    return new Promise<string>(
      (
        resolve: (value: string) => void,
        reject: (reason: { status: number; statusText: string }) => void,
      ) => {
        const xmlHttpRequest: XMLHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open("GET", filePath, true);

        xmlHttpRequest.onload = (): void => {
          if (xmlHttpRequest.status >= 200 && xmlHttpRequest.status < 300) {
            resolve(xmlHttpRequest.response);
          } else {
            reject({
              status: xmlHttpRequest.status,
              statusText: xmlHttpRequest.statusText,
            });
          }
        };

        xmlHttpRequest.onerror = (): void => {
          reject({
            status: xmlHttpRequest.status,
            statusText: xmlHttpRequest.statusText,
          });
        };

        xmlHttpRequest.send();
      },
    );
  }

  // --- Generic. Compress input string with deflate-raw
  //      can be used to compress even more a json stringify, or for any string that needs to be saved
  //      currently used to compress search results.
  async compress(str: string): Promise<string> {
    const encoder: TextEncoder = new TextEncoder();
    const inputStream: ReadableStream = new ReadableStream({
      start(controller: ReadableStreamDefaultController<Uint8Array>) {
        controller.enqueue(encoder.encode(str));
        controller.close();
      },
    });

    const compressedStream: ReadableStream<Uint8Array<ArrayBuffer>> = inputStream.pipeThrough(
      new CompressionStream("deflate-raw"),
    );
    const compressedResponse: Response = new Response(compressedStream);
    const buffer: ArrayBuffer = await compressedResponse.arrayBuffer();

    if (typeof Buffer !== "undefined") {
      // Node.js environment
      return Buffer.from(buffer).toString("base64");
    }
    // Browser environment
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  // --- Generic. Decompress a deflate-raw string back to a normal string.
  async decompress(str: string): Promise<string> {
    // First decode the base64 string
    let uint8Array: Uint8Array;
    if (typeof Buffer !== "undefined") {
      // Node.js environment
      uint8Array = Buffer.from(str, "base64");
    } else {
      // Browser environment
      const binaryString: string = atob(str);
      uint8Array = new Uint8Array(binaryString.length);
      for (let i: number = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
    }

    const inputStream: ReadableStream = new ReadableStream({
      start(controller: ReadableStreamDefaultController<Uint8Array>) {
        controller.enqueue(uint8Array);
        controller.close();
      },
    });

    const decompressedStream: ReadableStream<Uint8Array<ArrayBuffer>> = inputStream.pipeThrough(
      new DecompressionStream("deflate-raw"),
    );
    const decompressedResponse: Response = new Response(decompressedStream);
    return await decompressedResponse.text();
  }
}
