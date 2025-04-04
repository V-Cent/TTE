// ---
// helper.js, as the name implies, is for a lot of helper functions to other modules
//   main creates an instance of it which can be used for various things
//   a better alternative than sessionStorage and can also save live objects

interface FileEntry {
  document: string;
  section: string;
  dim: string;
  ref: string;
}

export class Helper {
  private mouseDown: boolean;
  private startX: number;
  private scrollLeft: number;
  private startY: number;
  private scrollTop: number;
  private scrollButton: HTMLElement | null;
  private rootElement: HTMLElement | null;
  private rotateFlag: boolean;
  private leaveCounter: number;
  private currentVelocity: number;
  colorList: string[];
  versionMap: Map<string, string>;
  currentSection: string | undefined;
  currentDocument: string | undefined;
  inTechPage: boolean;
  addPageChangeEvent: (element: HTMLElement) => void;
  fileList: FileEntry[];

  constructor(
    addPageChangeEvent: (element: HTMLElement) => void,
    fileList: FileEntry[],
  ) {
    this.mouseDown = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.startY = 0;
    this.scrollTop = 0;
    this.scrollButton = null;
    this.rootElement = null;
    this.colorList = ["yellow", "teal", "green", "pink", "red", "blue"];
    this.versionMap = new Map<string, string>();
    this.rotateFlag = false;
    this.leaveCounter = 0;
    this.currentVelocity = 0;
    this.currentSection = undefined;
    this.currentDocument = undefined;
    this.inTechPage = false;
    this.addPageChangeEvent = addPageChangeEvent;
    this.fileList = fileList;
  }

  // --- Update global values
  updateStatus(document: string, section: string, inTechPage: boolean): void {
    this.currentDocument = document;
    this.currentSection = section;
    this.inTechPage = inTechPage;
    this.versionMap = new Map<string, string>();
  }

  // --- Logo functions
  logoInit(): void {
    // Add nav-bar events --> logo rotation
    const titleElement: HTMLElement | null =
      document.querySelector("#nav-bar__title");
    if (titleElement) {
      titleElement.addEventListener(
        "mouseenter",
        this.startRotateLogo.bind(this),
      );
      titleElement.addEventListener(
        "mouseleave",
        this.stopRotateLogo.bind(this),
      );
    }
  }

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

  stopRotateLogo(): void {
    // On mouseleave, change flag so rotateLogo() makes the logo slow down
    this.rotateFlag = false;
  }

  rotateLogo(): void {
    // Get logo style properties
    const logo: HTMLElement | null = document.querySelector(
      "#nav-bar__title__logo",
    );
    if (!logo) return; // Ensure the logo element exists

    const st: CSSStyleDeclaration = getComputedStyle(logo, null);
    const tr: string = st.getPropertyValue("transform");

    // Ensure the transform property is valid
    if (tr === "none") return;

    const values: string[] = tr.split("(")[1].split(")")[0].split(",");
    const a: number = parseFloat(values[0]);
    const b: number = parseFloat(values[1]);

    // Convert angle
    let currentAngle: number = Math.atan2(b, a) * (180 / Math.PI);

    // Speed up if the mouse is in the logo, slow down if not
    if (this.rotateFlag) {
      if (this.currentVelocity < 1.8) {
        this.currentVelocity += 0.06;
      }
    } else if (this.currentVelocity > 0) {
      this.currentVelocity -= 0.03;
    }

    if (this.currentVelocity < 0) {
      this.currentVelocity = 0;
    }

    if (currentAngle < 0) {
      currentAngle += 360;
    }

    const angle: number = this.currentVelocity + currentAngle;

    // Update style and start animation again
    logo.style.transform = `rotate(${angle}deg)`;

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

  // --- Scroll functions
  scrollInit(): void {
    // Add scroll button events (icon that appears when you pass ToC)
    this.scrollButton = document.querySelector(
      "#scroll__button--to-top",
    ) as HTMLElement | null;
    this.rootElement = document.documentElement;

    if (this.scrollButton) {
      this.scrollButton.addEventListener("click", this.scrollToTop.bind(this));
    }

    window.addEventListener("scroll", this.handleScroll.bind(this));
  }

  // --- Functions related to scrolling effects
  // Checks if scroll icon should be shown to user
  handleScroll(event: Event): void {
    event.preventDefault();

    // Get current scroll position
    const scrollTotal: number =
      this.rootElement!.scrollHeight - this.rootElement!.clientHeight;

    // Get TOC if it exists
    const toc: HTMLElement | null = document.getElementById(
      "content__selectorbox",
    );
    let tocLocation: number = 0;

    if (toc) {
      // If the content selector exists, calculate the difference between the selector location and the top of the page
      const bodyRect: DOMRect = document.body.getBoundingClientRect();
      const elemRect: DOMRect = toc.getBoundingClientRect();
      const offset: number = elemRect.top - bodyRect.top;

      if (offset > 0) {
        tocLocation = offset;
      }
    }

    // Test if current scroll position is past the top of the page or the top of the TOC
    if ((this.rootElement!.scrollTop - tocLocation) / scrollTotal > 0.05) {
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
    const toc: HTMLElement | null = document.getElementById(
      "content__selectorbox",
    );
    let tocLocation: number = 0;

    if (toc !== null) {
      // If the selector exists, calculate the difference between the selector location and the top of the page
      const bodyRect: DOMRect = document.body.getBoundingClientRect();
      const elemRect: DOMRect = toc.getBoundingClientRect();
      const offset: number = elemRect.top - bodyRect.top;

      if (offset > 0) {
        tocLocation = offset - 20;
      }
    }

    // Scroll either to the top of the page or to the selector smoothly
    window.requestAnimationFrame(() => {
      let behavior: ScrollBehavior = "smooth";

      if (navigator.userAgent.includes("Chrome")) {
        const pieces: RegExpMatchArray | null = navigator.userAgent.match(
          /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/,
        );

        // && is sequential
        if (
          pieces &&
          pieces.length >= 1 &&
          !isNaN(Number(pieces[1])) &&
          Number(pieces[1]) < 130
        ) {
          behavior = "auto";
        }
      }

      this.rootElement?.scrollTo({
        top: tocLocation,
        behavior,
      });
    });
  }

  // --- Tooltip functions
  loadTooltip(tooltip: HTMLElement | null, tooltipText: string): void {
    // Create tooltip element
    const base: HTMLElement = document.createElement("tooltip");
    base.id = "nav-bar__tooltip";
    const tip: Text = document.createTextNode(tooltipText);

    if (tooltip === null) {
      return;
    }
    // Set tooltip contents
    base.innerHTML = "";
    base.appendChild(tip);

    // Remove existing tooltip if needed
    const existingTooltip: HTMLElement | null = document.getElementsByTagName(
      "tooltip",
    )[0] as HTMLElement | null;
    if (existingTooltip) {
      existingTooltip.remove();
    }

    // Set tooltip location and add it to the page
    const boundingBox: DOMRect = tooltip.getBoundingClientRect();
    base.style.top = `${boundingBox.bottom - 10}px`;
    base.style.left = `${boundingBox.right}px`;
    document.body.appendChild(base);
  }

  unloadTooltip(): void {
    // Remove existing tooltip
    const existingTooltip: HTMLElement | null = document.getElementsByTagName(
      "tooltip",
    )[0] as HTMLElement | null;
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }

  // --- Drag function for h2s and TOC
  dragScrollElement(query: string, direction: number): void {
    const sliderSelector: HTMLElement | null = document.querySelector(query);
    if (sliderSelector === null) {
      return;
    }

    const startDraggingX = (e: MouseEvent | TouchEvent): void => {
      this.mouseDown = true;
      this.startX =
        e instanceof MouseEvent
          ? e.pageX - sliderSelector.offsetLeft
          : e.changedTouches[0].pageX - sliderSelector.offsetLeft;
      this.scrollLeft = sliderSelector.scrollLeft;
    };

    const startDraggingY = (e: MouseEvent | TouchEvent): void => {
      this.mouseDown = true;
      this.startY =
        e instanceof MouseEvent
          ? e.pageY - sliderSelector.offsetTop
          : e.changedTouches[0].pageY - sliderSelector.offsetTop;
      this.scrollTop = sliderSelector.scrollTop;
    };

    const moveX = (e: MouseEvent | TouchEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.mouseDown) {
        return;
      }
      const x: number =
        e instanceof MouseEvent
          ? e.pageX - sliderSelector.offsetLeft
          : e.changedTouches[0].pageX - sliderSelector.offsetLeft;
      const scroll: number = x - this.startX;
      sliderSelector.scrollLeft = this.scrollLeft - scroll;
    };

    const moveY = (e: MouseEvent | TouchEvent): void => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.mouseDown) {
        return;
      }
      const y: number =
        e instanceof MouseEvent
          ? e.pageY - sliderSelector.offsetTop
          : e.changedTouches[0].pageY - sliderSelector.offsetTop;
      const scroll: number = y - this.startY;
      sliderSelector.scrollTop = this.scrollTop - scroll;
    };

    const stopDragging = (): void => {
      this.mouseDown = false;
    };

    // Add the event listeners
    if (direction === 1) {
      sliderSelector.addEventListener("mousemove", moveY, false);
      sliderSelector.addEventListener("mousedown", startDraggingY, false);
      sliderSelector.addEventListener("mouseup", stopDragging, false);
      sliderSelector.addEventListener("mouseleave", stopDragging, false);

      // For mobile
      sliderSelector.addEventListener("touchmove", moveY, false);
      sliderSelector.addEventListener("touchstart", startDraggingY, false);
      sliderSelector.addEventListener("touchend", stopDragging, false);
      return;
    }
    sliderSelector.addEventListener("mousemove", moveX, false);
    sliderSelector.addEventListener("mousedown", startDraggingX, false);
    sliderSelector.addEventListener("mouseup", stopDragging, false);
    sliderSelector.addEventListener("mouseleave", stopDragging, false);

    // For mobile
    sliderSelector.addEventListener("touchmove", moveX, false);
    sliderSelector.addEventListener("touchstart", startDraggingX, false);
    sliderSelector.addEventListener("touchend", stopDragging, false);
  }
}
